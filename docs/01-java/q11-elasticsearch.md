# Q11: Elasticsearch核心原理

## ES核心概念

### 与MySQL对比
| MySQL | ES |
|-------|-----|
| Database | Index |
| Table | Type |
| Row | Document |
| Column | Field |
| SQL | Query DSL |

### 集群架构
- **Master节点**: 负责集群管理、索引创建/删除、节点调度
- **Data节点**: 存储数据、执行CRUD操作
- **Coordinator节点**: 路由请求、聚合结果

## 倒排索引

### 什么是倒排索引
- 正排索引：文档ID → 文档内容
- 倒排索引：Term → 文档ID列表

### 结构
```
关键词1 → [doc1, doc5, doc9]
关键词2 → [doc2, doc7]
```

### 优势
- 查找效率高，O(1)复杂度
- 支持全文搜索

## 分片与副本

### 分片（Shard）
- 每个索引可划分为多个分片
- 主分片数创建后不可改，副本数可调

### 副本（Replica）
- 每个主分片可有多个副本
- 提高可用性和搜索吞吐量

### 路由机制
```
shard = hash(routing) % number_of_primary_shards
```

## 写入流程

### 1. 写入请求
- 写入Primary Shard → 同步到Replica Shards

### 2. 写入原理
- 写入内存Buffer + Translog
- 定期refresh生成Segment
- 定期flush到磁盘
- 定期mergeSegments

### 3. 可靠性保证
- Translog持久化
- 副本机制

## 搜索流程

### Query-Then-Fetch
1. **Query阶段**: 协调节点发送到所有分片，各分片执行查询返回Top N
2. **Fetch阶段**: 协调节点汇总结果，获取完整文档，返回客户端

### 相关性计算
- TF-IDF算法
- BM25算法（ES 5.0+默认）

## 深度分页问题

### 问题
- 深度分页（from+size很大）会导致性能问题
- 原因：每个分片都要获取from+size条数据，协调节点汇总排序

### 解决方案
- **scroll**: 适用于大数据量导出
- **search_after**: 游标分页，性能更好
- **pit (Point in Time)**: ES 7.0+推荐方案

## 聚合与桶

### 聚合分类
- **Metric**: avg, sum, max, min, cardinality
- **Bucket**: terms, range, date_histogram
- **Pipeline**: 聚合的聚合

### 使用场景
- 统计报表、日志分析、数据可视化

## 优化策略

### 写入优化
- 批量写入（bulk）
- 合理设置refresh_interval
- 减少字段数量

### 查询优化
- 禁用 wildcard 查询
- 合理使用路由
- 预热文件系统缓存

### 索引优化
- 使用合适的分片数
- 冷热分离
- 数据生命周期管理（ILM）