# Q13: 分库分表后，跨片查询如何解决？

## 跨片查询问题

分库分表后，数据分散在多个库/表中，常见的跨片查询场景：
- **分页查询**：需要汇总多个分片的结果
- **排序**：需要归并排序
- **聚合统计**：count、sum、avg等
- **多维度查询**：非分片键查询

## 解决方案

### ① 异构索引表（推荐）

```sql
-- 订单表按user_id分片
-- 异构索引表：按order_id分片存储

-- 查询时：
-- 1. 先查索引表获取分片路由信息
SELECT shard_id FROM order_index WHERE order_id = 'order123';
-- 2. 再到对应分片查询订单详情
SELECT * FROM order_01 WHERE order_id = 'order123';
```

### ② 冗余存储

```sql
-- 订单库：user_id分片
-- 冗余：按商家维度也存储一份
SELECT * FROM order_by_seller_01 WHERE seller_id = 'seller123';
```

### ③ 监听Binlog同步

```java
// 使用Canal监听订单库变更
// 同步到Elasticsearch

POST /orders/_search
{
  "query": {"bool": {"must": [{"term": {"status": "PAID"}}]}},
  "from": 0, "size": 20
}
```

## 分页优化最佳实践

```java
// 假分页（游标分页）优于真分页

// 假分页：根据上一页最后一条的ID查询
SELECT * FROM order_{shard}
WHERE id > #{lastId}
ORDER BY id ASC
LIMIT 20;

// 而非：
SELECT * FROM order_{shard}
ORDER BY create_time DESC
LIMIT 100000, 20;  // 越往后越慢
```
