# Q13: Spring事务@Transactional深度剖析

> Spring事务是面试高频考点，本文全面解析@Transactional的生效原理、失效场景及最佳实践

---

## 一、核心原理

### 1.1 @Transactional如何生效？

Spring事务本质是**AOP（面向切面编程）**的应用：

```java
// 你的Service方法
@Transactional
public void transfer(String from, String to, BigDecimal amount) {
    // 业务逻辑
}
```

**背后实际发生的事：**

```
调用方法
    ↓
Spring AOP 拦截（生成代理对象）
    ↓
开启事务（Connection.setAutoCommit(false)）
    ↓
执行业务逻辑
    ↓
正常 → 提交事务（Connection.commit()）
异常 → 回滚事务（Connection.rollback()）
```

### 1.2 代理对象的创建

```java
@Service
public class OrderService {
    @Transactional
    public void createOrder() {
        // 这里this调用的是原始对象，不是代理对象！
        this.innerMethod();  // 事务不会生效
    }
    
    @Transactional
    public void innerMethod() {
        // 事务生效
    }
}
```

**追问：为什么this调用不生效？**

因为`this`指向的是**原始对象**，而不是Spring生成的**代理对象**。只有代理对象才有事务切面。

---

## 二、事务传播行为

### 2.1 七种传播行为

| 传播行为 | 说明 | 常见场景 |
|----------|------|----------|
| **REQUIRED** (默认) | 有事务则加入，没有则新建 | 大多数业务 |
| **REQUIRES_NEW** | 总是新建事务，挂起外部事务 | 日志记录（即使外部失败也要记录） |
| **SUPPORTS** | 有事务则加入，没有则以非事务运行 | 查询方法 |
| **NOT_SUPPORTS** | 以非事务运行，有事务则挂起 |  |
| **MANDATORY** | 必须有事务，否则抛异常 |  |
| **NEVER** | 必须无事务，否则抛异常 |  |
| **NESTED** | 嵌套事务（Savepoint） |  |

### 2.2 REQUIRED vs REQUIRES_NEW 对比

```java
@Service
public class AService {
    @Transactional
    public void methodA() {
        bService.methodB();  // 调用B
        throw new RuntimeException("A失败");
    }
}

@Service
public class BService {
    @Transactional
    public void methodB() {
        // 业务逻辑
    }
}
```

| 传播行为 | methodB的事务 | methodA失败后 |
|----------|---------------|--------------|
| REQUIRED | 加入methodA的事务 | 一起回滚 |
| REQUIRES_NEW | 独立新建事务 | 提交成功 |

---

## 三、失效场景大全

### 3.1 场景一：方法不是public

```java
@Service
public class UserService {
    // ❌ 失效：private方法
    @Transactional
    private void updateUser() {
        // 不会生效
    }
    
    // ✅ 生效：public方法
    @Transactional
    public void updateUser() {
        // 正常生效
    }
}
```

**原因**：Spring AOP的代理是基于接口/类的，private方法无法被代理。

### 3.2 场景二：自调用（this调用）

```java
@Service
public class OrderService {
    
    public void createOrder() {
        // ❌ 失效：this调用
        this.innerSave();
    }
    
    @Transactional
    public void innerSave() {
        // 不会生效
    }
}
```

**解决方案：**

```java
@Service
public class OrderService {
    
    // 方案A：注入自己
    @Autowired
    private OrderService self;
    
    public void createOrder() {
        self.innerSave();  // 通过代理对象调用
    }
    
    // 方案B：AopContext.currentProxy()
    @EnableAspectJAutoProxy(exposeProxy = true)
    public void createOrder() {
        ((OrderService)AopContext.currentProxy()).innerSave();
    }
}
```

### 3.3 场景三：异常被catch吞掉

```java
@Service
public class UserService {
    
    @Transactional
    public void update() {
        try {
            // 业务逻辑
        } catch (Exception e) {
            // ❌ 失效：异常被捕获，未重新抛出
            log.error("失败", e);
        }
    }
}
```

**原因**：Spring判断是否回滚是基于**异常是否被抛出到外层**。

**解决方案：**

```java
@Transactional
public void update() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        // 方案A：重新抛出
        throw new RuntimeException("更新失败", e);
        
        // 方案B：指定回滚异常
        // 默认只回滚RuntimeException，需要显式指定
    }
}

// 指定回滚异常类型
@Transactional(rollbackFor = Exception.class)
```

### 3.4 场景四：异常类型不匹配

```java
@Transactional
public void update() {
    try {
        // 业务逻辑
    } catch (IOException e) {
        // ❌ 默认只回滚RuntimeException
        // IOException不会触发回滚
    }
}
```

**解决方案：**

```java
// 方案A：指定回滚异常
@Transactional(rollbackFor = IOException.class)

// 方案B：回滚所有异常
@Transactional(rollbackFor = Exception.class)
```

### 3.5 场景五：多数据源（分布式事务）

```java
@Service
public class OrderService {
    
    @Autowired
    private UserMapper userMapper;  // MySQL
    
    @Autowired
    private AccountMapper accountMapper;  // 另一个MySQL
    
    @Transactional  // ❌ 只能保证MySQL本地事务
    public void create() {
        userMapper.insert(user);      // MySQL事务
        accountMapper.insert(account); // 另一个MySQL，不会一起回滚
    }
}
```

**解决方案**：使用Seata等分布式事务框架

### 3.6 场景六：传播行为配置错误

```java
@Service
public class AService {
    
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void methodA() {
        // ❌ 以非事务运行
    }
}

@Service  
public class BService {
    
    @Transactional
    public void methodB() {
        aService.methodA();  // A不会加入事务
    }
}
```

### 3.7 场景七：方法没有被Spring管理

