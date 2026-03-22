# Q7: Java分代回收深度剖析

## 为什么要分代？

**核心问题**：不同对象的生命周期差异巨大。

| 对象生命周期 | 占比 | 特点 |
|-------------|------|------|
| 短命对象 | ~98% | 朝生夕死，适合复制算法 |
| 长寿对象 | ~2% | 存活久，适合标记-整理 |

**分代策略**：根据对象年龄分配到不同区域，用最合适的算法回收。

```
┌─────────────────────────────────────────┐
│                   堆内存                  │
├────────────────────┬────────────────────┤
│      新生代 (Young)    │    老年代 (Old)      │
│  ┌────┬────┬─────┐   │                     │
│  │Eden│From│ To  │   │                     │
│  └────┴────┴─────┘   │                     │
│   8:1:1               │                     │
└────────────────────┴────────────────────┘
```

## JDK版本演进：分代回收的发展史

### JDK 1.7：分代回收走向成熟

```
HotSpot VM (JDK 1.7)
├── Serial GC (单线程)
│   ├── 新生代: Serial (复制)
│   └── 老年代: Serial Old (标记-整理)
├── Parallel GC (多线程)
│   ├── 新生代: Parallel Scavenge (复制)
│   └── 老年代: Parallel Old (标记-整理)
└── CMS GC (并发)
    ├── 初始标记 (STW) → Root对象
    ├── 并发标记 → 追踪存活对象
    ├── 重新标记 (STW) → 修正标记
    └── 并发清除 → 清理死亡对象
```

**特点**：
- 默认使用Parallel GC
- CMS开始流行（降低停顿时间）
- Perm Gen（永久代）还在

### JDK 1.8：移除Perm Gen，引入Metaspace

```
变化：
- 移除 Perm Gen (永久代)
- 新增 Metaspace (元空间) → native内存
- 默认垃圾回收器: Parallel GC
- String.intern() 移到堆内存
```

### JDK 1.9 - JDK 11：G1成为默认，ZGC/Shenandoah问世

```
JDK 9: G1成为默认GC
JDK 11: ZGC (实验)、Epsilon GC
JDK 12: Shenandoah (实验)、G1可中断混合回收
JDK 13: ZGC支持类卸载
JDK 14: 移除CMS
JDK 15: Shenandoah正式可用
```

### JDK 14 - JDK 21：GC持续进化

```
JDK 14: 移除CMS
JDK 15: Shenandoah正式GA
JDK 16: ZGC并发线程堆栈处理优化
JDK 17: ZGC正式GA、取消G1 Humongous对象年龄阈值
JDK 19: ZGC支持Windows和macOS
JDK 21: ZGC支持分代 (ZGC Generational)
```

## 分代回收核心流程

### Minor GC（新生代GC）

```
触发条件：Eden区满

流程：
1. 扫描Eden + From Survivor中存活对象
2. 复制到To Survivor
3. 年龄+1，超过阈值晋升老年代
4. 交换From/To指针

特点：
- Stop The World (STW)，但时间短
- 频繁发生（对象创建快）
- 复制算法，内存效率高
```

### Major/Full GC（老年代GC）

```
触发条件：
1. 老年代空间不足
2. MetaSpace满
3. System.gc()调用
4. Minor GC后晋升平均年龄 > 阈值

流程（以CMS为例）：
1. 初始标记 (STW) → 标记Root可达对象
2. 并发标记 → 追踪存活对象
3. 重新标记 (STW) → 修正并发期间变化
4. 并发清除 → 清理死亡对象

问题：
- 内存碎片化
- 并发模式失败 (Concurrent Mode Failure)
- 浮动垃圾
```

## 对象晋升机制

### 年龄阈值

```java
// 对象年龄计算
age = object.age + 1

// 晋升条件（满足任一）：
// 1. 年龄 >= MaxTenuringThreshold (默认6)
// 2. To Survivor区同龄对象占比 > 50%

// 查看年龄
-XX:+PrintTenuringDistribution
```

