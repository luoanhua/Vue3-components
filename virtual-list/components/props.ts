import { PropType } from 'vue';

// 总
export const VirtualProps = {
  // 唯一标识
  dataKey: {
    type: [String, Function],
    required: true,
  },
  // 数据来源
  dataSources: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 子组件
  dataComponent: {
    type: [Object, Function],
    required: true,
  },

  // 希望虚拟列表有多少个item一直在真实dom中渲染
  keeps: {
    type: Number,
    default: 30,
  },
  // 额外的props分配给不在数据源中的item组件。注意：index和source都是占用内层的
  extraProps: {
    type: Object,
  },
  // 每个项目的估计大小，如果它更接近平均大小，滚动条长度看起来更准确。建议指定自己计算的平均值
  estimateSize: {
    type: Number,
    default: 50,
  },
  // 方向
  direction: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical',
  },
  // 滚动位置停留开始索引
  start: {
    type: Number,
    default: 0,
  },
  // 滚动位置保持偏移
  offset: {
    type: Number,
    default: 0,
  },
  // 距离top的高度就触发，注意多次调用。
  topThreshold: {
    type: Number,
    default: 0,
  },
  // 距离bottom的高度就触发，注意多个调用
  bottomThreshold: {
    type: Number,
    default: 0,
  },
  // 让虚拟列表使用全局文档滚动列表。
  pageMode: {
    type: Boolean,
    default: false,
  },
  // 根标签
  rootTag: {
    type: String,
    default: 'div',
  },
  // 包裹slot标签
  wrapTag: {
    type: String,
    default: 'div',
  },
  // 包裹slot class
  wrapClass: {
    type: String,
    default: 'wrap',
  },
  // 包裹slot样式
  wrapStyle: {
    type: Object,
  },
  // item标签
  itemTag: {
    type: String,
    default: 'div',
  },
  // item class
  itemClass: {
    type: String,
    default: '',
  },
  // 格外的class,扩展，预留出来
  itemClassAdd: {
    type: Function,
  },
  // item样式
  itemStyle: {
    type: Object,
  },
  // 头部标签
  headerTag: {
    type: String,
    default: 'div',
  },
  // 头部class
  headerClass: {
    type: String,
    default: '',
  },
  // 头部样式
  headerStyle: {
    type: Object,
  },
  // 底部标签 一般用于滚动加载时，显示加载中
  footerTag: {
    type: String,
    default: 'div',
  },
  // 底部class
  footerClass: {
    type: String,
    default: '',
  },
  // 底部样式
  footerStyle: {
    type: Object,
  },
  // item的作用域插槽的信息，用于item
  itemScopedSlots: {
    type: Object,
  },
};

// item
export const ItemProps = {
  // 下标
  index: {
    type: Number,
  },
  // 事件
  event: {
    type: String,
  },
  // 标签
  tag: {
    type: String,
  },
  // 是否水平
  horizontal: {
    type: Boolean,
  },
  // 单个数据来源
  source: {
    type: Object,
  },
  // 组件
  component: {
    type: [Object, Function],
  },
  // 唯一标签
  uniqueKey: {
    type: [String, Number],
  },
  // 扩展props
  extraProps: {
    type: Object,
  },
  // 作用域插槽的信息
  scopedSlots: {
    type: Object,
  },
};

// slot
export const SlotProps = {
  // 事件
  event: {
    type: String,
  },
  // 唯一标识
  uniqueKey: {
    type: String,
  },
  // 标签
  tag: {
    type: String,
  },
  // 是否水平方向
  horizontal: {
    type: Boolean,
  },
};
