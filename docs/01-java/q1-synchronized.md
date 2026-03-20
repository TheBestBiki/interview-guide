# Q1: synchronized和ReentrantLock的区别？

## 共同点

- 都是可重入锁
- 都是互斥锁

## 区别

| 区别 | synchronized | ReentrantLock |
|------|--------------|----------------|
| 语法层面 | JVM关键字 | Java API |
| 等待可中断 | 不可中断 | lockInterruptibly() |
| 公平锁 | 非公平 | 可设置为公平锁 |
| 条件变量 | 单一 | 多个Condition |

## 使用场景

- **synchronized**: 简单同步需求
- **ReentrantLock**: 需要可中断、公平锁、多条件变量
