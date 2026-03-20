# Q24: 如何排查线上问题？Arthas使用？

## 排查问题思路

1. 定位问题：哪个接口/服务出问题？
2. 日志分析：查看错误日志、GC日志
3. 指标监控：CPU、内存、QPS、响应时间
4. 链路追踪：SkyWalking/Zipkin查看调用链
5. 堆栈分析：jstack、jmap dump
6. 复现问题：本地/测试环境模拟

## 常用诊断命令

```bash
# 查看Java进程
jps -l

# 查看JVM参数
jinfo -flags PID

# 查看内存使用
jstat -gcutil PID 1000
jmap -heap PID

# 导出堆转储
jmap -dump:format=b,file=heap.hprof PID

# 查看线程堆栈
jstack PID
```

## Arthas使用

### 核心命令

```bash
# 1. dashboard - 查看整体情况
dashboard

# 2. thread - 查看线程
thread 20              # 查看Top 20耗时线程
thread -n 10           # 查看最忙的10个线程

# 3. watch - 方法调用观察
watch com.example.Service method "params[0].returnObj" -x 3

# 4. trace - 方法调用链路
trace com.example.Service method '#cost > 10'

# 5. monitor - 方法执行统计
monitor -c 5 com.example.Service method

# 6. stack - 方法调用堆栈
stack com.example.Service method

# 7. jad - 反编译
jad com.example.Controller
```

## 实际案例

```bash
# 案例：订单创建接口响应慢
# 1. 先用dashboard看整体情况
# 2. 查看最忙的线程
thread -n 5

# 3. 追踪方法调用
trace com.example.OrderService createOrder

# 4. 发现是库存服务调用慢
# 5. 用watch查看库存参数
watch com.example.InventoryService deduct "params" -x 2
```

## 面试加分回答

"线上问题排查我主要用三板斧：1）先用Arthas的dashboard和thread查看整体和线程情况；2）用trace定位耗时方法；3）用watch观察方法入参和返回值。Arthas的watch和trace是排查问题的神器，不需要重启服务就能诊断。"
