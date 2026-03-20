# Q27: 分库分表后ID如何生成？分布式ID？

## 分库分表后ID问题

- 自增ID会冲突
- 需要全局唯一
- 需要支持有序（利于分页）

## 分布式ID方案

### ① UUID

```java
String id = UUID.randomUUID().toString();
// 优点：无中心化
// 缺点：无序、太长
```

### ② 数据库号段（推荐）

```sql
CREATE TABLE id_generator (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    biz_type VARCHAR(50) NOT NULL,
    max_id BIGINT NOT NULL DEFAULT 1,
    step INT NOT NULL DEFAULT 1000
);
```

```java
public Long getId(String bizType) {
    IdGenerator generator = mapper.selectOne(...);
    mapper.updateMaxId(generator.getId(), generator.getStep());
    return generator.getMaxId();
}
```

### ③ 雪花算法（推荐）

```java
// 64位：1位符号 + 41位时间戳 + 10位机器ID + 12位序列号
public class SnowflakeIdWorker {
    private long workerId;
    private long sequence = 0;
    
    public synchronized long nextId() {
        long timestamp = timeGen();
        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨");
        }
        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & 4095;
        } else {
            sequence = 0;
        }
        lastTimestamp = timestamp;
        return (timestamp - 1288834974657L) << 22
             | (workerId << 12)
             | sequence;
    }
}
```

## 分库分表ID设计

```java
// 雪花算法 + 分片标识
long id = (timestamp << 22) | (shardId << 12) | sequence;
```
