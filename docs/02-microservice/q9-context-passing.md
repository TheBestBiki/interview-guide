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
        
        template.header("X-User-Id", request.getHeader("X-User-Id"));
        template.header("X-Tenant-Id", request.getHeader("X-Tenant-Id"));
    }
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
```

## 最佳实践：统一上下文组件

```java
public class ContextHolder {
    private static final ThreadLocal<Map<String, Object>> context = 
        ThreadLocal.withInitial(HashMap::new);
    
    public static void set(String key, Object value) {
        context.get().put(key, value);
    }
    
    public static String getUserId() {
        return get("userId");
    }
    
    public static void clear() {
        context.remove();
    }
}
```
