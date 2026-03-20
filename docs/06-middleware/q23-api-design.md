# Q23: 如何设计一个完整的API接口？RESTful规范？

## RESTful规范

| 方法 | 语义 | 幂等 |
|------|------|------|
| GET | 查询资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 完整更新资源 | 是 |
| PATCH | 部分更新资源 | 否 |
| DELETE | 删除资源 | 是 |

## URL设计

```bash
GET    /api/v1/users              # 获取用户列表
GET    /api/v1/users/{id}         # 获取单个用户
POST   /api/v1/users              # 创建用户
PUT    /api/v1/users/{id}         # 完整更新用户
DELETE /api/v1/users/{id}         # 删除用户

# 关联资源
GET    /api/v1/users/{id}/orders  # 获取用户的订单

# 复杂查询用Query参数
GET    /api/v1/orders?status=PAID&page=1&size=20
```

## 统一响应结构

```json
// 成功响应
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "张三"
    },
    "timestamp": 1703078400000
}

// 分页响应
{
    "code": 200,
    "message": "success",
    "data": {
        "list": [],
        "page": 1,
        "size": 20,
        "total": 1000
    }
}

// 错误响应
{
    "code": 400,
    "message": "参数错误",
    "errors": [
        {"field": "email", "message": "邮箱格式不正确"}
    ]
}
```

## 接口安全设计

- **鉴权**：Authorization: Bearer \<token\>
- **参数校验**：@Valid @NotNull @Email
- **限流**：@SentinelResource
- **敏感数据脱敏**：手机号 138****1234