### 动态年龄计算

```
JDK引入"动态年龄"：
- 不只看年龄，还看To Survivor区同龄对象占比
- 避免大对象提前晋升导致老年代空间不足
- 目标：To Survivor区使用率 ≤ 50%
```

### 对象头结构

```cpp
// 对象头 (64位JVM)
┌────────────────────────────────────┐
│ Mark Word (64位)                   │
│   - 哈希码 (31位)                   │
│   - 分代年龄 (4位)                  │
│   - 偏向锁标志 (1位)                │
│   - 锁状态标志 (2位)                │
├────────────────────────────────────┤
│ Klass Pointer (64位) → 类元数据    │
├────────────────────────────────────┤
│ 实例数据                           │
└────────────────────────────────────┘
```

## 垃圾回收器深度对比

### Serial vs Parallel vs CMS vs G1 vs ZGC

| 特性 | Serial | Parallel | CMS | G1 | ZGC |
|-----|--------|----------|-----|-----|-----|
| 线程 | 单线程 | 多线程 | 并发 | 并发 | 并发 |
| STW | 长 | 中 | 短 | 可控 | <1ms |
| 内存 | 小 | 中 | 中 | 大 | 超大 |
| 吞吐量 | 低 | 高 | 中 | 平衡 | 高 |
| 碎片 | 无 | 无 | 有 | 无 | 无 |
| JDK默认 | 1.7 Client | 1.7 Server | - | 9+ | 15+ |

### G1详解：区域化分代

```
G1 (Garbage First) 核心思想：
- 把堆分成多个大小相等的Region (1MB-32MB)
- 每个Region可以独立作为Eden/Survivor/Old
- 优先回收垃圾最多的Region

Region结构：
┌──────────────────────────────────────┐
│  Eden Region (多个)                   │
├──────────────────────────────────────┤
│  Survivor Region (多个)               │
├──────────────────────────────────────┤
│  Old Region (多个)                   │
├──────────────────────────────────────┤
│  Humongous Region (大对象)           │
└──────────────────────────────────────┘

Humongous对象：
- 超过Region 50%的对象
- 连续多个Region存储
- 回收效率低，尽量避免
```

### ZGC：亚毫秒级延迟

```
ZGC (Z Garbage Collector) 核心：
- 并发执行所有阶段
- 着色指针 (Colored Pointers)
- 读屏障 (Load Barriers)
- 基于Region的内存布局

着色指针 (64位)：
┌────────────────────────────────────┐
│ 47位: 地址空间  (128TB)             │
│ 1位: Marked0                        │
│ 1位: Marked1                        │
│ 1位: Remapped                       │
│ 4位: 预留                           │
│ 10位: 0 (对齐)                      │
└────────────────────────────────────┘

阶段：
1. 初始标记 (STW) → Root
2. 并发标记 → 追踪
3. 再标记 (STW) → 修正
4. 并发重映射 → 修复指针
5. 并发引用处理
6. 并发内存归还

优势：
- 停顿时间 < 1ms
- 堆大小可达 16TB
- 吞吐量不下降
```

## 面试高频追问

### 追问1：为什么Survivor区要分成两个？

```
目的：避免内存碎片，支持复制算法

原理：
┌─────────────────┐
│  Eden + From    │  →  扫描存活对象
│       ↓        │      复制到 To
│  To Survivor   │  →  交换角色
└─────────────────┘

如果不分区：
- 复制后留下空洞
- 需要额外整理

两个Survivor的好处：
- 空的To区作为复制目标
- 简单高效，不需要整理
- From/To交换角色
```

### 追问2：对象一定在Eden区分配吗？

```
不一定！以下情况直接在Old区分配：

1. 大对象
   -XX:PretenureSizeThreshold=1MB
   > 该阈值的对象直接在老年代分配

2. 长期存活对象
   - 年龄达到阈值后晋升
   - 动态年龄计算也可能提前晋升

3. 分配担保
   Minor GC前，检查老年代可用空间
   如果不足，对象直接放老年代

4. TLAB (Thread Local Allocation Buffer)
   - 每个线程预分配一小块Eden区
   - 减少线程竞争，提高分配效率
```

