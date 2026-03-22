# Q6: ConcurrentHashMap深度剖析

## 什么是ConcurrentHashMap？

ConcurrentHashMap是Java并发包(java.util.concurrent)提供的高速并发哈希Map实现，它是HashMap的线程安全版本。相比于使用synchronized包装整个Map的Collections.synchronizedMap()，ConcurrentHashMap采用更细粒度的锁机制，实现了高并发读取和写入。

## ConcurrentHashMap vs HashMap vs Hashtable 核心对比

| 对比维度 | HashMap | ConcurrentHashMap | Hashtable |
|---------|---------|-------------------|-----------|
| 线程安全性 | 非线程安全 | 线程安全 | 线程安全 |
| 锁机制 | 无锁 | JDK1.7分段锁+JDK1.8CAS+synchronized | synchronized锁整个map |
| 性能 | 单线程高性能 | 高并发下性能优异 | 性能差（全局锁） |
| null支持 | key和value都允许null | key和value都不允许null | 都不允许 |
| 迭代器 | fail-fast | 弱一致性 | fail-fast |
| 复杂度 | 简单 | 较复杂 | 简单 |
| 适用场景 | 单线程环境 | 高并发环境 | 不推荐使用 |

## JDK1.7 vs JDK1.8 底层实现演进

### JDK1.7：分段锁（Segment + HashEntry）

```
ConcurrentHashMap
    ├── Segment[] (默认16个Segment)
    │   └── HashEntry[] (每个Segment独立锁)
    └── ReentrantLock (Segment继承)
```

- **数据结构**：Segment数组，每个Segment继承ReentrantLock，内部包含HashEntry数组
- **锁粒度**：每个Segment独立加锁，理论上最高16并发
- **并发度**：由Segment数组大小决定，可通过构造函数指定

### JDK1.8：CAS + synchronized（去分段锁）

```
ConcurrentHashMap
    └── Node[] (CAS + synchronized保驾护航)
        ├── Node (key-value键值对)
        ├── TreeNode (红黑树节点)
        └── TreeBin (红黑树容器)
```

- **数据结构**：Node数组 + 红黑树（链表长度>8时转换）
- **锁粒度**：对每个桶（bucket）单独加锁，锁的是头节点
- **并发优化**：使用CAS无锁操作+synchronized悲观锁

## 核心原理深度解析

### 1. put()流程（JDK1.8）

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    // 计算hash
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        // 1. 数组为空，初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        // 2. 当前位置为空，CAS尝试写入
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value, null)))
                break;
        }
        // 3. 正在扩容，帮助扩容
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        // 4. 都不行，synchronized锁住头节点写入
        else {
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    // 链表插入
                    if (fh >= 0) {
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash && ((ek = e.key) == key ||
                                (ek != null && key.equals(ek)))) {
                                V oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                return oldVal;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    // 红黑树插入
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                            return oldVal;
                        }
                    }
                }
            }
        }
    }
    // 检查是否需要树化或扩容
    addCount(1, binCount);
    return null;
}
```

### 2. get()流程（无锁读）

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode());
    // 简单无锁读取
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // 先比较hash，再比较key
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        // hash < 0 表示正在扩容或红黑树
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        // 遍历链表
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

### 3. 扩容机制

ConcurrentHashMap的扩容是**多线程并行扩容**的：

```java
// 扩容时每个线程至少处理16个桶
private static final int MIN_TRANSFER_STRIDE = 16;

// 帮助扩容
final Node<K,V>[] helpTransfer(Node<K,V>[] tab, Node<K,V> f) {
    Node<K,V>[] nextTab; int sc;
    if (tab != null && (f instanceof ForwardingNode) &&
        (nextTab = ((ForwardingNode<K,V>)f).nextTable) != null) {
        int rs = resizeStamp(tab.length);
        while (nextTab == nextTable && table == tab &&
               (sc = sizeCtl) < 0) {
            // 线程参与扩容
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                transfer(tab, nextTab);
                break;
            }
        }
        return nextTab;
    }
    return table;
}
```

### 4. 计算size()方法

```java
// 核心思路：先尝试无锁统计，失败则加锁重试
public int size() {
    long n = sumCount();
    return (n < 0) ? 0 : (n > (long)Integer.MAX_VALUE) ?
        Integer.MAX_VALUE : (int)n;
}

