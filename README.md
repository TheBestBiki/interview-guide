# interview-guide

高级Java开发工程师面试指南

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 构建静态页面
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## 添加新内容

在 `docs` 目录下创建 `.md` 文件即可自动生成页面：

```
docs/
├── 01-java/          # Java核心
│   └── q1-xxx.md    # 面试题
├── 02-microservice/  # 微服务
└── 03-database/      # 数据库
```

修改 `.vitepress/config.js` 更新目录配置。
