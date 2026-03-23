# Q10: MyBatis原理

## 核心执行流程

### 1. 加载配置
- 解析 `mybatis-config.xml` 全局配置文件
- 解析 Mapper.xml 映射文件
- 将配置信息存入 `Configuration` 对象

### 2. 创建Executor
- SqlSessionFactory 创建 SqlSession
- SqlSession 持有 Configuration 和 Executor

### 3. SQL执行
- 调用 `selectOne` / `selectList` / `update` 等方法
- 通过 Executor 执行 CRUD 操作

## 四大核心对象

### 1. SqlSessionFactory
- 负责创建 SqlSession
- 解析全局配置文件，构建 Configuration

### 2. SqlSession
- 对外提供增删改查 API
- 内部委托给 Executor 执行

### 3. Executor
- 真正执行SQL的对象
- 负责创建Statement、参数映射、结果映射
- 类型：SimpleExecutor、ReuseExecutor、CachingExecutor

### 4. StatementHandler
- 处理JDBC Statement
- 参数绑定（PreparedStatement.setXXX）
- 结果集映射（ResultSet → Java对象）

## Mapper接口绑定原理

### 动态代理
```java
// MyBatis使用JDK动态代理
UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
// 实际返回的是代理对象
```

### 代理逻辑
1. 根据Mapper接口找到对应的 MapperStatement
2. 创建 ParameterMapping、ResultMap
3. 调用 Executor 执行SQL
4. 将结果集映射为目标类型

## SQL解析流程

### 1. #{} vs ${}
- **#{}**: 预处理参数，使用 PreparedStatement，防止SQL注入
- **${}**: 直接拼接字符串，有SQL注入风险

### 2. 类型处理器
- TypeHandler 负责 Java类型 → JDBC类型 的转换
- 内置常见类型处理器，自定义可实现 TypeHandler 接口

### 3. 一级缓存 vs 二级缓存

| 缓存 | 作用域 | 实现 |
|------|--------|------|
| 一级缓存 | SqlSession | PerpetualCache |
| 二级缓存 | Mapper namespace | CachingExecutor |

## 插件机制

### 四大对象可拦截
- Executor、StatementHandler、ParameterHandler、ResultSetHandler

### 原理
- 责任链模式 + 动态代理
- 按插件顺序依次拦截方法

### 使用场景
- 分页插件、SQL日志、读写分离