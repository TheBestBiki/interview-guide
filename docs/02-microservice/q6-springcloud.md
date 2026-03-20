# Q6: Spring Cloud核心组件有哪些？

## 核心组件

| 组件 | 作用 | 常用方案 |
|------|------|----------|
| 服务注册与发现 | 服务注册、健康检查 | Nacos、Eureka |
| 负载均衡 | 请求分发 | Ribbon、LoadBalancer |
| 服务调用 | 声明式HTTP客户端 | Feign |
| 熔断降级 | 故障隔离、快速失败 | Sentinel、Hystrix |
| API网关 | 路由、限流、鉴权 | Gateway |
| 配置中心 | 集中配置、动态刷新 | Nacos、Apollo |

## 项目使用

在我们公司项目中，我们使用：
- **Spring Cloud + Nacos + Feign + Sentinel + Gateway**