```java
// ❌ 失效：没有被Spring管理的类
public class UserService {
    
    @Transactional
    public void update() {
        // Spring无法拦截，事务不会生效
    }
}

// ✅ 生效
@Service
public class UserService {
    
    @Transactional
    public void update() {
        // 正常生效
    }
}
```

### 3.8 场景八：类内部直接new对象

```java
@Service
public class OrderService {
    
    public void create() {
        // ❌ 失效：new的对象不是Spring管理的
        UserService userService = new UserService();
        userService.update();
    }
}
```

---

## 四、事务隔离级别

### 4.1 @Transactional的isolation参数

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void update() {
    // 使用RC隔离级别
}
```

| 隔离级别 | 说明 |
|----------|------|
| DEFAULT | 使用数据库默认（MySQL是RR） |
| READ_UNCOMMITTED | 读未提交 |
| READ_COMMITTED | 读已提交 |
| REPEATABLE_READ | 可重复读 |
| SERIALIZABLE | 串行化 |

### 4.2 隔离级别与MVCC

**追问：@Transactional(isolation = READ_COMMITTED) 和 MVCC的关系？**

| 隔离级别 | ReadView生成时机 |
|----------|------------------|
| READ_COMMITTED | 每次SELECT都生成新ReadView |
| REPEATABLE_READ | 事务第一次SELECT时生成 |

---

## 五、事务超时与回滚规则

### 5.1 timeout参数

```java
@Transactional(timeout = 30)  // 30秒超时
public void longOperation() {
    // 如果30秒还没完成，自动回滚
}
```

### 5.2 rollbackFor vs noRollbackFor

```java
// 指定哪些异常必须回滚
@Transactional(rollbackFor = {BusinessException.class, IOException.class})

// 指定哪些异常不回滚
@Transactional(noRollbackFor = {BusinessException.class})
```

### 5.3 默认回滚规则

| 异常类型 | 默认行为 |
|----------|----------|
| RuntimeException | 自动回滚 |
| Error | 自动回滚 |
| Checked Exception | 默认不回滚 |

---

## 六、事务失效的底层原因

### 6.1 Spring事务原理图

```
┌─────────────────────────────────────────────────────────┐
│                     代理对象                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  @Transactional                                  │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │         目标对象（原始对象）                │  │   │
│  │  │         业务逻辑代码                        │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 6.2 失效的本质

**所有失效场景都可以归结为一个原因：**

> **没有经过Spring的事务代理**

| 失效场景 | 为什么没有经过代理 |
|----------|-------------------|
| private方法 | 代理无法访问private方法 |
| this调用 | this是原始对象，不是代理 |
| catch吞异常 | 异常没有抛到代理层 |
| new对象 | 不是Spring管理的bean |

---

## 七、最佳实践

### 7.1 推荐写法

```java
@Service
@Slf4j
public class OrderService {
    
    // 1. 尽量用在public方法上
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderDTO dto) {
        // 2. 业务逻辑尽量简洁
        // 3. 不要在事务内做远程调用/文件IO
        // 4. 明确指定回滚异常类型
        
        validate(dto);
        saveOrder(dto);
        notifyCustomer(dto);
    }
    
    // 5. 查询方法使用SUPPORTS或READ_ONLY
    @Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
    public Order getOrder(Long id) {
        return orderMapper.selectById(id);
    }
}
```

### 7.2 常见错误

| 错误写法 | 问题 | 正确写法 |
|----------|------|----------|
| @Transactional放在private方法 | 不生效 | 放在public方法 |
| catch后不抛异常 | 不回滚 | throw或指定rollbackFor |
| 开启多数据源但只用@Transactional | 分布式事务失效 | 使用Seata |
| 事务内做RPC调用 | 长时间占用连接 | 移到事务外 |

### 7.3 事务注解失效速查表

| 场景 | 是否生效 | 原因 |
|------|----------|------|
| public方法 + 正常调用 | ✅ | 经过代理 |
| private方法 | ❌ | 代理无法访问 |
| this.方法名() | ❌ | 调用原始对象 |
| catch吞异常 | ❌ | 异常未抛到外层 |
| 非RuntimeException | ❌ | 默认不回滚 |
| private方法 + catch | ❌ | 双重失效 |
| 新建对象调用 | ❌ | 非Spring管理 |
| 多数据源跨库 | ❌ | 本地事务无法覆盖 |

---

## 八、面试追问汇总

1. **@Transactional原理是什么？** → AOP代理，方法前后开启/提交/回滚事务
2. **为什么this调用不生效？** → this是原始对象，不是代理对象
3. **如何解决自调用问题？** → 注入自己或AopContext.currentProxy()
4. **catch异常后事务为什么不回滚？** → 异常没有抛到代理层，Spring检测不到
5. **默认回滚哪些异常？** → RuntimeException和Error
6. **如何让checked exception回滚？** → rollbackFor = Exception.class
7. **REQUIRED和REQUIRES_NEW的区别？** → 加入事务 vs 独立事务
8. **多数据源下@Transactional能回滚吗？** → 不能，需要分布式事务
9. **private方法加@Transactional有效吗？** → 无效
10. **readOnly=true有什么作用？** → 优化，可能不开启事务、允许从库查询
11. **timeout参数的作用？** → 事务超时自动回滚
12. **NESTED和REQUIRED的区别？** → NESTED使用Savepoint，可部分回滚
13. **事务传播行为怎么选？** → 业务方法决定，主流程用REQUIRED，辅助用REQUIRES_NEW
14. **为什么互联网公司慎用@Transactional？** → 事务边界难控，容易长事务导致锁表
15. **事务内的连接何时释放？** → 事务提交或回滚后
16. **@Transactional放在Controller层可以吗？** → 可以但不推荐，事务边界应在Service层