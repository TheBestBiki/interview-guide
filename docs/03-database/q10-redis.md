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
public class RedisLock {
    
    public boolean tryLock(String key, String value, long expireTime) {
        return "OK".equals(jedis.set(key, value, "NX", "PX", expireTime));
    }
    
    public void unlock(String key, String value) {
        // Lua脚本：只有持有锁的线程才能释放
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                        "return redis.call('del', KEYS[1]) else return 0 end";
        jedis.eval(script, Collections.singletonList(key), Collections.singletonList(value));
    }
}

// 使用
redisLock.tryLock("order:lock", "thread1", 30000);
try {
    // 业务逻辑
} finally {
    redisLock.unlock("order:lock", "thread1");
}
```

### Redisson分布式锁（推荐）

```java
@Autowired
private RedissonClient redisson;

public void seckill() {
    RLock lock = redisson.getLock("seckill:product:" + productId);
    lock.lock();
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
}

// 可重入锁
RLock lock1 = redisson.getLock("myLock");
lock1.lock();
try {
    // 嵌套使用自动重入
    RLock lock2 = redisson.getLock("myLock");
    lock2.lock();
    try {
        
    } finally {
        lock2.unlock();
    }
} finally {
    lock1.unlock();
}
```

### Redisson锁的核心特性

- **可重入**：同一线程可多次获取锁
- **Watchdog自动续期**：默认30秒锁超时，自动续期
- **公平锁**：支持公平锁模式
- **读写锁**：支持RLock和RReadWriteLock

## Redis高可用方案

### ① 主从复制
- 主节点写，从节点读
- 问题：主节点故障需要手动切换

### ② Redis Sentinel（哨兵）
- 自动故障转移
- 监控、通知、自动切换
- 推荐：至少3个哨兵节点

### ③ Redis Cluster（集群）
- 数据分片（16384个槽）
- 每个分片主从复制
- 支持高并发、水平扩展

## 面试加分回答

"在我们公司项目中，我们使用Redisson实现分布式锁，它支持可重入、watchdog自动续期、公平锁等功能。对于高可用，Redis Cluster采用槽分片，每个分片配置主从，确保单节点故障不影响服务。在我们公司电子商城秒杀场景中，我们用Redis分布式锁+lua脚本保证库存扣减的原子性，配合Redis Cluster扛住高并发。"
