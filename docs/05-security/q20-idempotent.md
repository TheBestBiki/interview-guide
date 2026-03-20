# Q20: 接口幂等如何实现？

## 幂等场景

- 前端重复点击
- MQ消息重复消费
- 服务重试
- 浏览器后退重新提交

## 幂等实现方案

### ① 数据库唯一约束（推荐）

```sql
CREATE TABLE order_idempotent (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    biz_no VARCHAR(64) NOT NULL UNIQUE COMMENT '业务单据号',
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    result TEXT COMMENT '处理结果',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

```java
public OrderResult createOrder(Order order) {
    try {
        idempotentService.tryLock(order.getOrderNo(), "PROCESSING");
        OrderResult result = doCreateOrder(order);
        idempotentService.updateStatus(order.getOrderNo(), "SUCCESS", result);
        return result;
    } catch (DuplicateKeyException e) {
        return idempotentService.getResult(order.getOrderNo());
    }
}
```

### ② Redis防重

```java
public boolean checkIdempotent(String bizNo) {
    Boolean success = redisTemplate.opsForValue()
        .setIfAbsent("idempotent:" + bizNo, "1", 30, TimeUnit.MINUTES);
    return success;
}
```

### ③ 乐观锁

```sql
UPDATE inventory 
SET stock = stock - #{count}, version = version + 1 
WHERE product_id = #{productId} AND stock >= #{count} AND version = #{version}
```

### ④ 分布式锁

```java
RLock lock = redisson.getLock("order:" + orderNo);
lock.lock(10, TimeUnit.SECONDS);
try {
    OrderResult result = doCreateOrder(order);
    return result;
} finally {
    lock.unlock();
}
```

## 面试加分回答

"接口幂等是防止重复提交的核心。我的方案是：1）插入订单等写操作，用防重表+唯一约束；2）库存扣减用乐观锁；3）支付回调用消息ID防重；4）通用接口用Redis防重Key。"
