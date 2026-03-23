# Q10: MyBatis原理深度剖析

## 一、整体架构

### 1.1 核心组件

MyBatis四大核心组件协同工作：

```
SqlSessionFactory → SqlSession → Executor → StatementHandler
     ↓                    ↓          ↓            ↓
  Configuration    SQL语句     SQL执行      参数/结果映射
```

| 组件 | 职责 |
|------|------|
| SqlSessionFactory | 读取配置，创建SqlSession |
| SqlSession | 对外提供CRUD API，作为门面 |
| Executor | 真正执行SQL的调度者 |
| StatementHandler | JDBC语句处理器 |

### 1.2 工作流程

1. **启动阶段**：加载mybatis-config.xml和Mapper.xml → 解析为Configuration
2. **运行阶段**：SqlSessionFactory创建SqlSession → 获取Mapper → 执行SQL
3. **执行阶段**：Executor → StatementHandler → ParameterHandler → ResultSetHandler

---

## 二、Mapper接口绑定原理（深度追问）

### 2.1 为什么Mapper接口没有实现类却能调用？

**原理**：MyBatis使用JDK动态代理，在运行期为Mapper接口生成代理对象。

```java
// 实际上是这样工作的
UserMapper mapper = sqlSession.getMapper(UserMapper.class);
// 返回的是 com.apache.ibatis.binding.MapperProxy@xxx
```

**追问1：MapperProxy的invoke方法做了什么？**

```java
// MapperProxy.invoke() 核心逻辑
public Object invoke(Object proxy, Method method, Object[] args) {
    // 1. 获取MapperMethod
    MapperMethod mapperMethod = cachedMapperMethod(method);
    
    // 2. 执行SQL
    return mapperMethod.execute(sqlSession, args);
}
```

**追问2：如何找到对应的SQL？**

- Mapper接口全限定名 + 方法名 = MappedStatement的ID
- 从Configuration中根据key查找：`namespace + "." + methodName`

**追问3：返回值的处理逻辑？**

```java
// 根据返回类型选择不同的处理方式
if (method.getReturnType() == void.class) {
    // UPDATE/DELETE，返回null
} else if (Collection.class.isAssignableFrom(returnType)) {
    // SELECT，返回集合
} else if (method.getReturnType() == Map.class) {
    // SELECT，返回Map
} else {
    // SELECT，返回单个对象
}
```

---

## 三、Executor执行器（深度追问）

### 3.1 三种执行器区别

| 执行器 | 特点 | 适用场景 |
|--------|------|----------|
| SimpleExecutor | 每次执行创建新的Statement | 默认 |
| ReuseExecutor | 复用Statement对象 | 重复SQL多 |
| CachingExecutor | 二级缓存装饰器 | 需要缓存 |

**追问：执行器如何选择？**

在mybatis-config.xml中配置：
```xml
<configuration>
    <settings>
        <setting name="defaultExecutorType" value="REUSE"/>
    </settings>
</configuration>
```

### 3.2 一级缓存 vs 二级缓存

**一级缓存（SqlSession级别）**

```java
// 同一个SqlSession中，两次查询相同数据
User u1 = userMapper.selectById(1);  // 查数据库
User u2 = userMapper.selectById(1);  // 查缓存
// u1 == u2 为 true
```

**追问1：一级缓存何时失效？**
- SqlSession关闭
- 执行了增删改操作（即使不同数据）
- 手动调用clearCache()

**追问2：为什么增删改会清空一级缓存？**
因为增删改可能导致数据变化，需要保证查询结果是最新的。

**二级缓存（Mapper namespace级别）**

```xml
<!-- 开启二级缓存 -->
<mapper namespace="com.xxx.UserMapper">
    <cache/>
    ...
</mapper>
```

**追问3：二级缓存的坑**

1. **脏读问题**：如果多个SqlSession操作同一数据，二级缓存可能不一致
   
   ```java
   // 场景：SqlSession1修改了数据，但未提交
   SqlSession1.update("updateUser", user);
   // SqlSession2查询，可能读到脏数据
   ```

2. **解决方案**：使用`flushCache="true"`或在commit后查询

3. **失效时机**：
   - 增删改操作会清空该namespace下的所有缓存
   - 手动调用`sqlSession.clearCache()`

### 3.3 缓存原理

