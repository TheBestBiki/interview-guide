# Q9: 服务间调用如何传递上下文信息？

## 场景说明

微服务架构中，用户请求经过网关→服务A→服务B→服务C时，需要传递：
- 用户ID（谁在调用）
- 租户ID（哪个租户的数据）
- TraceId（链路追踪）
- 权限信息

## 传递方式

### ① 参数传递（显式传递）

```java
// 方式一：参数显式传递
@Service
public class OrderService {
    @Autowired
    private ProductClient productClient;
    
    public Order createOrder(Long userId, Long productId) {
        // 显式传递用户ID
        Product product = productClient.getProduct(productId, userId);
    }
}

// Feign接口
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/product/{id}")
    Product getProduct(@PathVariable("id") Long id, 
                      @RequestParam("userId") Long userId);
}
```

### ② RequestContextHolder（线程内传递）

```java
// 在拦截器中设置上下文
public class FeignInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        HttpServletRequest request = ((ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes()).getRequest();
        
        // 传递用户信息
        String userId = request.getHeader("X-User-Id");
        String tenantId = request.getHeader("X-Tenant-Id");
        String traceId = request.getHeader("X-Trace-Id");
        
        template.header("X-User-Id", userId);
        template.header("X-Tenant-Id", tenantId);
        template.header("X-Trace-Id", traceId);
    }
}

// 服务内部获取
public String getCurrentUserId() {
    return RequestContextHolder.getRequestAttributes()
        .getHeader("X-User-Id");
}
```

### ③ MDC（链路追踪传递）

```java
// MDC设置TraceId
MDC.put("traceId", TraceIdGenerator.generate());

// Feign传递MDC
public class MdcInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        String traceId = MDC.get("traceId");
        if (traceId != null) {
            template.header("X-Trace-Id", traceId);
        }
    }
}

// Logback日志配置
%X{traceId}  // 在日志中输出traceId
```

### ④ Dubbo上下文（RPC传递）

```java
// 传递上下文
RpcContext.getContext().setAttachment("userId", userId);
RpcContext.getContext().setAttachment("tenantId", tenantId);

// 服务提供方获取
String userId = RpcContext.getContext().getAttachment("userId");
String tenantId = RpcContext.getContext().getAttachment("tenantId");
```

## 最佳实践：统一上下文组件

```java
// 上下文持有者
public class ContextHolder {
    private static final ThreadLocal<Map<String, Object>> context = 
        ThreadLocal.withInitial(HashMap::new);
    
    public static void set(String key, Object value) {
        context.get().put(key, value);
    }
    
    public static <T> T get(String key) {
        return (T) context.get().get(key);
    }
    
    public static String getUserId() {
        return get("userId");
    }
    
    public static String getTenantId() {
        return get("tenantId");
    }
    
    public static String getTraceId() {
        return get("traceId");
    }
    
    public static void clear() {
        context.remove();
    }
}
```

## 面试加分回答

"在服务间调用传递上下文时，我们使用MDC来传递TraceId实现链路追踪，通过Feign拦截器自动传递用户ID和租户ID。这样每个服务都能获取到原始请求的上下文信息，方便日志追踪和问题排查。在我们公司项目中，我们封装了一个ContextHolder组件，统一管理用户ID、租户ID、TraceId等上下文信息。"
