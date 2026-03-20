# Q2: ThreadPoolExecutor核心参数有哪些？

## 七大核心参数

1. **corePoolSize** - 核心线程数
2. **maximumPoolSize** - 最大线程数
3. **keepAliveTime** - 空闲线程存活时间
4. **unit** - 时间单位
5. **workQueue** - 任务阻塞队列
6. **threadFactory** - 线程工厂
7. **handler** - 拒绝策略

## 拒绝策略

- **AbortPolicy** - 抛出异常
- **CallerRunsPolicy** - 调用者执行
- **DiscardPolicy** - 直接丢弃
- **DiscardOldestPolicy** - 丢弃最老的
