# Q22: ES与MySQL如何同步？Elasticsearch优化？

## MySQL与ES同步方案

### ① 定时任务同步

```java
@Scheduled(cron = "0 */5 * * * ?")
public void syncToEs() {
    List<Order> orders = orderMapper.findRecentChanged(5);
    List<IndexRequest> requests = orders.stream()
        .map(order -> new IndexRequest("orders")
            .id(order.getId().toString())
            .source(JSON.toJSONString(order)))
        .collect(Collectors.toList());
    bulkRequest.add(requests);
    client.bulk(bulkRequest, RequestOptions.DEFAULT);
}
```

### ② Canal监听Binlog（推荐）

```java
@CanalTable("order")
public class OrderListener implements EntryHandler<Order> {
    
    @Override
    public void insert(Order order) {
        esClient.index(new IndexRequest("orders")
            .id(order.getId().toString())
            .source(JSON.toJSONString(order)), RequestOptions.DEFAULT);
    }
    
    @Override
    public void update(Order before, Order after) {
        esClient.update(new UpdateRequest("orders", after.getId().toString())
            .doc(JSON.toJSONString(after)), RequestOptions.DEFAULT);
    }
    
    @Override
    public void delete(Order order) {
        esClient.delete(new DeleteRequest("orders", order.getId().toString()), 
            RequestOptions.DEFAULT);
    }
}
```

## ES优化

### 查询优化

```java
// 使用filter替代must减少计算
POST /orders/_search
{
  "query": {
    "bool": {
      "must": [{"term": {"status": "PAID"}}],
      "filter": [{"term": {"tenant_id": "t001"}}]
    }
  }
}

// 分页优化（避免深度分页）
POST /orders/_search
{
  "size": 20,
  "query": {"term": {"status": "PAID"}},
  "search_after": ["1000", "order_1000"],
  "sort": [{"id": "asc"}]
}
```

### 写入优化

```java
// 批量写入
BulkRequest bulkRequest = new BulkRequest();
for (Order order : orders) {
    bulkRequest.add(new IndexRequest("orders")
        .id(order.getId().toString())
        .source(JSON.toJSONString(order), XContentType.JSON));
}
client.bulk(bulkRequest, RequestOptions.DEFAULT);
```
