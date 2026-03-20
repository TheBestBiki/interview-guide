# Q28: 如何设计一个可靠的支付系统？

## 支付系统架构

```
┌─────────────────────────────────────────┐
│                 接入层                    │
│  APP/Web → API Gateway → 鉴权/限流        │
└─────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────┐
│                 业务层                    │
│  订单 → 支付 → 退款 → 对账                │
└─────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────┐
│                 通道层                    │
│  支付宝/微信/银联/银行                    │
└─────────────────────────────────────────┘
```

## 支付流程

1. 用户选择支付方式，提交支付
2. 系统创建支付订单，状态=待支付
3. 调用第三方支付渠道
4. 用户在第三方页面完成支付
5. 第三方异步回调通知
6. 系统验签、更新订单状态
7. 通知业务系统
8. 给用户发送通知

## 支付安全

### 签名验签

```java
// 请求签名
String sign = MD5(amount + orderNo + secretKey);

// 回调验签
public boolean verifySign(Map<String, String> params) {
    String sign = params.remove("sign");
    String mySign = MD5(sortedParams + secretKey);
    return sign.equals(mySign);
}
```

### 回调幂等

```java
public void handlePayCallback(PayCallback callback) {
    if (payOrderService.isCallbackProcessed(orderNo)) {
        return;  // 已处理
    }
    // 验签、更新状态、标记已处理
}
```

## 对账系统

1. 拉取渠道交易数据
2. 拉取本地交易数据
3. 比对两边数据
4. 找出差异（长款/短款）
5. 自动/人工调账
