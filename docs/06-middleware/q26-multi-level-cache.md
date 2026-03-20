# Q26: 如何设计一个多级缓存架构？

## 多级缓存架构

```
请求 → Nginx本地缓存 → JVM本地缓存 → Redis缓存 → 数据库
              ↓              ↓              ↓           ↓
           100QPS        1000QPS       10000QPS    100000QPS
           
缓存命中率：
Nginx本地缓存：30%
JVM本地缓存：50%
Redis缓存：15%
数据库：5%
```

## 各层缓存特点

| 层级 | 技术 | 容量 | 速度 | 适用场景 |
|------|------|------|------|----------|
| Nginx | Lua/Shared Dict | 几百MB | 最快 | 热点数据 |
| JVM | Caffeine/Guava | 几GB | 快 | 不常变更数据 |
| Redis | 集群/哨兵 | TB级 | 较快 | 分布式缓存 |
| 本地文件 | 磁盘 | 无限制 | 慢 | 静态资源 |

## Caffeine使用

```java
Cache<String, User> cache = Caffeine.newBuilder()
    .maximumSize(10000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .expireAfterAccess(5, TimeUnit.MINUTES)
    .refreshAfterWrite(1, TimeUnit.MINUTES)
    .recordStats()
    .build();

User user = cache.get("user:1", () -> dbQuery("user:1"));
```

## 多级缓存更新策略

```java
// Cache-Aside模式
// 读：Cache → Redis → DB
// 写：DB → Redis → 本地缓存（删除）

public void updateUser(User user) {
    userMapper.updateById(user);
    redisTemplate.delete("user:" + user.getId());
    localCache.invalidate("user:" + user.getId());
}
```

## 缓存异常处理

```java
// 降级处理
public User getUser(Long id) {
    User user = jvmCache.get(id);
    if (user != null) return user;
    
    user = redisTemplate.opsForValue().get("user:" + id);
    if (user != null) {
        jvmCache.put(id, user);
        return user;
    }
    
    user = userMapper.selectById(id);
    return user;
}
```
