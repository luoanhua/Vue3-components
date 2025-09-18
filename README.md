1.vue2和vue3的区别
	1.响应式的原理不同
		vue2是通过object.defineProperty来遍历对象来监听的，当然，一些属性的增加删除都无法监听的到，需要通过this.$set(),this.$forceUpdate()
		vue3是通过proxy代理整个对象的，能监听到整个对象
	
	2.写法变了
		vue2是选项式api，使用混入
		vue3是组合式api，使用hook
	
	3.根节点
		vue2只能有一个根节点
		vue3可以有多个根节点
	
	4.生命周期
		vue2 beforeCreate()
			 created()
			 beforeMounte()
			 mounted()
			 beforeUpdate()
			 updated()
			 beforeDestroy()
			 destroyed()
		
		vue3在vue2的基础上增加了on，除了销毁，onBeforeUnmounte() onUnmounted()
	
	5.类型检测
		vue2是通过flow来进行类型检测的
		vue3是通过Typescript来进行类型检测的
	
	6.vue3增加了一些组件
		teleport, suspense
	
	7.v-if和v-for的优先级
		vue2 是v-for > v-if
		vue3 是v-if > v-if
		
	8.修饰符
		vue3除了native，keycode,过滤器


2.数组的一些方法
	1.添加，删除
		push,pop,unshift,shift
	2.迭代方法
		map,forEach,filter,some,every
	3.剪切
		splice,slice
	4.转换字符串
		join,toString
	5.排序
		reverse,sort
	
3.前端性能工具有哪些，你用过哪些，怎么使用的
	首先，性能我会关注几方面
	加载性能
	运行时性能
	内存使用
	渲染性能
	1.Chrome DevTools：
		1.performance面板
			点击record按钮开始记录
			点击stop按钮结束记录
		
			分析:
				FPS：动画和滚动的流畅度指标，绿色表示良好，红色表示卡顿
				CPU使用率：各任务类型的CPU占用情况
				网络请求瀑布图：展示各种资源加载时序
				主线程活动火焰图：详细展示javascript执行，样式计算，布局等活动的耗时
		
		2.Lighthouse面板
			点击分析网页加载情况
			
			分析:
				first contentful paint(FCP)：首次内容绘制时间
				Largest ContentFul paint(LCP)：最大内容绘制时间
				Time to Interactive:(TTI)：可交互时间
				Total Blocking Time(TBT)：总阻塞时间
				Cumulative Layout Shift(CLS)：累加布局偏移
		
		3.Network面板
			分析网络请求
			
			分析:
				可以过滤请求类型
				查看请求的优先级，大小，耗时
				模拟不同网络请求
			
		4.Memory面板
			内存分析工具，用于诊断内存泄露
			
			分析:
				堆内存快照比较
				内存分配时间线
				内存占用统计
			
	2.javascript方面
		1.console API
			console.time/console.timeEnd
			performance.mark('start')/performance.mark('end')
		2.performanceObserver 监听性能事件的现在API
			new PerformanceObserve
			
	3.打包工具分析
		1.webpack bundle analyzer 分析打包体积
			功能：
				可视化展示各模块大小
				识别重复依赖
				分析按需加载效果
		
		2.source map explorer 精确分析代码
			功能：
				精确到源代码的体积分析
				识别压缩后的代码来源


4.作为前端负责人，你怎么协调工作的
	1.明确目标和任务
		理解项目整体目标
		细化并分配任务
	
	2.加强团队内部沟通与协作
		定期团队会议
		建立清晰的沟通渠道
	
	3.团队协作
		
	4.时间管理
			
5.vue3传参方式有哪些
	1.props和$emits(父子通信)
	2.v-model(双向绑定)
	3.provider和inject(祖孙通信)
	4.mitt(跨层通信)
	5.pinia/Vuex(全局状态管理)
	6.$attrs和v-bind(属性透传)

6.你怎么进行性能优化的
	