final long sumCount() {
    CounterCell[] as = counterCells;
    CounterCell a;
    long sum = baseCount;
    if (as != null) {
        for (int i = 0; i < as.length; ++i) {
            if ((a = as[i]) != null)
                sum += a.value;
        }
    }
    return sum;
}
```

## 为什么key和value不允许null？

这是有意为之的设计，主要是为了避免并发场景下的二义性：

- **get()返回null**：无法区分是"key不存在"还是"key存在但value为null"
- **在并发环境中**：一个线程put(null, value)同时另一个线程get(null)可能有安全问题
- **对比HashMap**：单线程环境下可以明确区分，通过containsKey()辅助判断

## 面试高频追问

### 追问1：为什么JDK1.8要用synchronized而不是ReentrantLock？

1. **JVM内置优化**：synchronized是JVM原生关键字，JVM对其有大量优化（偏向锁、轻量级锁、锁升级）
2. **内存开销更小**：ReentrantLock需要维护等待队列，有额外对象开销
3. **与CAS配合**：对于低竞争场景，CAS已足够，只在真正冲突时才升级为synchronized
4. **JVM锁粗化优化**：JVM会自动将相邻的synchronized块合并

### 追问2：ConcurrentHashMap的迭代器为什么是弱一致性的？

- **弱一致性**：迭代器可以容忍并发修改，不抛ConcurrentModificationException
- **实现原理**：迭代器不捕获快照，而是记录当时的modCount，遍历过程中允许其他线程修改
- **vs HashMap**：HashMap的迭代器是fail-fast，检测到modCount变化就抛异常
- **设计考量**：为了高并发性能，牺牲了强一致性

### 追问3：链表转红黑树的阈值为什么是8？

```java
static final int TREEIFY_THRESHOLD = 8;

// 源码注释解释
// Ideally, under random hashCodes, the frequency of
// nodes in bins follows a Poisson distribution
// (see http://en.wikipedia.org/wiki/Poisson_distribution)
// with a parameter of about 0.5 on average for the
// default resizing threshold of 0.75, although with a
// large variance because of resizing granularity.
// Ignoring variance, the expected occurrences thereof
// for table length 64 is ~2 per bin.
```

- **泊松分布**：在随机hash下，链表长度为8的概率非常低（约0.00000006）
- **优化意图**：说明如果真的出现8个节点，说明hash算法有问题，应该用红黑树优化
- **退化情况**：实际生产中，恶意hash或设计不当可能导致退化成链表

### 追问4：CAS在ConcurrentHashMap中如何应用？

1. **tabAt()**：原子读取数组指定位置的元素
   ```java
   static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
       return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
   }
   ```

2. **casTabAt()**：CAS尝试原子写入
   ```java
   static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,
                                       Node<K,V> c, Node<K,V> v) {
       return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
   }
   ```

3. **putIfAbsent()**：原子地插入仅当key不存在
   ```java
   default V putIfAbsent(K key, V value) {
       return putVal(key, value, true);
   }
   ```

### 追问5：JDK1.7到JDK1.8的性能提升有多大？

| 场景 | JDK1.7 | JDK1.8 | 提升原因 |
|-----|--------|--------|---------|
| 单线程写入 |基准| ~20%提升| 去掉分段锁开销 |
| 高并发写入 |基准| 2-3倍| 锁粒度更细 |
| 读操作 |基准| ~50%提升| 完全无锁读 |
| 内存占用 |基准| ~30%减少| 去掉Segment结构 |

### 追问6：ConcurrentHashMap在JDK1.8中的锁升级流程

```
无锁(CAS) → 轻量级锁(synchronized) → 重量级锁
    ↓            ↓                   ↓
  竞争低      轻度竞争            严重竞争
```

synchronized在JDK1.6后进行了优化：
- **偏向锁**：第一个线程获取锁，无开销
- **轻量级锁**：自旋CAS获取，不阻塞线程
- **重量级锁**：自旋失败，阻塞线程

### 追问7：ConcurrentHashMap的computeIfAbsent()适合什么场景？

```java
// 缓存场景：key不存在时才计算
value = map.computeIfAbsent(key, k -> expensiveCalculation(k));

