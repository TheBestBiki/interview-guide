export default {
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',
  base: '/interview-guide/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/interview-guide/' },
      { text: 'Java核心', link: '/interview-guide/01-java/' },
      { text: '微服务', link: '/interview-guide/02-microservice/' },
    ],
    sidebar: {
      '/01-java/': [
        {
          text: 'Java核心与并发',
          collapsed: false,
          items: [
            { text: 'Q1: synchronized和ReentrantLock', link: '/interview-guide/01-java/q1-synchronized' },
            { text: 'Q2: ThreadPoolExecutor', link: '/interview-guide/01-java/q2-threadpool' },
          ]
        }
      ],
      '/02-microservice/': [
        {
          text: 'SpringCloud与微服务',
          collapsed: false,
          items: [
            { text: 'Q6: Spring Cloud核心组件', link: '/interview-guide/02-microservice/q6-springcloud' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheBestBiki/interview-guide' }
    ]
  }
}
