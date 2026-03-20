# Q21: Redis缓存问题？雪崩、击穿、布隆过滤器？

## 缓存三大问题

### ① 缓存穿透（查询不存在的数据）

问题：大量请求查询不存在的数据，直接打到数据库

**方案一：空值缓存**
```java
if (result == null) {
    redisTemplate.opsForValue().set(key, "NULL", 5, TimeUnit.MINUTES);
}
```

**方案二：布隆过滤器（推荐）**
```java
BloomFilter<String> filter = BloomFilter.create(
    Funnels.stringFunnel(UTF_8),
    1000000,  // 预期数据量
    0.01      // 误判率
);

// 查询前先检查
if (filter.mightContain("user:1001")) {
    // 可能存在，再查Redis/DB
}
```

### ② 缓存击穿（热点key过期）

问题：某个热点key过期，瞬间大量请求打到数据库

**方案：分布式锁**
```java
RLock lock = redisson.getLock("lock:" + key);
lock.lock();
try {
    String value = redisTemplate.opsForValue().get(key);
    if (value == null) {
        value = dbQuery(key);
        redisTemplate.opsForValue().set(key, value, 10, TimeUnit.MINUTES);
    }
} finally {
    lock.unlock();
}
```

### ③ 缓存雪崩（大量key过期）

问题：大量key同时过期，请求打到数据库

**方案：随机过期时间**
```java
int expireSeconds = baseExpire + new Random().nextInt(300);
```

## 缓存一致性

```java
// 双写模式
@Transactional
public void updateUser(User user) {
    userMapper.updateById(user);
    redisTemplate.delete("user:" + user.getId());
}
```
