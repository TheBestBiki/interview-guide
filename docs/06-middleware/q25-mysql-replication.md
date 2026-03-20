# Q25: MySQL主从复制原理？如何解决主从延迟？

## MySQL主从复制原理

```
主从复制架构：
┌─────────┐         Binlog          ┌─────────┐
│  Master │ ──────────────────────→ │  Slave  │
│  (写)   │                          │  (读)   │
└─────────┘                          └─────────┘

复制流程：
1. Master执行SQL，写入Binlog
2. Slave的IO线程读取Master的Binlog，写入Relay Log
3. Slave的SQL线程重放Relay Log，执行SQL
4. 数据同步完成
```

## 主从复制配置

```ini
# Master配置
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW

# Slave配置
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1
```

## 主从延迟原因

- **网络延迟**：主从网络不稳定
- **大事务**：主库执行时间长，Binlog传输慢
- **从库性能**：从库机器配置低
- **锁竞争**：从库有慢查询
- **单线程复制**：SQL线程单线程重放

## 解决主从延迟

### ① 强制走主库（业务层面）
关键读（如订单状态）强制走主库

### ② 并行复制

```sql
STOP SLAVE;
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL slave_parallel_workers = 4;
START SLAVE;
```

### ③ 优化大事务
拆分为小事务，避免一次性修改大量数据
