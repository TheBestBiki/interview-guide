# Q12: MySQL核心原理深度剖析

> 本篇整理自与AI的深度对话，涵盖MySQL面试最高频的底层原理问题

---

## 一、事务隔离级别

### 1.1 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ |
| READ COMMITTED | ✗ | ✓ | ✓ |
| **REPEATABLE READ** (默认) | **✗** | **✗** | **✗** |
| SERIALIZABLE | ✗ | ✗ | ✗ |

### 1.2 为什么MySQL默认是RR？

**历史原因**：
- 早期MySQL binlog格式是`STATEMENT`
- RC级别在某些并发更新场景下会导致主从数据不一致
- RR通过MVCC解决这个问题

**追问1：互联网大厂为什么偏好RC？**

| 原因 | 说明 |
|------|------|
| 减少死锁 | RC没有间隙锁(Gap Lock)，降低死锁概率 |
| 提升并发 | 允许更多并发写操作 |
| ROW格式 | 现在普遍使用`binlog_format=ROW`，无主从不一致问题 |

**追问2：如何修改隔离级别？**

```sql
-- 查看当前级别
SELECT @@transaction_isolation;

-- 修改为RC（仅当前会话）
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

## 二、InnoDB如何解决幻读？

### 2.1 RR级别下的幻读处理

**普通SELECT（快照读）**：通过MVCC生成ReadView，不会读到新插入的数据

**当前读（Locking Read）**：使用`SELECT ... FOR UPDATE`或`UPDATE`时，InnoDB使用**Next-Key Locks**
- 记录锁（Record Lock）：锁住行
- 间隙锁（Gap Lock）：锁住行之间的空隙

### 2.2 经典面试题：RR下的"幻读"

这是面试最高频的问题之一，详细拆解如下：

```sql
-- 场景：RR级别，表中有一行数据 id=1, value=10

T1: BEGIN;                    -- 开启事务A
T2: SELECT * FROM t WHERE id=1;   -- 查询得到 value=10（生成ReadView）
T3:                               -- 事务B开启
    UPDATE t SET value=20 WHERE id=1; 
    COMMIT;                     -- 事务B提交，数据变为20
