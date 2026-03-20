export default {
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java核心', link: '/01-java/' },
      { text: '微服务', link: '/02-microservice/' },
      { text: '数据库', link: '/03-database/' },
    ],
    sidebar: {
      '/01-java/': [
        {
          text: 'Java核心与并发',
          items: [
            { text: 'Q1: synchronized和ReentrantLock', link: '/01-java/q1-synchronized' },
            { text: 'Q2: ThreadPoolExecutor', link: '/01-java/q2-threadpool' },
            { text: 'Q3: volatile与happens-before', link: '/01-java/q3-volatile' },
          ]
        }
      ],
      '/02-microservice/': [
        {
          text: 'SpringCloud与微服务',
          items: [
            { text: 'Q6: Spring Cloud核心组件', link: '/02-microservice/q6-springcloud' },
            { text: 'Q7: 分布式事务Seata', link: '/02-microservice/q7-seata' },
          ]
        }
      ],
      '/03-database/': [
        {
          text: '数据库与缓存',
          items: [
            { text: 'Q10: Redis数据结构', link: '/03-database/q10-redis' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/interview-guide' }
    ]
  }
}
