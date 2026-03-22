import{_ as a,o as n,c as p,ae as l}from"./chunks/framework.CC-i3qbO.js";const k=JSON.parse('{"title":"Q9: 吞吐量与QPS深度剖析","description":"","frontmatter":{},"headers":[],"relativePath":"01-java/q9-throughput-qps.md","filePath":"01-java/q9-throughput-qps.md"}'),i={name:"01-java/q9-throughput-qps.md"};function e(t,s,c,h,d,r){return n(),p("div",null,[...s[0]||(s[0]=[l(`<h1 id="q9-吞吐量与qps深度剖析" tabindex="-1">Q9: 吞吐量与QPS深度剖析 <a class="header-anchor" href="#q9-吞吐量与qps深度剖析" aria-label="Permalink to &quot;Q9: 吞吐量与QPS深度剖析&quot;">​</a></h1><blockquote><p>很多面试者对吞吐量、QPS、TPS、CPS这些概念混为一谈，导致面试被问住。本文帮你彻底理清这些概念，并给出实用的参考数值。</p></blockquote><h2 id="核心概念辨析" tabindex="-1">核心概念辨析 <a class="header-anchor" href="#核心概念辨析" aria-label="Permalink to &quot;核心概念辨析&quot;">​</a></h2><h3 id="什么是qps" tabindex="-1">什么是QPS？ <a class="header-anchor" href="#什么是qps" aria-label="Permalink to &quot;什么是QPS？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>QPS (Queries Per Second) = 每秒查询数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>简单理解：服务器每秒能处理多少个请求</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    QPS                              │</span></span>
<span class="line"><span>│  ← 1秒 →                                           │</span></span>
<span class="line"><span>│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │</span></span>
<span class="line"><span>│  │ req │ │ req │ │ req │ │ req │ │ req │  ...   │</span></span>
<span class="line"><span>│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  如果1秒处理了1000个请求 → QPS = 1000              │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="什么是吞吐量" tabindex="-1">什么是吞吐量？ <a class="header-anchor" href="#什么是吞吐量" aria-label="Permalink to &quot;什么是吞吐量？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>吞吐量 (Throughput) = 单位时间内处理的数据量</span></span>
<span class="line"><span></span></span>
<span class="line"><span>和QPS的关系：</span></span>
<span class="line"><span>- QPS = 每秒请求数（关注请求数量）</span></span>
<span class="line"><span>- 吞吐量 = 每秒处理数据量（关注数据量）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>举例：</span></span>
<span class="line"><span>- QPS=1000，每个请求1KB → 吞吐量 = 1MB/s</span></span>
<span class="line"><span>- QPS=100，每个请求10MB → 吞吐量 = 1MB/s</span></span></code></pre></div><h3 id="常见混淆概念" tabindex="-1">常见混淆概念 <a class="header-anchor" href="#常见混淆概念" aria-label="Permalink to &quot;常见混淆概念&quot;">​</a></h3><table tabindex="0"><thead><tr><th>概念</th><th>全称</th><th>含义</th><th>面试重点</th></tr></thead><tbody><tr><td><strong>QPS</strong></td><td>Queries Per Second</td><td>每秒查询数</td><td>单机处理能力</td></tr><tr><td><strong>TPS</strong></td><td>Transactions Per Second</td><td>每秒事务数</td><td>业务完整性</td></tr><tr><td><strong>RPS</strong></td><td>Requests Per Second</td><td>每秒请求数</td><td>同QPS</td></tr><tr><td><strong>CPS</strong></td><td>Connections Per Second</td><td>每秒新建连接数</td><td>网络层面</td></tr><tr><td><strong>RT</strong></td><td>Response Time</td><td>响应时间</td><td>用户体验</td></tr><tr><td><strong>PV</strong></td><td>Page View</td><td>页面访问量</td><td>统计口径</td></tr><tr><td><strong>UV</strong></td><td>Unique Visitor</td><td>独立访客</td><td>统计口径</td></tr></tbody></table><h3 id="qps-vs-tps-关键区别" tabindex="-1">QPS vs TPS 关键区别 <a class="header-anchor" href="#qps-vs-tps-关键区别" aria-label="Permalink to &quot;QPS vs TPS 关键区别&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>QPS = 每秒HTTP请求数（针对接口调用）</span></span>
<span class="line"><span>TPS = 每秒数据库事务数（针对数据库操作）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>重要澄清：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  QPS是针对&quot;请求&quot;的，一个HTTP请求 = 1 QPS                  │</span></span>
<span class="line"><span>│  TPS是针对&quot;事务&quot;的，一个数据库事务 = 1 TPS                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  方法内部的多次查询不算QPS！                                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="场景解析-你的理解是正确的" tabindex="-1">场景解析：你的理解是正确的！ <a class="header-anchor" href="#场景解析-你的理解是正确的" aria-label="Permalink to &quot;场景解析：你的理解是正确的！&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>以你描述的Spring Boot下单接口为例：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  HTTP请求: POST /order/create                              │</span></span>
<span class="line"><span>│    ↓                                                      │</span></span>
<span class="line"><span>│  QPS = 1 (一个请求)                                      │</span></span>
<span class="line"><span>│    ↓                                                      │</span></span>
<span class="line"><span>│  开启事务                                                 │</span></span>
<span class="line"><span>│    ↓                                                      │</span></span>
<span class="line"><span>│  查询库存 → 1次SQL                                        │</span></span>
<span class="line"><span>│  校验用户  → 1次SQL                                        │</span></span>
<span class="line"><span>│  创建订单  → 1次SQL                                        │</span></span>
<span class="line"><span>│    ↓                                                      │</span></span>
<span class="line"><span>│  提交事务                                                 │</span></span>
<span class="line"><span>│    ↓                                                      │</span></span>
<span class="line"><span>│  TPS = 1 (一个事务)                                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>结论：</span></span>
<span class="line"><span>- 你接收一个下单请求 → QPS = 1</span></span>
<span class="line"><span>- 你开启一个事务 → TPS = 1</span></span>
<span class="line"><span>- 事务里的3次SQL查询 → 只是3次数据库操作，不算QPS！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>之前的例子是我表述不清，特此更正。</span></span></code></pre></div><h3 id="什么情况下qps会大于1" tabindex="-1">什么情况下QPS会大于1？ <a class="header-anchor" href="#什么情况下qps会大于1" aria-label="Permalink to &quot;什么情况下QPS会大于1？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>场景1：前端多次请求</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  前端: 页面加载 → 发起3个HTTP请求              │</span></span>
<span class="line"><span>│    GET /api/userinfo   (查)                   │</span></span>
<span class="line"><span>│    GET /api/products    (查)                  │</span></span>
<span class="line"><span>│    POST /api/cart      (写)                   │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  结果: QPS = 3, TPS可能是1-3                   │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>详细解释：</span></span></code></pre></div><p>关键点：TPS是数据库事务数量，不是请求数量！</p><p>QPS = 3 (3个HTTP请求)</p><p>这3个请求的事务情况：</p><ol><li><p>GET /api/userinfo → 无事务 (只读，autocommit) → TPS + 0</p></li><li><p>GET /api/products → 无事务 (只读，autocommit)<br> → TPS + 0</p></li><li><p>POST /api/cart → 有事务 (插入操作) → TPS + 1</p></li></ol><p>结果：QPS = 3, TPS = 1</p><hr><p>另一种情况：3个请求都开启了事务</p><ol><li>GET /api/userinfo → 有事务 (FOR UPDATE锁读)</li><li>GET /api/products → 有事务 (FOR UPDATE锁读)</li><li>POST /api/cart → 有事务 (INSERT)</li></ol><p>结果：QPS = 3, TPS = 3</p><hr><p>为什么查询请求通常没有事务？ ┌─────────────────────────────────────────────┐ │ Spring Boot默认配置： │ │ • autocommit = true │ │ • 每个SQL单独提交 │ │ • 不占用数据库连接资源 │ │ │ │ 只有显式开启事务或写操作才占用事务： │ │ • @Transactional │ │ • INSERT/UPDATE/DELETE │ │ • SELECT ... FOR UPDATE │ └─────────────────────────────────────────────┘</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>场景2：前端轮询</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  前端: 每5秒请求一次接口获取最新数据           │</span></span>
<span class="line"><span>│    GET /api/notification (每5秒)              │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  结果: 1分钟内120次请求 → QPS = 2              │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>场景3：微服务调用</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  用户服务 → 订单服务 → 库存服务               │</span></span>
<span class="line"><span>│    1个请求 → 3个内部RPC调用                   │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  结果: 对用户来说 QPS=1                        │</span></span>
<span class="line"><span>│       订单服务承受的QPS也=1                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="面试加分话术" tabindex="-1">面试加分话术 <a class="header-anchor" href="#面试加分话术" aria-label="Permalink to &quot;面试加分话术&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>正确理解：</span></span>
<span class="line"><span>&quot;我理解QPS是针对HTTP请求/响应的，一个接口调用算1个QPS。TPS是针对数据库事务的，一个事务算1个TPS。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>比如我写的一个Spring Boot下单接口，用户调用一次POST /order/create，这是一个QPS。接口内部开启一个数据库事务执行查询、校验、下单，这是1个TPS。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>所以QPS和TPS的关系取决于：</span></span>
<span class="line"><span>- 如果是前后端分离，一个页面发多个请求 → QPS &gt; TPS</span></span>
<span class="line"><span>- 如果是后端聚合调用 → QPS &lt; TPS</span></span>
<span class="line"><span>- 如果是简单CRUD单表操作 → QPS ≈ TPS</span></span>
<span class="line"><span>&quot;</span></span></code></pre></div><h2 id="qps参考数值-你的服务器能抗多少" tabindex="-1">QPS参考数值：你的服务器能抗多少？ <a class="header-anchor" href="#qps参考数值-你的服务器能抗多少" aria-label="Permalink to &quot;QPS参考数值：你的服务器能抗多少？&quot;">​</a></h2><h3 id="不同配置的参考qps" tabindex="-1">不同配置的参考QPS <a class="header-anchor" href="#不同配置的参考qps" aria-label="Permalink to &quot;不同配置的参考QPS&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                        单机QPS参考值                                    │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  配置             │  业务类型      │  预估QPS   │      说明          │</span></span>
<span class="line"><span>├──────────────────┼───────────────┼────────────┼────────────────────┤</span></span>
<span class="line"><span>│  2核2G           │  简单查询      │   500-1000 │  纯内存操作        │</span></span>
<span class="line"><span>│  2核2G           │  常规业务      │   200-500  │  有DB/Redis调用    │</span></span>
<span class="line"><span>│  2核2G           │  复杂计算      │   50-200   │  涉及算法/IO       │</span></span>
<span class="line"><span>│  4核4G           │  简单查询      │   2000-5000│  纯内存操作        │</span></span>
<span class="line"><span>│  4核4G           │  常规业务      │   800-2000 │  有DB/Redis调用    │</span></span>
<span class="line"><span>│  4核4G           │  复杂计算      │   200-800  │  涉及算法/IO       │</span></span>
<span class="line"><span>│  8核8G           │  简单查询      │   5000-10000│  纯内存操作       │</span></span>
<span class="line"><span>│  8核8G           │  常规业务      │   2000-5000│  有DB/Redis调用    │</span></span>
<span class="line"><span>│  8核8G           │  复杂计算      │   500-2000 │  涉及算法/IO       │</span></span>
<span class="line"><span>│  16核16G         │  常规业务      │   5000-10000│  有DB/Redis调用   │</span></span>
<span class="line"><span>│  32核32G         │  常规业务      │   10000-20000│  有DB/Redis调用  │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>注意：以上是单机预估，实际会受到以下因素影响</span></span></code></pre></div><h3 id="影响因素有哪些" tabindex="-1">影响因素有哪些？ <a class="header-anchor" href="#影响因素有哪些" aria-label="Permalink to &quot;影响因素有哪些？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>QPS瓶颈分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. CPU计算型</span></span>
<span class="line"><span>   - 场景：JSON序列化/反序列化、加密解密</span></span>
<span class="line"><span>   - 瓶颈：CPU核心数</span></span>
<span class="line"><span>   - 优化：多线程、异步处理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. IO密集型</span></span>
<span class="line"><span>   - 场景：数据库查询、文件读写、网络请求</span></span>
<span class="line"><span>   - 瓶颈：磁盘IO、网络延迟</span></span>
<span class="line"><span>   - 优化：缓存、连接池、异步IO</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 内存型</span></span>
<span class="line"><span>   - 场景：大数据处理、复杂计算</span></span>
<span class="line"><span>   - 瓶颈：内存大小、GC频率</span></span>
<span class="line"><span>   - 优化：数据结构优化、减少对象创建</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 网络型</span></span>
<span class="line"><span>   - 场景：大文件上传下载、高并发推送</span></span>
<span class="line"><span>   - 瓶颈：带宽、网卡</span></span>
<span class="line"><span>   - 优化：压缩、CDN、分片</span></span></code></pre></div><h2 id="多台机器-qps如何扩展" tabindex="-1">多台机器：QPS如何扩展？ <a class="header-anchor" href="#多台机器-qps如何扩展" aria-label="Permalink to &quot;多台机器：QPS如何扩展？&quot;">​</a></h2><h3 id="理论计算" tabindex="-1">理论计算 <a class="header-anchor" href="#理论计算" aria-label="Permalink to &quot;理论计算&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>单机 QPS = 1000</span></span>
<span class="line"><span>3台机器负载均衡 → 总QPS = 3000 (理想情况)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>但实际上有损耗：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  实际QPS = 单机QPS × 机器数 × 负载均衡效率          │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  负载均衡效率通常为 70-90%                          │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  例子：                                             │</span></span>
<span class="line"><span>│  - 单机1000 QPS                                    │</span></span>
<span class="line"><span>│  - 3台机器                                         │</span></span>
<span class="line"><span>│  - 效率85%                                         │</span></span>
<span class="line"><span>│  - 实际 = 1000 × 3 × 0.85 = 2550 QPS             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="扩展方式-水平-vs-垂直" tabindex="-1">扩展方式：水平 vs 垂直 <a class="header-anchor" href="#扩展方式-水平-vs-垂直" aria-label="Permalink to &quot;扩展方式：水平 vs 垂直&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>垂直扩展 (Scale Up)：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  2核 → 4核 → 8核 → 16核                           │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  优点：简单、避免分布式复杂性                        │</span></span>
<span class="line"><span>│  缺点：有上限、成本非线性增长                       │</span></span>
<span class="line"><span>│  适用：小到中等规模                                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>水平扩展 (Scale Out)：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1台 → 3台 → 10台 → 100台                         │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  优点：理论上无限扩展                               │</span></span>
<span class="line"><span>│  缺点：分布式复杂性（一致性、事务、网络）            │</span></span>
<span class="line"><span>│  适用：大规模应用                                   │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="实际案例-3台4核8g机器" tabindex="-1">实际案例：3台4核8G机器 <a class="header-anchor" href="#实际案例-3台4核8g机器" aria-label="Permalink to &quot;实际案例：3台4核8G机器&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>配置：3台 4核8G</span></span>
<span class="line"><span>业务：常规CRUD接口（有Redis缓存+MySQL）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>理论计算：</span></span>
<span class="line"><span>- 单机预估：1500 QPS</span></span>
<span class="line"><span>- 3台负载均衡：1500 × 3 = 4500 QPS</span></span>
<span class="line"><span>- 考虑损耗(85%)：4500 × 0.85 ≈ 3800 QPS</span></span>
<span class="line"><span></span></span>
<span class="line"><span>实际建议：</span></span>
<span class="line"><span>- 日常QPS：控制在 2000 以下（留余量）</span></span>
<span class="line"><span>- 峰值QPS：可达 3500</span></span>
<span class="line"><span>- 超过4000：考虑扩容或优化</span></span></code></pre></div><h2 id="实战场景-如何根据qps做调整" tabindex="-1">实战场景：如何根据QPS做调整？ <a class="header-anchor" href="#实战场景-如何根据qps做调整" aria-label="Permalink to &quot;实战场景：如何根据QPS做调整？&quot;">​</a></h2><h3 id="场景一-日常crud接口" tabindex="-1">场景一：日常CRUD接口 <a class="header-anchor" href="#场景一-日常crud接口" aria-label="Permalink to &quot;场景一：日常CRUD接口&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  场景：用户管理系统（增删改查）                     │</span></span>
<span class="line"><span>│  单机配置：4核8G                                   │</span></span>
<span class="line"><span>│  技术栈：Spring Boot + MySQL + Redis               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>预估QPS：1500-2000</span></span>
<span class="line"><span></span></span>
<span class="line"><span>瓶颈分析：</span></span>
<span class="line"><span>- 数据库连接池</span></span>
<span class="line"><span>- Redis连接数</span></span>
<span class="line"><span>- 业务线程池</span></span>
<span class="line"><span></span></span>
<span class="line"><span>调整建议：</span></span>
<span class="line"><span>1. dbcp2连接池：10-20 → 30</span></span>
<span class="line"><span>2. Redis连接池：8 → 50</span></span>
<span class="line"><span>3. Tomcat线程：100 → 200</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优化后预估：2500-3000 QPS</span></span></code></pre></div><h3 id="场景二-高并发查询" tabindex="-1">场景二：高并发查询 <a class="header-anchor" href="#场景二-高并发查询" aria-label="Permalink to &quot;场景二：高并发查询&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  场景：商品详情页（读多写少）                        │</span></span>
<span class="line"><span>│  单机配置：4核8G                                   │</span></span>
<span class="line"><span>│  技术栈：Spring Boot + Redis缓存 + MySQL           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>预估QPS：5000-8000（缓存命中率高时）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>瓶颈分析：</span></span>
<span class="line"><span>- Redis QPS能力很强（可达10W+）</span></span>
<span class="line"><span>- 网络带宽</span></span>
<span class="line"><span>- 序列化/反序列化</span></span>
<span class="line"><span></span></span>
<span class="line"><span>调整建议：</span></span>
<span class="line"><span>1. 使用Redis集群</span></span>
<span class="line"><span>2. 减少Redis网络开销（Pipeline）</span></span>
<span class="line"><span>3. 考虑本地缓存（Caffeine）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优化后预估：10000-15000 QPS</span></span></code></pre></div><h3 id="场景三-复杂计算型" tabindex="-1">场景三：复杂计算型 <a class="header-anchor" href="#场景三-复杂计算型" aria-label="Permalink to &quot;场景三：复杂计算型&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  场景：报表统计（复杂SQL+计算）                     │</span></span>
<span class="line"><span>│  单机配置：8核16G                                   │</span></span>
<span class="line"><span>│  技术栈：Spring Boot + MySQL + ES                  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>预估QPS：100-500</span></span>
<span class="line"><span></span></span>
<span class="line"><span>瓶颈分析：</span></span>
<span class="line"><span>- 数据库CPU</span></span>
<span class="line"><span>- 复杂计算</span></span>
<span class="line"><span></span></span>
<span class="line"><span>调整建议：</span></span>
<span class="line"><span>1. 异步处理：接单后返回，异步计算</span></span>
<span class="line"><span>2. 预计算：定时任务预先算好</span></span>
<span class="line"><span>3. 降级：高峰期关闭实时统计</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优化思路：</span></span>
<span class="line"><span>不是提高QPS，而是降低QPS压力（改为批量/异步）</span></span></code></pre></div><h2 id="面试高频追问" tabindex="-1">面试高频追问 <a class="header-anchor" href="#面试高频追问" aria-label="Permalink to &quot;面试高频追问&quot;">​</a></h2><h3 id="追问1-日活100万需要多少qps" tabindex="-1">追问1：日活100万需要多少QPS？ <a class="header-anchor" href="#追问1-日活100万需要多少qps" aria-label="Permalink to &quot;追问1：日活100万需要多少QPS？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>计算过程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  100万日活                                         │</span></span>
<span class="line"><span>│  - 假设平均每人访问10次/天                          │</span></span>
<span class="line"><span>│  - PV = 100万 × 10 = 1000万                        │</span></span>
<span class="line"><span>│  - 假设80%访问集中在4小时                          │</span></span>
<span class="line"><span>│  - 每小时PV = 1000万 ÷ 4 = 250万                   │</span></span>
<span class="line"><span>│  - 每秒PV = 250万 ÷ 3600 ≈ 700                     │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  考虑峰值（3-5倍）：700 × 4 = 2800                │</span></span>
<span class="line"><span>│  留30%余量：2800 ÷ 0.7 ≈ 4000 QPS                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>结论：</span></span>
<span class="line"><span>- 日活100万 → 预估峰值4000 QPS</span></span>
<span class="line"><span>- 3台4核8G机器即可满足</span></span>
<span class="line"><span>- 如果更复杂，需要5-8台</span></span></code></pre></div><h3 id="追问2-如何评估现有系统的qps" tabindex="-1">追问2：如何评估现有系统的QPS？ <a class="header-anchor" href="#追问2-如何评估现有系统的qps" aria-label="Permalink to &quot;追问2：如何评估现有系统的QPS？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>方法1：压测工具</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  # 使用wrk                                          │</span></span>
<span class="line"><span>│  wrk -t12 -c400 -d30s http://localhost:8080/api   │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  # 使用ab                                           │</span></span>
<span class="line"><span>│  ab -n 10000 -c 100 http://localhost:8080/api     │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  # 使用JMeter                                       │</span></span>
<span class="line"><span>│  可视化配置，支持复杂场景                            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>方法2：监控观察</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  # 查看Tomcat线程数                                 │</span></span>
<span class="line"><span>│  server.tomcat.threads.busy                        │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  # 查看QPS                                          │</span></span>
<span class="line"><span>│  server.tomcat.requests.count                      │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  # 使用Prometheus + Grafana                         │</span></span>
<span class="line"><span>│  实时监控QPS变化                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问3-qps和响应时间rt什么关系" tabindex="-1">追问3：QPS和响应时间RT什么关系？ <a class="header-anchor" href="#追问3-qps和响应时间rt什么关系" aria-label="Permalink to &quot;追问3：QPS和响应时间RT什么关系？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>公式：</span></span>
<span class="line"><span>QPS = 并发数 / RT(秒)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>举例：</span></span>
<span class="line"><span>- 并发100个请求</span></span>
<span class="line"><span>- 每个请求RT=100ms</span></span>
<span class="line"><span>- QPS = 100 / 0.1 = 1000</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优化RT就能提升QPS：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  响应时间分布                                       │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  数据库查询    ████████████████████  50ms   │   │</span></span>
<span class="line"><span>│  │  业务计算      ████                    10ms   │   │</span></span>
<span class="line"><span>│  │  网络传输      █████████████           30ms   │   │</span></span>
<span class="line"><span>│  │  序列化        ████                    10ms   │   │</span></span>
<span class="line"><span>│  │  ─────────────────────────────────────       │   │</span></span>
<span class="line"><span>│  │  总计          100ms                        │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  优化方向：先优化耗时最长的（数据库）                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问4-单机qps达到瓶颈怎么办" tabindex="-1">追问4：单机QPS达到瓶颈怎么办？ <a class="header-anchor" href="#追问4-单机qps达到瓶颈怎么办" aria-label="Permalink to &quot;追问4：单机QPS达到瓶颈怎么办？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>处理流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  1. 确认瓶颈点                                     │</span></span>
<span class="line"><span>│     ├─ CPU高 → 计算密集型                          │</span></span>
<span class="line"><span>│     ├─ IO高 → IO密集型                             │</span></span>
<span class="line"><span>│     └─ 等待高 → 外部依赖                           │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  2. 短期优化（不增加机器）                          │</span></span>
<span class="line"><span>│     ├─ 缓存                                        │</span></span>
<span class="line"><span>│     ├─ 异步                                        │</span></span>
<span class="line"><span>│     ├─ 限流                                        │</span></span>
<span class="line"><span>│     └─ 代码优化                                     │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  3. 中期优化（增加资源）                            │</span></span>
<span class="line"><span>│     ├─ 垂直扩展（升级配置）                         │</span></span>
<span class="line"><span>│     └─ 水平扩展（加机器）                           │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  4. 长期优化（架构调整）                            │</span></span>
<span class="line"><span>│     ├─ 分库分表                                    │</span></span>
<span class="line"><span>│     ├─ 微服务拆分                                  │</span></span>
<span class="line"><span>│     └─ 引入MQ削峰                                  │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问5-如何设置合理的线程数" tabindex="-1">追问5：如何设置合理的线程数？ <a class="header-anchor" href="#追问5-如何设置合理的线程数" aria-label="Permalink to &quot;追问5：如何设置合理的线程数？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>公式：</span></span>
<span class="line"><span>线程数 = CPU核心数 × 目标CPU利用率 × (1 + 等待时间/计算时间)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>举例：</span></span>
<span class="line"><span>- 4核CPU</span></span>
<span class="line"><span>- 目标CPU利用率：80%</span></span>
<span class="line"><span>- 业务：等待时间10ms，计算时间5ms (IO密集型)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>线程数 = 4 × 0.8 × (1 + 10/5) = 4 × 0.8 × 3 = 9.6 ≈ 10</span></span>
<span class="line"><span></span></span>
<span class="line"><span>实际建议：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  CPU密集型：CPU核心数 + 1~2                        │</span></span>
<span class="line"><span>│  例如：4核 → 5-6个线程                             │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  IO密集型：CPU核心数 × 2                           │</span></span>
<span class="line"><span>│  例如：4核 → 8个线程                               │</span></span>
<span class="line"><span>│                                                     │</span></span>
<span class="line"><span>│  混合型：CPU核心数 × (1 + 等待/计算)               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问6-qps-vs-并发数的关系" tabindex="-1">追问6：QPS vs 并发数的关系 <a class="header-anchor" href="#追问6-qps-vs-并发数的关系" aria-label="Permalink to &quot;追问6：QPS vs 并发数的关系&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>并发数 = QPS × 平均响应时间</span></span>
<span class="line"><span></span></span>
<span class="line"><span>举例：</span></span>
<span class="line"><span>- QPS = 1000</span></span>
<span class="line"><span>- 平均RT = 100ms = 0.1s</span></span>
<span class="line"><span>- 并发数 = 1000 × 0.1 = 100</span></span>
<span class="line"><span></span></span>
<span class="line"><span>实际意义：</span></span>
<span class="line"><span>- 并发100不代表同时有100个请求在处理</span></span>
<span class="line"><span>- 可能是QPS高，RT短</span></span>
<span class="line"><span>- 1000 QPS + 100ms RT = 并发100</span></span>
<span class="line"><span>- 100 QPS + 1s RT = 也是并发100</span></span></code></pre></div><h2 id="实际开发中的qps优化" tabindex="-1">实际开发中的QPS优化 <a class="header-anchor" href="#实际开发中的qps优化" aria-label="Permalink to &quot;实际开发中的QPS优化&quot;">​</a></h2><h3 id="日常开发如何考虑qps" tabindex="-1">日常开发如何考虑QPS？ <a class="header-anchor" href="#日常开发如何考虑qps" aria-label="Permalink to &quot;日常开发如何考虑QPS？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. 接口设计阶段</span></span>
<span class="line"><span>   ┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>   │  • 查为主的接口 → 可接受高QPS               │</span></span>
<span class="line"><span>   │  • 写为主的接口 → 关注一致性               │</span></span>
<span class="line"><span>   │  • 复杂计算 → 考虑异步/批量               │</span></span>
<span class="line"><span>   └─────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 技术选型阶段</span></span>
<span class="line"><span>   ┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>   │  • QPS &lt; 1000 → 单机MySQL + Redis           │</span></span>
<span class="line"><span>   │  • QPS &lt; 10000 → 读写分离 + Redis           │</span></span>
<span class="line"><span>   │  • QPS &gt; 10000 → 分库分表 + ES              │</span></span>
<span class="line"><span>   └─────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 上线评估阶段</span></span>
<span class="line"><span>   ┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>   │  • 预估QPS                                  │</span></span>
<span class="line"><span>   │  • 准备对应配置                             │</span></span>
<span class="line"><span>   │  • 制定扩容预案                             │</span></span>
<span class="line"><span>   └─────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="代码层面的qps优化" tabindex="-1">代码层面的QPS优化 <a class="header-anchor" href="#代码层面的qps优化" aria-label="Permalink to &quot;代码层面的QPS优化&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优化前：高QPS下性能差</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> User </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Long id) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 每次都查数据库</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userMapper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">selectById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 优化后：使用缓存</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> User </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Long id) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 先查本地缓存</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    User user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> localCache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> user;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 再查Redis</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redis.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;user:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        localCache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id, user);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> user;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    </span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 最后查数据库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userMapper.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">selectById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (user </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        redis.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;user:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id, user);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        localCache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id, user);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> user;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="面试加分总结" tabindex="-1">面试加分总结 <a class="header-anchor" href="#面试加分总结" aria-label="Permalink to &quot;面试加分总结&quot;">​</a></h3><blockquote><p>&quot;我在工作中会这样评估系统QPS：</p><p>首先，明确业务类型——查多写少还是写多查少，这决定了优化方向。然后，根据服务器配置给出一个预估：4核8G常规业务大概能抗1500-2000QPS。最后，我会预留30%的余量，因为线上流量往往比预估高30%-50%。</p><p>当单机达到瓶颈时，我的处理顺序是：先优化代码和缓存，其次考虑垂直升级，最后才是水平扩展。盲目加机器是最省事但也是最贵的方案。&quot;</p></blockquote><h2 id="相关知识点" tabindex="-1">相关知识点 <a class="header-anchor" href="#相关知识点" aria-label="Permalink to &quot;相关知识点&quot;">​</a></h2><ul><li><a href="./q5-jvm-tuning.html">Q5: JVM调优与排查</a> - 配合GC优化提升QPS</li><li><a href="/interview-guide/03-database/q10-redis.html">Q16: Redis数据结构与分布式锁</a> - 缓存提升QPS</li><li><a href="/interview-guide/03-database/q11-mysql-optimization.html">Q17: MySQL索引优化与分库分表</a> - 数据库优化提升QPS</li></ul>`,70)])])}const u=a(i,[["render",e]]);export{k as __pageData,u as default};
