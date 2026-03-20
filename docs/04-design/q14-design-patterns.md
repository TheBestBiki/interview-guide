# Q14: 设计模式了解哪些？在项目中如何应用？

## 创建型模式

### ① 单例模式

```java
// 双重检查锁（推荐）
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### ② 工厂模式

```java
public class PaymentFactory {
    public static Payment create(String type) {
        switch (type) {
            case "alipay": return new Alipay();
            case "wechat": return new WechatPay();
            default: throw new IllegalArgumentException();
        }
    }
}
```

### ③ 建造者模式

```java
User user = User.builder()
    .name("张三")
    .age(25)
    .email("zhangsan@example.com")
    .build();
```

## 行为型模式

### ① 策略模式

```java
public interface PayStrategy {
    PayResult pay(Order order);
}

@Service("alipayStrategy")
public class AlipayStrategy implements PayStrategy {
    @Override
    public PayResult pay(Order order) { /* 支付宝支付逻辑 */ }
}

@Service
public class PaymentService {
    @Autowired
    private Map<String, PayStrategy> strategyMap;
    
    public PayResult pay(String type, Order order) {
        PayStrategy strategy = strategyMap.get(type + "Strategy");
        return strategy.pay(order);
    }
}
```

### ② 模板方法模式

```java
public abstract class AbstractOrderProcess {
    public final void process() {
        validate();
        calculate();
        deduct();
        notify();
    }
    
    protected abstract void validate();
    protected abstract void calculate();
    protected abstract void deduct();
}
```

### ③ 观察者模式

```java
// 事件发布
@Service
public class OrderEventPublisher {
    @Autowired
    private ApplicationEventPublisher publisher;
    
    public void publish(OrderCreatedEvent event) {
        publisher.publishEvent(event);
    }
}

// 监听事件
@Component
public class OrderListener {
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 发送短信、通知等
    }
}
```

## 项目中的应用

- **单例**：RedissonClient、Configuration
- **工厂**：PaymentFactory支付策略
- **策略**：支付方式、优惠计算
- **模板**：订单处理流程
- **观察者**：事件驱动、异步解耦
