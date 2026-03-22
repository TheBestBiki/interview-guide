import{_ as a,o as n,c as p,ae as l}from"./chunks/framework.CC-i3qbO.js";const k=JSON.parse('{"title":"Q8: JVM内存模型深度剖析","description":"","frontmatter":{},"headers":[],"relativePath":"01-java/q8-jvm-memory-model.md","filePath":"01-java/q8-jvm-memory-model.md"}'),e={name:"01-java/q8-jvm-memory-model.md"};function i(c,s,t,r,o,h){return n(),p("div",null,[...s[0]||(s[0]=[l(`<h1 id="q8-jvm内存模型深度剖析" tabindex="-1">Q8: JVM内存模型深度剖析 <a class="header-anchor" href="#q8-jvm内存模型深度剖析" aria-label="Permalink to &quot;Q8: JVM内存模型深度剖析&quot;">​</a></h1><blockquote><p><strong>特别说明</strong>：JVM内存模型容易混淆两个概念：</p><ul><li><strong>JVM运行时数据区</strong>：JVM运行时的内存布局（哪些区域、存什么数据）</li><li><strong>JMM (Java Memory Model)</strong>：Java多线程访问内存的抽象模型（volatile、synchronized的底层原理）</li></ul><p>本篇主要讲<strong>运行时数据区</strong>，并在最后对比JMM。</p></blockquote><h2 id="jvm运行时数据区全景图" tabindex="-1">JVM运行时数据区全景图 <a class="header-anchor" href="#jvm运行时数据区全景图" aria-label="Permalink to &quot;JVM运行时数据区全景图&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         JVM 进程内存                                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  线程共享区域                                                      │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  堆 (Heap)                                                │    │</span></span>
<span class="line"><span>│  │  - 对象实例                                                │    │</span></span>
<span class="line"><span>│  │  - 数组                                                  │    │</span></span>
<span class="line"><span>│  │  - String常量池 (1.7)                                    │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  元空间 (Metaspace) - JDK 8+                               │    │</span></span>
<span class="line"><span>│  │  - 类元数据                                                │    │</span></span>
<span class="line"><span>│  │  - 方法元数据                                              │    │</span></span>
<span class="line"><span>│  │  - JIT编译结果                                            │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  直接内存 (Direct Memory) - NIO                            │    │</span></span>
<span class="line"><span>│  │  - ByteBuffer                                            │    │</span></span>
<span class="line"><span>│  │  - MappedByteBuffer                                      │    │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  线程私有区域                                                      │</span></span>
<span class="line"><span>│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │</span></span>
<span class="line"><span>│  │  虚拟机栈        │  │  本地方法栈      │  │  程序计数器     │  │</span></span>
<span class="line"><span>│  │  (VM Stack)     │  │  (Native Stack)  │  │  (PC Register)  │  │</span></span>
<span class="line"><span>│  │                  │  │                  │  │                 │  │</span></span>
<span class="line"><span>│  │  - 局部变量表    │  │  - Native方法    │  │  - 字节码行号  │  │</span></span>
<span class="line"><span>│  │  - 操作数栈      │  │  - JNI调用       │  │  - 方法索引    │  │</span></span>
<span class="line"><span>│  │  - 动态链接     │  │                  │  │                 │  │</span></span>
<span class="line"><span>│  │  - 方法返回地址 │  │                  │  │                 │  │</span></span>
<span class="line"><span>│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="核心区域详解" tabindex="-1">核心区域详解 <a class="header-anchor" href="#核心区域详解" aria-label="Permalink to &quot;核心区域详解&quot;">​</a></h2><h3 id="_1-堆-heap-核心重灾区" tabindex="-1">1. 堆 (Heap) - 核心重灾区 <a class="header-anchor" href="#_1-堆-heap-核心重灾区" aria-label="Permalink to &quot;1. 堆 (Heap) - 核心重灾区&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>存储内容：</span></span>
<span class="line"><span>- 对象实例（几乎所有）</span></span>
<span class="line"><span>- 数组</span></span>
<span class="line"><span>- Class对象</span></span>
<span class="line"><span>- String常量池（JDK 7及之前在PermGen，之后移入堆）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分区（JDK 8+）：</span></span>
<span class="line"><span>┌────────────────────────────────────────┐</span></span>
<span class="line"><span>│              堆内存                      │</span></span>
<span class="line"><span>├─────────────────────┬──────────────────┤</span></span>
<span class="line"><span>│      新生代         │     老年代        │</span></span>
<span class="line"><span>│  ┌─────┬─────┬───┐  │                   │</span></span>
<span class="line"><span>│  │Eden │ S0  │S1 │  │                   │</span></span>
<span class="line"><span>│  │ 80% │ 10% │10%│  │     60%           │</span></span>
<span class="line"><span>│  └─────┴─────┴───┘  │                   │</span></span>
<span class="line"><span>│      40%           │                   │</span></span>
<span class="line"><span>└─────────────────────┴──────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>特点：</span></span>
<span class="line"><span>- 线程共享，需要加锁</span></span>
<span class="line"><span>- OOM主要发生地</span></span>
<span class="line"><span>- 垃圾回收的主要工作区</span></span>
<span class="line"><span>- 可通过 -Xms -Xmx 配置</span></span></code></pre></div><h3 id="_2-元空间-metaspace-jdk-8-重大变化" tabindex="-1">2. 元空间 (Metaspace) - JDK 8+ 重大变化 <a class="header-anchor" href="#_2-元空间-metaspace-jdk-8-重大变化" aria-label="Permalink to &quot;2. 元空间 (Metaspace) - JDK 8+ 重大变化&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>JDK 7及之前：PermGen（永久代）</span></span>
<span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│ PermGen (永久代)                        │</span></span>
<span class="line"><span>│ - 类信息                                │</span></span>
<span class="line"><span>│ - 常量池                               │</span></span>
<span class="line"><span>│ - 静态变量                             │</span></span>
<span class="line"><span>│ - JIT编译代码                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span>
<span class="line"><span>问题：固定大小，容易OOM</span></span>
<span class="line"><span></span></span>
<span class="line"><span>JDK 8+：Metaspace（元空间）</span></span>
<span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Metaspace (元空间)                      │</span></span>
<span class="line"><span>│ - 类元数据                              │</span></span>
<span class="line"><span>│ - 方法元数据                           │</span></span>
<span class="line"><span>│ - JIT编译结果                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span>
<span class="line"><span>特点：使用本地内存，动态扩展</span></span>
<span class="line"><span></span></span>
<span class="line"><span>配置参数：</span></span>
<span class="line"><span>-XX:MetaspaceSize=256m    # 初始大小</span></span>
<span class="line"><span>-XX:MaxMetaspaceSize=     # 无限制（默认）</span></span></code></pre></div><h3 id="_3-虚拟机栈-vm-stack" tabindex="-1">3. 虚拟机栈 (VM Stack) <a class="header-anchor" href="#_3-虚拟机栈-vm-stack" aria-label="Permalink to &quot;3. 虚拟机栈 (VM Stack)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>结构：每个线程一个栈</span></span>
<span class="line"><span>┌────────────────────────────────────────┐</span></span>
<span class="line"><span>│  栈帧 (Stack Frame)                    │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  局部变量表 (Local Variables)    │  │</span></span>
<span class="line"><span>│  │  - 参数                          │  │</span></span>
<span class="line"><span>│  │  - 局部变量                      │  │</span></span>
<span class="line"><span>│  │  - returnAddress (返回地址)      │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  操作数栈 (Operand Stack)        │  │</span></span>
<span class="line"><span>│  │  - 计算中间结果                   │  │</span></span>
<span class="line"><span>│  │  - 指令操作数                    │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  动态链接 (Dynamic Linking)      │  │</span></span>
<span class="line"><span>│  │  - 指向运行时常量池               │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘  │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │  方法返回地址 (Return Address)   │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘  │</span></span>
<span class="line"><span>└────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>单位：栈帧</span></span>
<span class="line"><span>大小：-Xss1m (默认1MB)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>异常：</span></span>
<span class="line"><span>- StackOverflowError：栈深度超限（递归没退出）</span></span>
<span class="line"><span>- OutOfMemoryError：栈内存不足（线程过多）</span></span></code></pre></div><h3 id="_4-本地方法栈-native-stack" tabindex="-1">4. 本地方法栈 (Native Stack) <a class="header-anchor" href="#_4-本地方法栈-native-stack" aria-label="Permalink to &quot;4. 本地方法栈 (Native Stack)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>与虚拟机栈的区别：</span></span>
<span class="line"><span>- 虚拟机栈：执行Java方法</span></span>
<span class="line"><span>- 本地方法栈：执行Native方法（JNI）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>HotSpot实现：</span></span>
<span class="line"><span>- 虚拟机栈和本地方法栈合一</span></span>
<span class="line"><span>- 使用相同的 -Xss 参数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>其他JVM：</span></span>
<span class="line"><span>- 分离实现（如IBM J9）</span></span>
<span class="line"><span>- 独立配置（如 -Xoss）</span></span></code></pre></div><h3 id="_5-程序计数器-program-counter-register" tabindex="-1">5. 程序计数器 (Program Counter Register) <a class="header-anchor" href="#_5-程序计数器-program-counter-register" aria-label="Permalink to &quot;5. 程序计数器 (Program Counter Register)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>作用：</span></span>
<span class="line"><span>- 记录当前线程执行的字节码行号</span></span>
<span class="line"><span>- 执行Native方法时：undefined</span></span>
<span class="line"><span>- 执行Java方法时：字节码行号</span></span>
<span class="line"><span></span></span>
<span class="line"><span>特点：</span></span>
<span class="line"><span>- 线程私有</span></span>
<span class="line"><span>- 唯一不会发生OOM的区域</span></span>
<span class="line"><span>- CPU时间片切换后恢复执行位置</span></span></code></pre></div><h2 id="面试高频追问" tabindex="-1">面试高频追问 <a class="header-anchor" href="#面试高频追问" aria-label="Permalink to &quot;面试高频追问&quot;">​</a></h2><h3 id="追问1-为什么需要堆和方法区分离" tabindex="-1">追问1：为什么需要堆和方法区分离？ <a class="header-anchor" href="#追问1-为什么需要堆和方法区分离" aria-label="Permalink to &quot;追问1：为什么需要堆和方法区分离？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>设计意图：</span></span>
<span class="line"><span>┌────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  堆 (共享)           │  方法区 (共享)             │</span></span>
<span class="line"><span>│  - 对象实例          │  - 类信息（不变）           │</span></span>
<span class="line"><span>│  - 频繁创建/销毁     │  - 加载后不变               │</span></span>
<span class="line"><span>│  - 需要GC            │  - 一般不需要GC             │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分离好处：</span></span>
<span class="line"><span>1. 不同的生命周期 → 不同的管理策略</span></span>
<span class="line"><span>2. 对象实例需要GC，类信息基本不需要</span></span>
<span class="line"><span>3. 内存效率最大化</span></span>
<span class="line"><span>4. 垃圾回收器可以专注堆</span></span></code></pre></div><h3 id="追问2-jdk-8为什么要移除permgen" tabindex="-1">追问2：JDK 8为什么要移除PermGen？ <a class="header-anchor" href="#追问2-jdk-8为什么要移除permgen" aria-label="Permalink to &quot;追问2：JDK 8为什么要移除PermGen？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>PermGen的问题：</span></span>
<span class="line"><span>┌────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ PermGen (固定大小)                         │</span></span>
<span class="line"><span>│ - -XX:MaxPermSize=64m                     │</span></span>
<span class="line"><span>│ - 难以调优                                 │</span></span>
<span class="line"><span>│ - 容易OOM: PermGen space                  │</span></span>
<span class="line"><span>│ - 类加载过多就满                           │</span></span>
<span class="line"><span>│ - 浪费内存：即使释放也不会还给我们         │</span></span>
<span class="line"><span>└────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Metaspace的优势：</span></span>
<span class="line"><span>┌────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Metaspace (动态扩展)                       │</span></span>
<span class="line"><span>│ - 使用本地内存（Native Memory）            │</span></span>
<span class="line"><span>│ - 默认无上限                               │</span></span>
<span class="line"><span>│ - 释放后归还操作系统                       │</span></span>
<span class="line"><span>│ - 类卸载能力                               │</span></span>
<span class="line"><span>│ - 更灵活                                   │</span></span>
<span class="line"><span>└────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>注意：Metaspace OOM 会抛出：</span></span>
<span class="line"><span>java.lang.OutOfMemoryError: Metaspace</span></span></code></pre></div><h3 id="追问3-对象在堆中的分配过程" tabindex="-1">追问3：对象在堆中的分配过程？ <a class="header-anchor" href="#追问3-对象在堆中的分配过程" aria-label="Permalink to &quot;追问3：对象在堆中的分配过程？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>分配流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1. TLAB分配 (Thread Local Allocation Buffer) │</span></span>
<span class="line"><span>│     每个线程预分配Eden区一小块                   │</span></span>
<span class="line"><span>│     └── 线程私有，无需加锁                      │</span></span>
<span class="line"><span>│              ↓                                  │</span></span>
<span class="line"><span>│  2. Eden区分配                                  │</span></span>
<span class="line"><span>│     ├── 有空间 → 分配成功                       │</span></span>
<span class="line"><span>│     └── 空间不足 → 触发Minor GC                 │</span></span>
<span class="line"><span>│              ↓                                  │</span></span>
<span class="line"><span>│  3. 老年代分配 (大对象/分配担保)                 │</span></span>
<span class="line"><span>│     ├── -XX:PretenureSizeThreshold=1MB         │</span></span>
<span class="line"><span>│     └── 直接在Old区分配                         │</span></span>
<span class="line"><span>│              ↓                                  │</span></span>
<span class="line"><span>│  4. 分配失败 → Full GC                         │</span></span>
<span class="line"><span>│              ↓                                  │</span></span>
<span class="line"><span>│  5. 还失败 → OOM                               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问4-string常量池在哪里" tabindex="-1">追问4：String常量池在哪里？ <a class="header-anchor" href="#追问4-string常量池在哪里" aria-label="Permalink to &quot;追问4：String常量池在哪里？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>JDK 6 及之前：</span></span>
<span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  PermGen (永久代)                   │</span></span>
<span class="line"><span>│  ┌─────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  String Constant Pool      │    │</span></span>
<span class="line"><span>│  │  (字符串常量池)              │    │</span></span>
<span class="line"><span>│  └─────────────────────────────┘    │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>JDK 7：</span></span>
<span class="line"><span>┌─────────────────────────────────────┐</span></span>
<span class="line"><span>│  堆 (Heap)                          │</span></span>
<span class="line"><span>│  ┌─────────────────────────────┐    │</span></span>
<span class="line"><span>│  │  String Constant Pool      │    │</span></span>
<span class="line"><span>│  │  (字符串常量池)              │    │</span></span>
<span class="line"><span>│  └─────────────────────────────┘    │</span></span>
<span class="line"><span>│  - 从PermGen移到堆                  │</span></span>
<span class="line"><span>│  - 受GC管理                          │</span></span>
<span class="line"><span>└─────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>intern() 方法变化：</span></span>
<span class="line"><span>- JDK 6: 始终在PermGen创建</span></span>
<span class="line"><span>- JDK 7+: 先检查堆常量池，没有才创建</span></span></code></pre></div><h3 id="追问5-直接内存-direct-memory-是什么" tabindex="-1">追问5：直接内存 (Direct Memory) 是什么？ <a class="header-anchor" href="#追问5-直接内存-direct-memory-是什么" aria-label="Permalink to &quot;追问5：直接内存 (Direct Memory) 是什么？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>定义：JVM进程在Native分配的内存，不受JVM堆管理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>使用场景：</span></span>
<span class="line"><span>┌────────────────────────────────────────┐</span></span>
<span class="line"><span>│  NIO (New I/O)                        │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  ByteBuffer.allocateDirect()    │ │</span></span>
<span class="line"><span>│  │  - 堆外内存                      │ │</span></span>
<span class="line"><span>│  │  - 零拷贝                       │ │</span></span>
<span class="line"><span>│  │  - 高性能网络/文件IO            │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘ │</span></span>
<span class="line"><span>└────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>配置：</span></span>
<span class="line"><span>-XX:MaxDirectMemorySize=1g   # 直接内存最大</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优势：</span></span>
<span class="line"><span>- 减少堆内存占用</span></span>
<span class="line"><span>- 减少GC压力</span></span>
<span class="line"><span>- IO操作零拷贝</span></span>
<span class="line"><span></span></span>
<span class="line"><span>注意：</span></span>
<span class="line"><span>- 不受GC管理，需要手动释放</span></span>
<span class="line"><span>- 容易导致OOM: Direct buffer memory</span></span></code></pre></div><h3 id="追问6-栈帧包含哪些内容" tabindex="-1">追问6：栈帧包含哪些内容？ <a class="header-anchor" href="#追问6-栈帧包含哪些内容" aria-label="Permalink to &quot;追问6：栈帧包含哪些内容？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>栈帧结构：</span></span>
<span class="line"><span>┌────────────────────────────────────────┐</span></span>
<span class="line"><span>│  局部变量表 (Local Variables)          │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │ slot 0: this (非静态方法)       │ │</span></span>
<span class="line"><span>│  │ slot 1: 第一个参数              │ │</span></span>
<span class="line"><span>│  │ slot 2: 第二个参数              │ │</span></span>
<span class="line"><span>│  │ ...                             │ │</span></span>
<span class="line"><span>│  │ slot n: 局部变量                │ │</span></span>
<span class="line"><span>│  │ - 基本类型：1个slot            │ │</span></span>
<span class="line"><span>│  │ - long/double：2个slot         │ │</span></span>
<span class="line"><span>│  │ - 对象引用：1个slot             │ │</span></span>
<span class="line"><span>│  └──────────────────────────────────┘ │</span></span>
<span class="line"><span>│  大小：-XX:LocalVariableTableCheck     │</span></span>
<span class="line"><span>├────────────────────────────────────────┤</span></span>
<span class="line"><span>│  操作数栈 (Operand Stack)              │</span></span>
<span class="line"><span>│  - 表达式求值                           │</span></span>
<span class="line"><span>│  - 最大深度：编译时确定                  │</span></span>
<span class="line"><span>│  - 典型操作：dup, swap, iadd, ifeq    │</span></span>
<span class="line"><span>├────────────────────────────────────────┤</span></span>
<span class="line"><span>│  动态链接 (Dynamic Linking)            │</span></span>
<span class="line"><span>│  - 符号引用 → 直接引用                  │</span></span>
<span class="line"><span>│  - 方法调用指令 → 实际方法               │</span></span>
<span class="line"><span>├────────────────────────────────────────┤</span></span>
<span class="line"><span>│  方法返回地址 (Return Address)          │</span></span>
<span class="line"><span>│  - 方法正常返回                          │</span></span>
<span class="line"><span>│  - 方法异常返回                          │</span></span>
<span class="line"><span>└────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问7-什么是tlab" tabindex="-1">追问7：什么是TLAB？ <a class="header-anchor" href="#追问7-什么是tlab" aria-label="Permalink to &quot;追问7：什么是TLAB？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TLAB (Thread Local Allocation Buffer)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>背景：</span></span>
<span class="line"><span>- 堆是线程共享</span></span>
<span class="line"><span>- 对象分配需要同步（CAS）</span></span>
<span class="line"><span>- 竞争激烈影响性能</span></span>
<span class="line"><span></span></span>
<span class="line"><span>解决方案：</span></span>
<span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│  每个线程预分配一小块Eden区              │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────┐ │</span></span>
<span class="line"><span>│  │  Thread 1 TLAB    │  Thread 2 TLAB │ │</span></span>
<span class="line"><span>│  │  [=====]          │  [=====]        │ │</span></span>
<span class="line"><span>│  │  Eden区          │  Eden区          │ │</span></span>
<span class="line"><span>│  └────────────────────────────────────┘ │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>配置参数：</span></span>
<span class="line"><span>-XX:+UseTLAB           # 启用TLAB（默认）</span></span>
<span class="line"><span>-XX:TLABSize=50k       # TLAB大小</span></span>
<span class="line"><span>-XX:TLABRefillWasteThreshold=1k  # 浪费阈值</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点：</span></span>
<span class="line"><span>- 分配无需加锁</span></span>
<span class="line"><span>- 减少竞争</span></span>
<span class="line"><span>- 提高性能</span></span></code></pre></div><h3 id="追问8-运行时常量池-vs-字符串常量池" tabindex="-1">追问8：运行时常量池 vs 字符串常量池 <a class="header-anchor" href="#追问8-运行时常量池-vs-字符串常量池" aria-label="Permalink to &quot;追问8：运行时常量池 vs 字符串常量池&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>容易混淆的两者：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  运行时常量池 (Runtime Constant Pool)          │</span></span>
<span class="line"><span>│  - 属于方法区                                   │</span></span>
<span class="line"><span>│  - 类加载后，class文件常量池进入方法区           │</span></span>
<span class="line"><span>│  - 包含：                                       │</span></span>
<span class="line"><span>│    • 字面量 (字面量)                            │</span></span>
<span class="line"><span>│    • 符号引用 (方法/字段引用)                   │</span></span>
<span class="line"><span>│    • 方法句柄                                   │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  字符串常量池 (String Constant Pool)            │</span></span>
<span class="line"><span>│  - 属于堆（JDK 7+）                             │</span></span>
<span class="line"><span>│  - 存储字符串字面量                             │</span></span>
<span class="line"><span>│  - intern()方法使用                             │</span></span>
<span class="line"><span>│  - 类似一个Map&lt;String, String&gt;                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>关系：</span></span>
<span class="line"><span>- 字符串常量池是运行时常量池的一部分</span></span>
<span class="line"><span>- 运行时常量池包含更多类型的常量</span></span></code></pre></div><h3 id="追问9-jvm内存模型-vs-jmm-java-memory-model" tabindex="-1">追问9：JVM内存模型 vs JMM (Java Memory Model) <a class="header-anchor" href="#追问9-jvm内存模型-vs-jmm-java-memory-model" aria-label="Permalink to &quot;追问9：JVM内存模型 vs JMM (Java Memory Model)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>这是两个完全不同的概念！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  JVM内存模型 (JVM Memory Model)                         │</span></span>
<span class="line"><span>│  = JVM Runtime Data Areas                              │</span></span>
<span class="line"><span>│  回答：JVM运行时，数据在哪里存储？                      │</span></span>
<span class="line"><span>│  - 堆、栈、方法区、本地方法栈、PC寄存器                 │</span></span>
<span class="line"><span>│  - 物理层面的内存布局                                   │</span></span>
<span class="line"><span>│  - 面试常问：内存溢出、内存分配                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  JMM (Java Memory Model)                               │</span></span>
<span class="line"><span>│  回答：多线程如何访问共享变量？                         │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │  线程A                    线程B                  │   │</span></span>
<span class="line"><span>│  │  ┌───────┐              ┌───────┐              │   │</span></span>
<span class="line"><span>│  │  │工作内存│ ← ── → │工作内存│              │   │</span></span>
<span class="line"><span>│  │  └───────┘    ↑     └───────┘              │   │</span></span>
<span class="line"><span>│  │       │       │         │                   │   │</span></span>
<span class="line"><span>│  │       └───────┼─────────┘                   │   │</span></span>
<span class="line"><span>│  │               ↓                             │   │</span></span>
<span class="line"><span>│  │       ┌───────────────────┐                 │   │</span></span>
<span class="line"><span>│  │       │    主内存 (Main)   │                 │   │</span></span>
<span class="line"><span>│  │       │  - 堆中的实例      │                 │   │</span></span>
<span class="line"><span>│  │       │  - 方法区中的数据  │                 │   │</span></span>
<span class="line"><span>│  │       └───────────────────┘                 │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│  - volatile、synchronized底层原理                     │</span></span>
<span class="line"><span>│  - happens-before 规则                                 │</span></span>
<span class="line"><span>│  - 解决可见性、有序性问题                               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="追问10-内存溢出-oom-有哪些类型" tabindex="-1">追问10：内存溢出(OOM)有哪些类型？ <a class="header-anchor" href="#追问10-内存溢出-oom-有哪些类型" aria-label="Permalink to &quot;追问10：内存溢出(OOM)有哪些类型？&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>常见OOM类型：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. java.lang.OutOfMemoryError: Java heap space</span></span>
<span class="line"><span>   - 堆内存不足</span></span>
<span class="line"><span>   - 原因：对象太多、内存泄漏</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. java.lang.OutOfMemoryError: Metaspace</span></span>
<span class="line"><span>   - 元空间不足</span></span>
<span class="line"><span>   - 原因：类加载过多</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. java.lang.OutOfMemoryError: Direct buffer memory</span></span>
<span class="line"><span>   - 直接内存不足</span></span>
<span class="line"><span>   - 原因：NIO使用过多</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. java.lang.OutOfMemoryError: unable to create native thread</span></span>
<span class="line"><span>   - 线程数量过多</span></span>
<span class="line"><span>   - 原因：创建大量线程</span></span>
<span class="line"><span></span></span>
<span class="line"><span>5. java.lang.OutOfMemoryError: GC overhead limit exceeded</span></span>
<span class="line"><span>   - GC开销超限</span></span>
<span class="line"><span>   - 原因：频繁GC但回收效果差</span></span>
<span class="line"><span></span></span>
<span class="line"><span>6. java.lang.OutOfMemoryError: PermGen space (JDK 7-)</span></span>
<span class="line"><span>   - 永久代不足</span></span>
<span class="line"><span>   - 原因：类加载过多（JDK 7-）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>栈溢出：</span></span>
<span class="line"><span>- java.lang.StackOverflowError</span></span>
<span class="line"><span>  原因：递归调用太深</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- java.lang.OutOfMemoryError: native stack overflow</span></span>
<span class="line"><span>  原因：Native方法调用过深</span></span></code></pre></div><h2 id="jvm参数速查表" tabindex="-1">JVM参数速查表 <a class="header-anchor" href="#jvm参数速查表" aria-label="Permalink to &quot;JVM参数速查表&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 堆内存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-Xms4g</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 初始堆大小</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-Xmx4g</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 最大堆大小</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-Xmn2g</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 新生代大小</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:NewRatio</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 老年代/新生代=2</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 元空间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:MetaspaceSize</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=256m</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 初始元空间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:MaxMetaspaceSize</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # 最大（默认无限制）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 栈</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-Xss1m</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 线程栈大小</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-Xss512k</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # 更小的栈</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 直接内存</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:MaxDirectMemorySize</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=1g</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># TLAB</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:+UseTLAB</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # 启用TLAB</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:TLABSize</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=50k</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # TLAB大小</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 其他</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:SurvivorRatio</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=8</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # Eden/Survivor=8</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-XX:PretenureSizeThreshold</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">=1m</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 大对象阈值</span></span></code></pre></div><h2 id="面试加分总结" tabindex="-1">面试加分总结 <a class="header-anchor" href="#面试加分总结" aria-label="Permalink to &quot;面试加分总结&quot;">​</a></h2><blockquote><p>&quot;JVM内存模型是Java开发者的基本功。我把它分成两部分理解：</p><p><strong>运行时数据区</strong>是物理层面的：堆存对象、栈存方法调用、方法区存类信息。这里面试最常问的是堆内存划分和JDK 8移除PermGen的原因。</p><p><strong>JMM</strong>是抽象层面的：解决多线程可见性和有序性问题。面试官常通过volatile、synchronized来考察你对这个的理解。</p><p>很多人容易混淆这两个概念，我面试时会主动说明，避免被带偏。&quot;</p></blockquote><h2 id="相关知识点" tabindex="-1">相关知识点 <a class="header-anchor" href="#相关知识点" aria-label="Permalink to &quot;相关知识点&quot;">​</a></h2><ul><li><a href="./q4-jvm.html">Q4: JVM内存模型和垃圾回收</a> - 基础概念</li><li><a href="./q5-jvm-tuning.html">Q5: JVM调优与排查</a> - 实战调优</li><li><a href="./q7-generational-gc.html">Q7: Java分代回收深度剖析</a> - GC详解</li><li><a href="./q3-volatile.html">Q3: volatile与happens-before</a> - JMM详解</li></ul>`,42)])])}const g=a(e,[["render",i]]);export{k as __pageData,g as default};
