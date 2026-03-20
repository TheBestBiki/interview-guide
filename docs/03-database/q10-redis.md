# Q10: Redis的数据结构？分布式锁？如何保证高可用？

## 五大基本数据结构

| 类型 | 命令 | 应用场景 |
|------|------|----------|
| String | set/get/mset | 缓存、计数器、分布式锁 |
| List | lpush/rpush/lpop/rpop | 消息队列、列表 |
| Hash | hset/hget/hgetall | 对象存储、购物车 |
| Set | sadd/smembers/sismember | 去重、标签、好友关系 |
| ZSet | zadd/zrange/zrank | 排行榜、延时队列 |

## 高级数据结构

- **Bitmap**：位图，适合大数据量统计（活跃用户、布隆过滤器）
- **HyperLogLog**：基数统计，节省内存的UV统计
- **Geospatial**：地理位置附近的人、门店
- **Stream**：消息队列，消费组

## 分布式锁实现

### 最简单的分布式锁

```java
public boolean tryLock(String key, String value, long expireTime) {
    return "OK".equals(jedis.set(key, value, "NX", "PX", expireTime));
}

public void unlock(String key, String value) {
    String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) else return 0 end";
    jedis.eval(script, Collections.singletonList(key), Collections.singletonList(value));
}
```

### Redisson分布式锁（推荐）

```java
RLock lock = redisson.getLock("seckill:product:" + productId);
lock.lock();
try {
    // 业务逻辑
} finally {
    lock.unlock();
}
```

## Redis高可用方案

### ① 主从复制
- 主节点写，从节点读
- 问题：主节点故障需要手动切换

### ② Redis Sentinel（哨兵）
- 自动故障转移
- 推荐：至少3个哨兵节点

### ③ Redis Cluster（集群）
- 数据分片（16384个槽）
- 每个分片主从复制
- 支持高并发、水平扩展
