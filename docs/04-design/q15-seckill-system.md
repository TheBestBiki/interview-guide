# Q15: 如何设计一个高并发抢票/秒杀系统？

## 秒杀系统核心挑战

- **高并发**：瞬时流量是正常流量的100-1000倍
- **超卖**：库存有限，如何保证不超卖
- **恶意请求**：黄牛刷票、接口防刷
- **用户体验**：库存不足时如何优雅处理

## 架构设计

```
用户请求
    ↓
CDN（静态资源）
    ↓
Gateway（限流、鉴权）
    ↓
验证码/答题（拦截黄牛）
    ↓
秒杀服务（库存校验）
    ↓
消息队列（异步下单）
    ↓
库存服务（扣减库存）
    ↓
订单服务（创建订单）
```

## 核心技术方案

### ① 库存预热（热点数据）

```java
// 秒杀开始前，将库存加载到Redis
public void preloadSeckillStock(Long productId, Integer stock) {
    redisTemplate.opsForValue().set("seckill:stock:" + productId, stock);
}

// Lua脚本原子扣减
String script = 
    "if redis.call('decr', KEYS[1]) >= 0 then " +
    "    return 1 " +
    "else " +
    "    redis.call('incr', KEYS[1]) " +
    "    return 0 " +
    "end";
```

### ② 分布式锁防超卖

```java
RLock lock = redisson.getLock("seckill:lock:" + productId);
lock.lock(10, TimeUnit.SECONDS);
try {
    Integer stock = Integer.parseInt(redisTemplate.opsForValue()
        .get("seckill:stock:" + productId));
    if (stock <= 0) {
        return Result.error("已售罄");
    }
    redisTemplate.opsForValue().decrement("seckill:stock:" + productId);
    mqTemplate.convertAndSend("seckill:order", orderMessage);
} finally {
    lock.unlock();
}
```

### ③ 接口限流防刷

```java
@SentinelResource(value = "seckill", 
    blockHandler = "seckillBlockHandler",
    fallback = "seckillFallback")
public Result seckill(Long productId) {
    // 秒杀逻辑
}
```

## 关键点总结

- **限流**：Sentinel + 验证码
- **缓存**：Redis库存预热
- **原子**：Lua脚本保证库存扣减原子性
- **锁**：分布式锁防止重复购买
- **异步**：MQ削峰填谷
- **幂等**：消息ID防重
