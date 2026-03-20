export default {
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',
  base: '/interview-guide/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/interview-guide/' },
      { text: 'Java核心', link: '/interview-guide/01-java/' },
      { text: '微服务', link: '/interview-guide/02-microservice/' },
      { text: '数据库', link: '/interview-guide/03-database/' },
    ],
    sidebar: {
      '/01-java/': [
        {
          text: 'Java核心与并发',
          items: [
            { text: 'Q1: synchronized和ReentrantLock', link: '/interview-guide/01-java/q1-synchronized' },
            { text: 'Q2: ThreadPoolExecutor', link: '/interview-guide/01-java/q2-threadpool' },
            { text: 'Q3: volatile与happens-before', link: '/interview-guide/01-java/q3-volatile' },
          ]
        }
      ],
      '/02-microservice/': [
        {
          text: 'SpringCloud与微服务',
          items: [
            { text: 'Q6: Spring Cloud核心组件', link: '/interview-guide/02-microservice/q6-springcloud' },
            { text: 'Q7: 分布式事务Seata', link: '/interview-guide/02-microservice/q7-seata' },
          ]
        }
      ],
      '/03-database/': [
        {
          text: '数据库与缓存',
          items: [
            { text: 'Q10: Redis数据结构', link: '/interview-guide/03-database/q10-redis' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheBestBiki/interview-guide' }
    ]
  }
}
