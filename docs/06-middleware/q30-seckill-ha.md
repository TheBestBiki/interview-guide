# Q30: 如何设计一个秒杀系统的高可用方案？

## 高可用架构

```
用户 → CDN → LVS/Nginx → 网关集群 → 秒杀服务集群
                              ↓
                        限流熔断
                              ↓
                        Redis集群 ← 库存服务
                              ↓
                        MQ集群   ← 订单服务
                              ↓
                        数据库集群
```

## 流量清洗

### ① CDN缓存
秒杀商品页静态化，缓存到CDN

### ② 限流策略

```java
// Sentinel限流
FlowRule rule = new FlowRule("seckill");
rule.setCount(1000);                    // QPS 1000
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);
```

### ③ 验证码拦截
答题/拼图验证码，拦截器刷请求

## 热点数据保护

### ① 库存预热
```java
// Lua脚本原子扣减
String script = 
    "if redis.call('decr', KEYS[1]) >= 0 then " +
    "    return 1 " +
    "else " +
    "    redis.call('incr', KEYS[1]) " +
    "    return 0 " +
    "end";
```

### ② 请求削峰
Redis扣减成功 → 写入MQ → 消费 → 创建订单

## 降级熔断

```java
// Sentinel熔断
DegradeRule rule = new DegradeRule("seckill");
rule.setCount(0.5);              // 50%错误率
rule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
rule.setTimeWindow(10);          // 熔断10秒
```

## 压测与监控

```
压测指标
├── 并发用户数：10万
├── QPS：5万
├── 响应时间：<500ms
└── 错误率：<0.1%

监控告警
├── QPS突增告警
├── 响应时间P99 > 1s
├── 错误率 > 1%
└── 库存扣减异常
```
