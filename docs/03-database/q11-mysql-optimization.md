# Q11: MySQL索引优化？分库分表？如何实现平滑迁移？

## 索引优化

### 索引类型
- **B+树索引**：默认索引，范围查询好
- **哈希索引**：等值查询快，无法范围查询
- **全文索引**：文本搜索

### 索引设计原则
- **选择区分度高的列**：区分度 = count(distinct col)/count(*)
- **覆盖索引**：select的列都在索引中，避免回表
- **最左前缀原则**：复合索引从左到右使用

### 索引优化案例

```sql
-- 优化前：全表扫描
SELECT * FROM orders WHERE YEAR(create_time) = 2024 AND status = 'PAID';

-- 优化后：使用范围列+覆盖索引
ALTER TABLE orders ADD INDEX idx_status_create (status, create_time);
SELECT id, create_time, amount FROM orders 
WHERE status = 'PAID' AND create_time >= '2024-01-01';
```

## 分库分表

### 何时需要分库分表？
- 单表数据量超过1000万
- 单库数据量超过5000万
- QPS超过单机MySQL承载能力

### 分片策略
- **哈希分片**：user_id % n，均匀分布
- **范围分片**：按时间/ID范围
- **一致性哈希**：减少扩容影响

## 平滑迁移方案

1. **评估容量**：分析数据增长，预估未来3年数据量
2. **双写方案**：同时写入旧库和新库
3. **数据同步**：使用Canal监听Binlog同步历史数据
4. **校验一致性**：定时比对新旧库数据
5. **切换流量**：切换读流量到新库，最后切换写流量
6. **灰度回滚**：保留旧库一段时间，随时可回滚
