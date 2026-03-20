# Q17: JWT Token的原理？如何实现自动续期？

## JWT结构

```
JWT = Header.Payload.Signature

Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "1234567890", "name": "张三", "iat": 1516239022, "exp": 1516242622}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

## JWT各部分作用

- **Header**：声明算法类型（HS256/RSA）
- **Payload**：存放业务数据（用户ID、角色、过期时间）
- **Signature**：签名防篡改

## JWT优缺点

| 优点 | 缺点 |
|------|------|
| 无状态，服务端无需存储 | 一旦签发无法撤销 |
| 跨语言，支持所有语言 | Token体积较大 |
| 适合分布式系统 | 无法主动失效 |

## 自动续期方案：双Token

```java
// 1. AccessToken：短期token（如30分钟），用于接口访问
// 2. RefreshToken：长期token（如7天），用于刷新AccessToken

// 登录时返回
{
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 1800
}

// 拦截器逻辑
public boolean preHandle(HttpServletRequest request) {
    String token = getToken(request);
    
    if (isValidAccessToken(token)) {
        return true;
    }
    
    // AccessToken过期，尝试用RefreshToken刷新
    String refreshToken = getRefreshToken(request);
    if (isValidRefreshToken(refreshToken)) {
        String newAccessToken = jwtUtils.generateAccessToken(refreshToken);
        response.setHeader("New-Access-Token", newAccessToken);
        return true;
    }
    
    return false;
}
```

## 面试加分回答

"JWT无状态的特点适合微服务架构，但需要解决续期和失效问题。我的方案是双Token：AccessToken用于接口调用，30分钟过期；RefreshToken用于刷新，7天过期。当AccessToken过期时，自动用RefreshToken换取新的AccessToken，实现无感知续期。"