### 追问3：Minor GC一定会触发Full GC吗？

```
不一定！但以下情况会触发：

1. 老年代空间不足
   Minor GC后，Survivor区对象需要晋升
   但老年代空间不够 → Full GC

2. 分配担保失败
   老年代最大可用连续空间 < 晋升对象大小
   → Full GC

3. MetaSpace满
   类加载过多，元空间不足
   → Full GC (触发Metaspace GC)

4. System.gc()
   显式调用，可能触发Full GC
```

### 追问4：G1的Mixed GC是什么？

```
Mixed GC = 年轻代 + 老年Regions

触发条件：
- 堆占用率达到 -XX:InitiatingHeapOccupancyPercent (默认45%)
- 或者 -XX:G1HeapWastePercent (默认5%)

流程：
1. 年轻代回收 (Young GC)
2. 选若干个高回收价值的Old区
3. 混合回收 (Mixed GC)
4. 多次Mixed GC后，进入下一个周期

G1收集周期：
Young → Mixed → Young → Mixed → ... → Full GC (如果来不及回收)
```

### 追问5：CMS和G1的并发标记有什么区别？

```
CMS (Concurrent Mark Sweep)：
┌────────────────────────────────────────┐
│ 1. 初始标记 (STW)     → Root          │
│ 2. 并发标记           → 追踪          │ ← 耗时最长
│ 3. 重新标记 (STW)     → 修正          │
│ 4. 并发清除           → 清理          │
└────────────────────────────────────────┘

问题：
- 浮动垃圾 (Concurrent Mode Failure)
- 内存碎片 (-XX:CMSFullGCsBeforeCompaction)
- 停顿时间不可控

G1：
┌────────────────────────────────────────┐
│ 1. 初始标记 (STW)     → Root          │
│ 2. 并发标记           → SATB算法      │
│ 3. 最终标记 (STW)     → 修正          │
│ 4. 筛选回收 (STW)     → 分区回收     │ ← 可中断
└────────────────────────────────────────┘

优势：
- 增量式，可中断混合回收
- 明确停顿时间目标
- 预测模型
```

### 追问6：为什么需要三色标记算法？

```
三色标记 = 并发标记时的"状态机"

三色：
- 白色：未访问
- 灰色：自身访问过，子节点未访问
- 黑色：自身和子节点都访问完

并发问题：
┌─────────────────────────────────────┐
│  线程A (标记)      线程B (应用)      │
│     ↓              ↓               │
│  B:黑色          obj.field = null   │
│  A:继续          B变成白色          │
│                                     │
│  结果：B被误删！                     │
└─────────────────────────────────────┘

解决方案：
1. SATB (Snapshot At The Beginning)
   - 记录开始时的引用关系
   - 黑色的不能变白
   
2. 增量更新
   - 记录黑色变灰的节点
   - 重新扫描
```

### 追问7：ZGC为什么能做到亚毫秒级停顿？

```
关键1：着色指针 (Colored Pointers)
- 在指针上标记GC状态
- 不需要扫描整个堆

关键2：并发重映射 (Concurrent Remapping)
- 引用指针修复与引用遍历并行
- 使用负载屏障 (Load Barrier)

关键3：读屏障开销极小
- 只有在读取引用时才触发
- 写屏障无额外开销

关键4：Region分区
- 与G1类似，但不固定分代
- 可伸缩的Region大小
```

### 追问8：分代回收与内存分配的关系

```
对象分配流程：
┌─────────────────────────────────────────┐
│  1. TLAB分配                           │
│     └── 有空间？ → 直接分配              │
│              ↓                         │
│  2. Eden区分配                         │
│     └── 有空间？ → 分配，触发Minor GC   │
│              ↓                         │
│  3. 老年代分配                         │
│     └── 有空间？ → 直接分配              │
│              ↓                         │
│  4. Full GC                            │
│     └── 成功后重试1-3                  │
│              ↓                         │
│  5. OOM                                │
└─────────────────────────────────────────┘
```

