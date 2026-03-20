# Q3: volatile如何保证可见性和有序性？

## volatile的作用

- **可见性**：一个线程对volatile变量的修改，另一个线程立即看到
- **有序性**：禁止指令重排序
- **注意**：volatile**不保证原子性**（如i++需要读+改+写三步）

## 底层实现原理

### 可见性实现
- **写操作**：在写volatile变量后，添加Store屏障，强制将值刷新到主内存
- **读操作**：在读volatile变量前，添加Load屏障，从主内存读取最新值

### 有序性实现
- **写屏障**：volatile变量写入前后的指令不能重排序
- **读屏障**：volatile变量读取前后的指令不能重排序

## happens-before八大原则

1. **程序顺序规则**：同一个线程中，前面的操作happens-before后面的操作
2. **锁解锁规则**：解锁操作happens-before加锁操作
3. **volatile变量规则**：volatile变量的写happens-before读
4. **线程启动规则**：Thread.start() happens-before被启动线程的任何操作
5. **线程终止规则**：线程所有操作happens-before其他线程检测到线程终止
6. **传递性规则**：A happens-before B，B happens-before C，则A happens-before C

## 经典案例：单例模式double-checked locking

```java
// 问题：new Singleton() 可能重排序
instance = new Singleton();
// 分解为：1.分配内存 2.调用构造函数 3.赋值给instance
// 可能重排序导致其他线程看到未初始化的对象

// 解决方案：加上volatile
private static volatile Singleton instance;
```

## 面试加分回答

"volatile通过内存屏障实现可见性和有序性。写操作会强制刷新到主存，读操作会强制从主存读取。volatile的happens-before规则保证了写先于读。在实际应用中，volatile适合作为状态标记位，比如用来表示系统是否初始化完成。但对于i++这种复合操作，必须用synchronized或AtomicInteger。"
