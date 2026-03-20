import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',

  head: [
    ['link', { rel: 'icon', href: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }]
  ],

  themeConfig: {
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',

    nav: [
      { text: '首页', link: '/' },
      { text: 'Java核心', link: '/01-java/' },
      { text: '微服务', link: '/02-microservice/' },
      { text: '数据库', link: '/03-database/' },
      { text: '设计模式', link: '/04-design/' },
      { text: '安全认证', link: '/05-security/' },
      { text: '中间件', link: '/06-middleware/' },
      { text: '项目经验', link: '/07-project/' },
    ],

    sidebar: {
      '/01-java/': [
        {
          text: 'Java核心与并发',
          items: [
            { text: 'Q1: synchronized和ReentrantLock', link: '/01-java/q1-synchronized.html' },
            { text: 'Q2: ThreadPoolExecutor', link: '/01-java/q2-threadpool.html' },
            { text: 'Q3: volatile与happens-before', link: '/01-java/q3-volatile.html' },
            { text: 'Q4: JVM内存模型和垃圾回收', link: '/01-java/q4-jvm.html' },
            { text: 'Q5: JVM调优与排查', link: '/01-java/q5-jvm-tuning.html' },
          ]
        }
      ],
      '/02-microservice/': [
        {
          text: 'SpringCloud与微服务',
          items: [
            { text: 'Q6: Spring Cloud核心组件', link: '/02-microservice/q6-springcloud.html' },
            { text: 'Q7: 分布式事务Seata', link: '/02-microservice/q7-seata.html' },
            { text: 'Q8: 微服务高可用', link: '/02-microservice/q8-high-availability.html' },
            { text: 'Q9: 服务间上下文传递', link: '/02-microservice/q9-context-passing.html' },
          ]
        }
      ],
      '/03-database/': [
        {
          text: '数据库与缓存',
          items: [
            { text: 'Q10: Redis数据结构与分布式锁', link: '/03-database/q10-redis.html' },
            { text: 'Q11: MySQL索引优化与分库分表', link: '/03-database/q11-mysql-optimization.html' },
            { text: 'Q12: 消息队列', link: '/03-database/q12-mq.html' },
            { text: 'Q13: 跨片查询', link: '/03-database/q13-cross-shard-query.html' },
          ]
        }
      ],
      '/04-design/': [
        {
          text: '设计模式与系统设计',
          items: [
            { text: 'Q14: 设计模式', link: '/04-design/q14-design-patterns.html' },
            { text: 'Q15: 秒杀系统设计', link: '/04-design/q15-seckill-system.html' },
            { text: 'Q16: 微服务架构设计', link: '/04-design/q16-microservice-architecture.html' },
          ]
        }
      ],
      '/05-security/': [
        {
          text: '认证授权与安全',
          items: [
            { text: 'Q17: JWT Token', link: '/05-security/q17-jwt.html' },
            { text: 'Q18: SSO单点登录', link: '/05-security/q18-sso.html' },
            { text: 'Q19: 安全防护', link: '/05-security/q19-security.html' },
            { text: 'Q20: 接口幂等', link: '/05-security/q20-idempotent.html' },
          ]
        }
      ],
      '/06-middleware/': [
        {
          text: '分布式系统与中间件',
          items: [
            { text: 'Q21: Redis缓存问题', link: '/06-middleware/q21-redis-cache.html' },
            { text: 'Q22: ES同步与优化', link: '/06-middleware/q22-es-sync.html' },
            { text: 'Q23: API设计', link: '/06-middleware/q23-api-design.html' },
            { text: 'Q24: Arthas使用', link: '/06-middleware/q24-arthas.html' },
            { text: 'Q25: MySQL主从复制', link: '/06-middleware/q25-mysql-replication.html' },
            { text: 'Q26: 多级缓存架构', link: '/06-middleware/q26-multi-level-cache.html' },
            { text: 'Q27: 分布式ID', link: '/06-middleware/q27-distributed-id.html' },
            { text: 'Q28: 支付系统设计', link: '/06-middleware/q28-payment-system.html' },
            { text: 'Q29: 性能优化', link: '/06-middleware/q29-performance-optimization.html' },
            { text: 'Q30: 秒杀高可用方案', link: '/06-middleware/q30-seckill-ha.html' },
          ]
        }
      ],
      '/07-project/': [
        {
          text: '项目与职业发展',
          items: [
            { text: 'Q31: 有挑战的项目', link: '/07-project/q31-challenging-project.html' },
            { text: 'Q32: 职业规划', link: '/07-project/q32-career-plan.html' },
            { text: 'Q33: 反问面试官', link: '/07-project/q33-questions.html' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheBestBiki/interview-guide' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },

    search: {
      provider: 'local'
    }
  }
})
