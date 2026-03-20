import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '面试指南',
  description: '高级Java开发工程师面试题汇总',
  base: '/interview-guide/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/interview-guide/' },
      { text: 'Java核心', link: '/interview-guide/01-java/' },
    ],

    sidebar: [
      {
        text: 'Java核心',
        items: [
          { text: 'Q1: synchronized', link: '/interview-guide/01-java/q1-synchronized' },
          { text: 'Q2: ThreadPool', link: '/interview-guide/01-java/q2-threadpool' },
        ]
      }
    ]
  }
})
