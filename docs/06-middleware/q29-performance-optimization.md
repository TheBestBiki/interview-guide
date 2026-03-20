# Q29: 如何保证接口性能？性能优化手段？

## 性能优化层次

| 层次 | 优化手段 |
|------|----------|
| 数据库 | 索引、SQL优化、分库分表 |
| 缓存 | 多级缓存、热点数据预加载 |
| 异步 | MQ削峰、线程池并行 |
| 代码 | 算法优化、减少对象创建 |
| 架构 | 读写分离、微服务拆分 |

## 接口耗时分布

```
接口耗时：
├── DNS解析：1-5ms
├── TCP连接：5-10ms
├── SSL握手：10-20ms
├── 服务器处理：50-500ms
├── 数据库查询：10-200ms
├── 外部调用：50-500ms
└── 网络传输：10-50ms

优化重点：数据库 + 外部调用
```

## SQL优化

```sql
-- 1. 避免SELECT *
-- 2. 避免函数运算
WHERE YEAR(create_time) = 2024  ❌
WHERE create_time >= '2024-01-01'  ✓

-- 3. 批量操作
INSERT INTO ... VALUES (...), (...), (...)  ✓

-- 4. 分页优化
LIMIT 100000, 20  ❌
WHERE id > 100000 LIMIT 20  ✓
```

## 并行处理

```java
// 串行改并行
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> getUser(userId));
CompletableFuture<List<Order>> orderFuture = CompletableFuture.supplyAsync(() -> getOrders(userId));
CompletableFuture<List<Address>> addrFuture = CompletableFuture.supplyAsync(() -> getAddrs(userId));

CompletableFuture.allOf(userFuture, orderFuture, addrFuture).join();
// 总耗时：max(50,100,50) = 100ms
```

## 异步处理

```java
// 消息队列解耦
mqTemplate.convertAndSend("order:created", orderEvent);

// Spring @Async
@Async
public void sendNotification(User user) {
    // 发送短信/邮件
}
```