### 追问9：JVM参数如何设置最合理？

```
通用配置（低延迟服务）：
-Xms4g -Xmx4g                       # 固定堆，避免动态调整
-XX:+UseZGC                          # ZGC
-XX:+ClassUnloading                  # 类卸载
-XX:SoftRefLRUPolicyMSPerMB=1000    # 软引用回收

通用配置（高吞吐）：
-Xms4g -Xmx4g
-XX:+UseParallelGC
-XX:+UseParallelOldGC
-XX:MaxGCPauseMillis=200             # 目标停顿时间
-XX:GCTimeRatio=19                    # 吞吐量 = 1/(1+19) = 5%

G1配置（平衡）：
-Xms4g -Xmx4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=8m              # Region大小
-XX:InitiatingHeapOccupancyPercent=45
```

### 追问10：生产环境如何选择GC？

```
选择依据：
┌─────────────────────────────────────────────┐
│  场景                    │ 推荐GC            │
├─────────────────────────────────────────────┤
│  堆 < 8GB，低延迟        │ G1               │
│  堆 > 8GB，超低延迟      │ ZGC              │
│  堆 > 100GB              │ ZGC/Shenandoah   │
│  吞吐量优先              │ Parallel GC      │
│  小堆，单核              │ Serial GC        │
└─────────────────────────────────────────────┘

云原生/容器环境：
- G1 + Elastic Heap (JDK 14+)
- ZGC 自动调整堆大小

日志分析：
- -XX:+PrintGCDetails
- -XX:+PrintGCTimeStamps
- -Xlog:gc*:file=gc.log
```

## 实际调优案例

### 案例1：频繁Full GC

```bash
# 问题：CMS频繁触发Full GC

# 分析日志
java -Xlog:gc*::file=gc.log ...

# 发现：
# - 对象晋升年龄太小
# - 老年代碎片化严重

# 解决方案
-XX:MaxTenuringThreshold=15          # 提高晋升年龄
-XX:+UseCMSCompactAtFullCollection    # Full GC后整理
-XX:CMSFullGCsBeforeCompaction=5     # 5次后整理
```

### 案例2：G1停顿时间过长

```bash
# 问题：停顿时间超过目标500ms

# 原因：
# - Region太大
# - 混合回收区太多

# 解决方案
-XX:G1HeapRegionSize=4m              # 减小Region
-XX:G1MixedGCLiveThresholdPercent=85 # 提高混合回收阈值
-XX:G1ReservePercent=10              # 保留空间
```

### 案例3：ZGC内存泄漏

```bash
# 问题：元空间持续增长

# 解决方案
-XX:MetaspaceSize=256m               # 初始大小
-XX:MaxMetaspaceSize=1g              # 最大
-XX:+ClassUnloading                   # 启用类卸载
```

## 面试加分总结

> "Java分代回收是JVM最核心的优化之一。从JDK 1.7的Serial/Parallel/CMS三足鼎立，到JDK 9+ G1成为默认，再到JDK 15+ ZGC正式可用，垃圾回收器在不断进化。
> 
> 我理解分代回收的核心思想是：**根据对象生命周期选择最合适的算法**。年轻代用复制算法（对象存活率低），老年代用标记整理（避免碎片）。
> 
> 实际工作中，我一般这样选型：
> - 中小堆（<8GB）追求低延迟 → G1
> - 大堆（>8GB）超低延迟 → ZGC
> - 吞吐量优先 → Parallel GC
> 
> 调优的第一步永远是先看日志，用数据说话，而不是凭感觉改参数。"

## 相关知识点

- [Q4: JVM内存模型](./q4-jvm.md)
- [Q5: JVM调优与排查](./q5-jvm-tuning.md)
- [Q6: ConcurrentHashMap](./q6-concurrent-hashmap.md)