```java
// CachingExecutor.query() 核心流程
public <E> List<E> query(MappedStatement ms, Object parameterObject, 
                         RowBounds rowBounds, ResultHandler resultHandler) {
    // 1. 生成缓存Key
    CacheKey key = createCacheKey(ms, parameterObject, rowBounds);
    
    // 2. 查缓存
    List<E> list = (List<E>) delegation.getObject(key);
    if (list != null) {
        return list;  // 命中缓存
    }
    
    // 3. 查数据库
    list = delegate.query(ms, parameterObject, rowBounds, resultHandler);
    
    // 4. 放入缓存
    tcm.putObject(key, list);
    return list;
}
```

---

## 四、StatementHandler（深度追问）

### 4.1 SQL执行流程

```
SqlSession.select() 
    → Executor.query() 
        → StatementHandler.prepare()      // 预处理SQL
        → StatementHandler.parameterize() // 参数绑定
        → StatementHandler.query()        // 执行查询
        → ResultSetHandler.handleResults() // 结果映射
```

### 4.2 #{} vs ${} 深度理解

**#{}：预处理参数**

```java
// #{} 生成PreparedStatement，参数用?占位
SELECT * FROM user WHERE id = ?

// 执行时会调用 setInt(1, id)
```

**追问1：#{}如何防止SQL注入？**

因为参数被作为占位符传入，永远被当作字符串，不会被解释为SQL的一部分。

**${}：字符串替换**

```java
// ${} 直接替换，会产生如下SQL
SELECT * FROM user ORDER BY id DESC
// 如果传入 "id; DROP TABLE user;" 则危险
```

**追问2：${}的使用场景？**

- 动态表名：`SELECT * FROM ${tableName}`
- 动态列名：`SELECT ${columnName} FROM table`
- ORDER BY子句

### 4.3 参数映射流程

```java
// PreparedStatementHandler.parameterize()
public void parameterize(Statement statement) throws SQLException {
    // 获取参数处理器
    ParameterHandler handler = mappingStatement.getParameterHandler();
    // 绑定参数
    handler.setParameters((PreparedStatement) statement);
}
```

**追问：TypeHandler在哪里起作用？**

```java
// DefaultParameterHandler.setParameters()
for (ParamMapping param : paramMappings) {
    Object value;
    // 获取参数值
    if (boundParams != null) {
        value = boundParams.get(param.name);
    }
    
    // TypeHandler转换：Java类型 → JDBC类型
    TypeHandler typeHandler = param.typeHandler;
    typeHandler.setParameter(ps, param.javaType, value, param.jdbcType);
}
```

---

## 五、插件机制（深度追问）

### 5.1 四大可拦截对象

| 对象 | 可拦截方法 |
|------|-------------|
| Executor | update, query, commit, rollback |
| StatementHandler | prepare, parameterize, query, update |
| ParameterHandler | getParameterObject, setParameters |
| ResultSetHandler | handleResultSets, handleOutputParameters |

### 5.2 插件原理

**追问1：插件如何拦截方法？**

使用责任链模式 + 动态代理：

```java
// 插件实际是包装了一层代理
target = Executor → Plugin(Executor) → Plugin(Executor) → 原始Executor
```

**追问2：多个插件的执行顺序？**

- 按配置顺序，依次包装
- 执行时反向解包（最后配置的先执行）

```xml
<!-- 配置顺序：插件1 -> 插件2 -->
<!-- 执行顺序：插件2 -> 插件1 -> 原始对象 -->
```

### 5.3 自定义插件示例

```java
@Intercepts({
    @Signature(type = Executor.class, method = "query", 
               args = {MappedStatement.class, Object.class})
})
public class MyInterceptor implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) {
        // 前置处理
        long start = System.currentTimeMillis();
        
        // 执行原方法
        Object result = invocation.proceed();
        
        // 后置处理
        System.out.println("耗时:" + (System.currentTimeMillis() - start));
        return result;
    }
}
```

---

## 六、面试追问汇总

1. **Mapper接口没有实现类，为什么能调用？** → 动态代理
2. **动态代理的invoke方法做了什么？** → 获取MapperMethod，执行SQL
3. **MapperMethod怎么找到SQL？** → namespace + methodName 作为key查找MappedStatement
4. **一级缓存何时失效？** → 关闭SqlSession、执行增删改、clearCache
5. **为什么增删改会清空一级缓存？** → 保证数据一致性
6. **#{}如何防SQL注入？** → 参数作为占位符，永不解释为SQL
7. **${}有哪些使用场景？** → 动态表名、动态列名、ORDER BY
8. **插件如何实现拦截？** → 责任链模式 + 动态代理
9. **多个插件的执行顺序？** → 配置顺序正向，执行时反向
10. **MyBatis的三种Executor区别？** → Simple/Reuse/Caching