T4: UPDATE t SET value=value+1 WHERE id=1;  -- 关键：更新成功，value变为21
T5: SELECT * FROM id=1;        -- 惊人发现：看到 value=21
```

**为什么会"看见"？**

这里涉及两个核心机制的碰撞：**快照读 (Snapshot Read)** 和 **当前读 (Current Read)**

| 时间点 | 操作类型 | 发生了什么 |
|--------|----------|------------|
| T2 | 快照读 | InnoDB创建ReadView，记住此刻数据状态 |
| T4 | 当前读 | UPDATE必须获取最新数据（在20基础上+1变成21） |
| T5 | 快照读 | 因为事务A修改了该行，DB_TRX_ID变成自己的ID，可见 |

### 2.3 这是幻读吗？

**严格来说：不是幻读，而是"快照穿透"**

| 类型 | 定义 |
|------|------|
| 幻读 (Phantom Read) | 同一事务中，第二次查询查到第一次没见过的**新插入的行**（Insert） |
| 这种情况 | 是对**已有行**的修改（Update），属于"不可重复读"的变体 |

### 2.4 如何避免这种"惊喜"？

**方案A：悲观锁（先查再改）**
```sql
-- 第一次查询就用 FOR UPDATE
SELECT * FROM t WHERE id=1 FOR UPDATE;
```
- 触发当前读，加排他锁
- 事务B在T3时会被阻塞，直到事务A提交
- 保证两次SELECT结果绝对一致

**方案B：乐观锁（CAS机制）**
```sql
-- 利用version字段
UPDATE t SET value=21, version=version+1 
WHERE id=1 AND version=old_version;
```
- 如果事务B已修改，返回影响行数=0
- Java代码触发重试逻辑

---

## 三、索引底层：B树 vs B+树

### 3.1 B树 vs B+树 对比

| 特性 | B树 | B+树 |
|------|-----|------|
| 数据存储位置 | 所有节点（内含+叶子） | 仅叶子节点 |
| 查询稳定性 | 不稳定 | 极其稳定（必查叶子） |
| 范围查询 | 效率低 | 高（叶子链表） |
| 单页承载量 | 低 | 高 |

### 3.2 为什么InnoDB选择B+树？

1. **更少的I/O**：非叶子节点只存索引，一个16KB页可存上千个索引
   - 3层B+树 ≈ 10亿条数据
2. **磁盘预读友好**：完美契合局部性原理
3. **范围查询顺滑**：叶子节点双向链表，直接遍历

**追问：B树适合什么场景？**

MongoDB等文档数据库更适合B树，因为需要快速命中单条数据。

---

## 四、聚集索引 vs 非聚集索引

### 4.1 核心区别

| 特性 | 聚集索引 | 非聚集索引 |
|------|----------|------------|
| 叶子节点 | 存储完整行数据 | 存储索引列+主键值 |
| 数量 | 每表仅1个 | 每表多个 |
| 查询速度 | 极快（直接拿数据） | 较慢（可能回表） |
| 插入影响 | 大（可能导致页分裂） | 小 |

### 4.2 什么是"回表"？

```sql
-- name是非聚集索引
SELECT * FROM users WHERE name = '张三';
```

1. 先去name索引树，找到"张三"对应的主键ID=1001
2. 再去聚集索引树查ID=1001，获取完整数据
3. **这个过程叫"回表"**

**追问：如何优化回表？**

使用**索引覆盖（Covering Index）**：
```sql
-- 只需要id和name，不需要回表
SELECT id, name FROM users WHERE name = '张三';
```

### 4.3 聚集索引的选择顺序

1. 主键 → 聚集索引
2. 第一个唯一非空索引
3. 自动生成隐式rowid

---

## 五、联合索引与最左匹配

### 5.1 最左匹配原则

联合索引`INDEX(a, b, c)`的排序：
- 先按a排序
- a相同按b排序
- b相同按c排序

| 查询条件 | 是否走索引 | 原因 |
|----------|------------|------|
| WHERE a=1 | 是 | 匹配最左列 |
| WHERE a=1 AND b=2 | 是 | 匹配前两列 |
| WHERE a=1 AND c=3 | 部分 | 仅a走索引 |
| WHERE b=2 | 否 | 违背最左匹配 |

### 5.2 范围查询陷阱

```sql
WHERE a=1 AND b>10 AND c=3
-- a: 走索引
-- b: 范围查询，走索引
-- c: 无法走索引（因为b范围导致c无序）
```

### 5.3 联合索引的优势

1. **减少开销**：一个联合索引相当于(a)、(a,b)、(a,b,c)三个索引
2. **索引覆盖**：查询字段正好在索引中，无需回表
3. **过滤更强**：直接定位，比多个单列索引Merge更高效

---

## 六、MVCC原理

> 这是MySQL最核心的并发控制机制，面试必问

### 6.1 为什么要用MVCC？

让数据库实现**"读不加锁，读写不冲突"**

如果没有MVCC，大查询（报表统计）会把所有写入操作锁住，系统会卡死。MVCC让查询像在平行时空一样，读到数据在某个历史时刻的状态。

### 6.2 三大核心组件

**① 隐式字段（Hidden Columns）**

InnoDB在每一行数据后面增加隐藏列：

| 字段 | 作用 |
|------|------|
| `DB_TRX_ID` | 最后一次插入或更新该行的事务ID |
| `DB_ROLL_PTR` | 回滚指针，指向该行上一个版本的undo log地址 |

**② Undo Log（回滚日志）**

- 更新一行数据时，InnoDB不会直接覆盖旧数据
- 把旧数据写入undo log
- 通过`DB_ROLL_PTR`指针串联成**版本链**

**③ ReadView（一致性视图）**

当事务执行查询时，生成ReadView，记录：
- 哪些事务还在运行（未提交）
- 当前最大的事务ID是多少

### 6.3 查询时如何判断"我能看哪个版本"？

```java
// InnoDB 快照读核心逻辑
for (每个版本) {
    if (版本的TRX_ID == 自己) {
        return 可见;  // 自己修改的当然可见
    }
    if (版本的TRX_ID < 活跃事务最小ID) {
        return 可见;  // 已提交
    }
    if (版本的TRX_ID > 当前最大事务ID) {
        continue;  // ReadView之后开启的，看不见
    }
    if (版本的TRX_ID 在活跃事务列表中) {
        continue;  // 未提交，看不见，找上一个版本
    }
    return 可见;
}
```

**简化理解：**

| 版本TRX_ID | 判断结果 |
|------------|----------|
| 是自己 | 可见 |
| 已提交（在ReadView生成前） | 可见 |
| 未提交（活跃） | 不可见，找上一个版本 |
| ReadView之后才开启 | 不可见 |

### 6.4 RC vs RR：ReadView生成时机不同

| 隔离级别 | ReadView生成时机 | 效果 |
|----------|------------------|------|
| **RC** | 每次SELECT都生成新ReadView | 别人提交后，下一次查询就能看到 |
| **RR** | 事务第一次SELECT时生成 | 整个事务复用ReadView，别人的提交永远不可见 |

**追问：RR下为什么可重复读？**

因为ReadView在整个事务期间不变。无论别人怎么提交，只要没在你之前开启，你都看不见。

### 6.5 案例说明

```sql
-- RR级别
T1: BEGIN;
T2: SELECT * FROM t WHERE id=1;  -- ReadView生成，看到 value=10
T3: UPDATE t SET value=20 WHERE id=1;  -- 修改，数据变为20
T4: SELECT * FROM id=1;  -- 仍然看到 value=10（ReadView没变）
```

---

## 七、锁机制

### 7.1 FOR UPDATE 锁多行？

**单行主键查询**：
```sql
SELECT * FROM t WHERE id = 1 FOR UPDATE;
```
- 只锁id=1这一行（Record Lock）

**多行查询**：
```sql
SELECT * FROM t WHERE status = 'PENDING' FOR UPDATE;
```
- 锁住所有符合条件的行（10条就锁10条）

### 7.2 索引失效 = 锁全表

如果查询条件**没有索引**：
- InnoDB执行全表扫描
- **锁住所有行 + 间隙锁**
- 高并发下是灾难

### 7.3 Next-Key Lock

在RR级别下，`FOR UPDATE`实际触发Next-Key Lock：

```
记录锁（Record Lock） + 间隙锁（Gap Lock）
```

**示例**：表中有id=1, 5, 10
```sql
SELECT * FROM t WHERE id > 5 FOR UPDATE;
```
- 锁住id=10（记录锁）
- 锁住间隙(5, 10)和(10, +∞)（间隙锁）
- 另一个事务`INSERT INTO t VALUES(8)`会被阻塞
- 这就是InnoDB防止"幻读"的机制

### 7.4 NOWAIT 语法（MySQL 8.0+）

```sql
SELECT * FROM t WHERE id=1 FOR UPDATE NOWAIT;
```
- 如果行被锁，立即报错返回
- 避免长时间阻塞，提升用户体验

---

## 八、面试追问汇总

1. **MySQL默认隔离级别为什么是RR？** → 历史原因+MVCC解决主从不一致
2. **为什么大厂偏好RC？** → 减少死锁、提升并发、ROW格式普及
3. **InnoDB如何解决幻读？** → 快照读+Next-Key Lock
4. **RR下先SELECT后UPDATE会看到新数据吗？** → 会，这是"快照穿透"
5. **如何避免这种"幻读"？** → 悲观锁FOR UPDATE 或 乐观锁version
6. **B+树比B树好在哪？** → 稳定+范围查询友好+更少I/O
7. **为什么主键建议自增？** → 避免页分裂
8. **什么是回表？** → 先查非聚集索引，再查聚集索引
9. **如何避免回表？** → 索引覆盖（Covering Index）
10. **联合索引最左匹配原则？** → 从最左开始，依次匹配
11. **范围查询后右边的字段还能用索引吗？** → 不能
12. **MVCC哪三个组件？** → 隐式字段(DB_TRX_ID/ROLL_PTR)+Undo Log+ReadView
13. **MVCC如何判断版本可见性？** → 根据TRX_ID与活跃事务列表比对
14. **RC和RR的ReadView区别？** → RC每次生成，RR只用一次
15. **FOR UPDATE锁多行？** → 符合条件的所有行
16. **没有索引的FOR UPDATE会怎样？** → 锁全表+间隙锁
17. **Next-Key Lock由什么组成？** → 记录锁+间隙锁
18. **FOR UPDATE NOWAIT有什么用？** → 避免阻塞，立即返回