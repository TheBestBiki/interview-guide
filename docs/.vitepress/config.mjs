import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',
  base: '/interview-guide/',
  cleanUrls: false,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
    ],

    sidebar: [
      {
        text: 'Java核心',
        items: [
          { text: 'Q1: synchronized和ReentrantLock', link: '/01-java/q1-synchronized' },
          { text: 'Q2: ThreadPoolExecutor', link: '/01-java/q2-threadpool' },
          { text: 'Q3: volatile与happens-before', link: '/01-java/q3-volatile' },
          { text: 'Q4: JVM内存模型和垃圾回收', link: '/01-java/q4-jvm' },
          { text: 'Q5: JVM调优与排查', link: '/01-java/q5-jvm-tuning' },
          { text: 'Q6: ConcurrentHashMap深度剖析', link: '/01-java/q6-concurrent-hashmap' },
          { text: 'Q7: Java分代回收深度剖析', link: '/01-java/q7-generational-gc' },
        ]
      },
      {
        text: 'SpringCloud与微服务',
        items: [
          { text: 'Q8: Spring Cloud核心组件', link: '/02-microservice/q6-springcloud' },
          { text: 'Q9: 分布式事务Seata', link: '/02-microservice/q7-seata' },
          { text: 'Q10: 微服务高可用', link: '/02-microservice/q8-high-availability' },
          { text: 'Q11: 服务间上下文传递', link: '/02-microservice/q9-context-passing' },
        ]
      },
      {
        text: '数据库与缓存',
        items: [
          { text: 'Q12: Redis数据结构与分布式锁', link: '/03-database/q10-redis' },
          { text: 'Q13: MySQL索引优化与分库分表', link: '/03-database/q11-mysql-optimization' },
          { text: 'Q14: 消息队列', link: '/03-database/q12-mq' },
          { text: 'Q15: 跨片查询', link: '/03-database/q13-cross-shard-query' },
        ]
      },
      {
        text: '设计模式与系统设计',
        items: [
          { text: 'Q16: 设计模式', link: '/04-design/q14-design-patterns' },
          { text: 'Q17: 秒杀系统设计', link: '/04-design/q15-seckill-system' },
          { text: 'Q18: 微服务架构设计', link: '/04-design/q16-microservice-architecture' },
        ]
      },
      {
        text: '认证授权与安全',
        items: [
          { text: 'Q19: JWT Token', link: '/05-security/q17-jwt' },
          { text: 'Q20: SSO单点登录', link: '/05-security/q18-sso' },
          { text: 'Q21: 安全防护', link: '/05-security/q19-security' },
          { text: 'Q22: 接口幂等', link: '/05-security/q20-idempotent' },
        ]
      },
      {
        text: '分布式系统与中间件',
        items: [
          { text: 'Q23: Redis缓存问题', link: '/06-middleware/q21-redis-cache' },
          { text: 'Q24: ES同步与优化', link: '/06-middleware/q22-es-sync' },
          { text: 'Q25: API设计', link: '/06-middleware/q23-api-design' },
          { text: 'Q26: Arthas使用', link: '/06-middleware/q24-arthas' },
          { text: 'Q27: MySQL主从复制', link: '/06-middleware/q25-mysql-replication' },
          { text: 'Q28: 多级缓存架构', link: '/06-middleware/q26-multi-level-cache' },
          { text: 'Q29: 分布式ID', link: '/06-middleware/q27-distributed-id' },
          { text: 'Q30: 支付系统设计', link: '/06-middleware/q28-payment-system' },
          { text: 'Q31: 性能优化', link: '/06-middleware/q29-performance-optimization' },
          { text: 'Q32: 秒杀高可用方案', link: '/06-middleware/q30-seckill-ha' },
        ]
      },
      {
        text: '项目与职业发展',
        items: [
          { text: 'Q33: 有挑战的项目', link: '/07-project/q31-challenging-project' },
          { text: 'Q34: 职业规划', link: '/07-project/q32-career-plan' },
          { text: 'Q35: 反问面试官', link: '/07-project/q33-questions' },
        ]
      }
    ]
  }
})
