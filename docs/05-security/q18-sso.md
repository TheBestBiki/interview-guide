# Q18: SSO单点登录如何实现？CAS原理？

## SSO核心概念

- **SSO（Single Sign-On）**：一次登录，处处访问
- **CAS（Central Authentication Service）**：中央认证服务
- **Ticket**：票据，CAS的核心

## CAS流程

1. 用户访问系统A → 系统A发现未登录，重定向到CAS服务器
2. 用户在CAS页面输入用户名密码
3. CAS验证成功，创建TGT，创建ST，重定向回系统A
4. 系统A收到ST，向CAS验证票据有效性
5. CAS返回成功和用户信息
6. 系统A创建局部会话
7. 用户访问系统B → 系统B发现未登录，重定向到CAS
8. CAS检测到TGT存在，直接创建ST，重定向回系统B
9. 系统B验证ST，创建局部会话
10. 用户在系统B也登录成功

## JWT实现SSO（轻量级方案）

```java
// 共享Redis存储登录状态
// 登录流程
public String login(String username, String password) {
    User user = userService.validate(username, password);
    String token = jwtUtils.generateToken(user.getId());
    
    redisTemplate.opsForValue().set(
        "sso:token:" + token,
        JsonUtils.toJson(user),
        7, TimeUnit.DAYS
    );
    
    return token;
}
```

## OAuth2.0与SSO

OAuth2.0角色：
- **Resource Owner**：资源所有者 - 用户
- **Client**：客户端 - 第三方应用
- **Authorization Server**：授权服务器
- **Resource Server**：资源服务器
