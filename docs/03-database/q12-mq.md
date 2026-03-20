# Q12: 消息队列如何保证消息不丢失？如何处理重复消费？

## 消息丢失场景与解决方案

| 场景 | 原因 | 解决方案 |
|------|------|----------|
| 生产者丢失 | 网络异常、Broker故障 | confirm机制、失败重试 |
| MQ丢失 | Broker故障 | 持久化+副本机制 |
| 消费者丢失 | 消费前崩溃、未ack | 手动ack、幂等处理 |

## RabbitMQ消息确认

### 生产者confirm

```java
channel.confirmSelect();
channel.addConfirmListener((ack, tag) -> {
    // 消息成功到达Broker
}, (ack, tag) -> {
    // 消息失败，重试发送
});
```

### 消费者手动ack

```java
@RabbitListener(queues = "orderQueue")
public void handleOrder(Order order, Channel channel, 
                       @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    try {
        channel.basicAck(tag, false);  // 确认消费
    } catch (Exception e) {
        channel.basicNack(tag, false, true);  // 拒绝消费，requeue=true
    }
}
```

## Kafka消息不丢失

```java
props.put("acks", "all");        // 所有副本确认
props.put("retries", 3);         // 重试3次
props.put("enable.idempotence", true);  // 幂等性
```

## 消息重复消费（幂等处理）

### ① 数据库唯一约束

```sql
ALTER TABLE order_message ADD UNIQUE INDEX idx_msg_id (message_id);

INSERT INTO order_message (message_id, order_id, status) 
VALUES ('msg123', 'order1', 'PROCESSED')
ON DUPLICATE KEY UPDATE status = 'PROCESSED';
```

### ② Redis幂等

```java
Boolean success = redisTemplate.opsForValue()
    .setIfAbsent("consumer:" + messageId, "1", 10, TimeUnit.MINUTES);
if (!success) {
    return; // 重复消息，直接返回
}
```