// 特点：
// 1. 原子操作，整个计算过程被锁保护
// 2. 避免重复计算
// 3. 注意递归死循环风险（computeIfAbsent中调用get可能导致死锁）
```

### 追问8：为什么size()方法不精确？

- **原因**：并发写入时，精确size需要加全局锁，代价太高
- **解决方案**：
  - 使用CounterCell分散计数（类似LongAdder）
  - 先无锁尝试，失败才加锁
  - 返回值可能是近似值，但在统计容量是否接近阈值时足够

### 追问9：ConcurrentHashMap vs CopyOnWriteArrayList 选哪个？

| 特性 | ConcurrentHashMap | CopyOnWriteArrayList |
|-----|-------------------|---------------------|
| 读性能 | O(1) 高性能 | O(1) 高性能（无锁读） |
| 写性能 | O(1) 单桶锁 | O(n) 需要复制整个数组 |
| 内存 | 正常 | 每次写都复制，内存开销大 |
| 适用场景 | 读多写多 | 读多写少（极少写） |

**选择原则**：
- 写频繁 → ConcurrentHashMap
- 读远多于写，且可以容忍最终一致 → CopyOnWriteArrayList
- 大部分场景 → ConcurrentHashMap

### 追问10：为什么HashMap并发不安全？

```java
// 并发下会发生什么？
HashMap<Integer, Integer> map = new HashMap<>();

// 线程A: put(1, 1)
// 线程B: put(2, 2)
// 线程C: get(1)

// 可能问题：
// 1. 扩容时形成环形链表，导致get死循环
// 2. 数据覆盖丢失
// 3. 数组下标越界（resize时）
```

- **JDK1.8前**：扩容时transfer()头插法可能形成环形链表
- **JDK1.8后**：改用尾插法，但仍有数据覆盖风险
- **根本原因**：没有锁保护，resize和put操作不是原子的

## 实际使用最佳实践

### ✅ 推荐写法

```java
// 1. 使用putIfAbsent实现缓存
cache.computeIfAbsent(key, k -> loadFromDb(k));

// 2. 使用merge简化更新
map.merge(key, 1, Integer::sum);

// 3. 使用compute更新
map.compute(key, (k, v) -> v == null ? 1 : v + 1);

// 4. 批量操作注意原子性
// ❌ 错误：非原子，可能被其他线程插入
if (!map.containsKey(key)) {
    map.put(key, value);
}
// ✅ 正确
map.putIfAbsent(key, value);
```

### ❌ 常见误区

```java
// 1. 误用导致NPE
map.get(key); // 返回null无法区分是不存在还是值为null

// 2. 迭代时修改导致不确定行为
for (Map.Entry<K,V> entry : map.entrySet()) {
    // 可以修改value，但不能修改key
    entry.setValue(newValue);
}

// 3. 混淆containsKey和get
// 在ConcurrentHashMap中，应该直接使用get
V v = map.get(key);
if (v != null || map.containsKey(key)) {
    // 处理
}
```

### 真实项目案例：限流器实现

```java
public class RateLimiter {
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private final int limit;

    public boolean tryAcquire(String key) {
        AtomicInteger counter = counters.computeIfAbsent(key, k -> new AtomicInteger(0));
        int current = counter.incrementAndGet();
        if (current > limit) {
            counter.decrementAndGet();
            return false;
        }
        return true;
    }
}
```

### 真实项目案例：本地缓存

```java
public class Cache<K, V> {
    private final ConcurrentHashMap<K, V> cache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<K, Long> expireMap = new ConcurrentHashMap<>();

    public V get(K key, Function<K, V> loader) {
        // 先检查过期
        if (isExpired(key)) {
            cache.remove(key);
            expireMap.remove(key);
        }
        // computeIfAbsent原子加载
        return cache.computeIfAbsent(key, k -> {
            expireMap.put(k, System.currentTimeMillis() + TTL);
            return loader.apply(k);
        });
    }
}
```

## 面试加分总结

> "ConcurrentHashMap是Java并发编程中最常用的数据结构之一。它在JDK1.7使用Segment分段锁，JDK1.8改为CAS+synchronized，锁粒度更细，性能更好。读操作完全无锁，写操作只锁单个桶。
> 
> 我理解它最核心的设计思想是：**读多写少时用无锁CAS，写竞争时用synchronized锁单个节点**。这种分层策略让它在各种并发场景下都有不错的表现。
> 
> 在实际项目中，我通常用它来实现缓存、计数器、并发安全Map等场景。需要注意它不允许null key/value，这是为了避免并发下的二义性。"

## 相关知识点关联

- [synchronized原理](./q1-synchronized.md)
- [volatile与可见性](./q3-volatile.md)
- [JVM调优](./q5-jvm-tuning.md)
- **扩展阅读**：LongAdder和AtomicLong - ConcurrentHashMap的CounterCell原理类似，也是分段计数，在高并发下比AtomicLong性能更好
