import { PropType } from 'vue';
export const MultipleProps = {
  trigger: {
    type: String as PropType<'click' | 'hover'>,
    default: 'click',
  },
  options: {
    type: Array,
    default: () => [],
  },
  // 选中的值
  modelValue: {
    type: Array,
    default: () => [],
  },
  inputWidth: {
    type: String,
    default: '120px',
  },
  inputHeight: {
    type: String,
    default: '30px',
  },
  popoverWidth: {
    type: String,
    default: '150px',
  },
  placement: {
    type: String,
    default: 'bottom',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  showArrow: {
    type: Boolean,
    default: false,
  },
  allName: {
    type: Function,
    default: () => {
      return '全部';
    },
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  isIcon: {
    type: Boolean,
    default: true,
  },
  defaultIcon: {
    type: String,
    default: 'filter.png',
  },
  activeIcon: {
    type: String,
    default: 'filter_active.png',
  },
  iconUrl: {
    type: String,
    default: '/src/assets/img/',
  },
  separator: {
    type: String,
    default: ',',
  },
  // 配合isShowAll使用，设置了max就不能有全部
  max: {
    type: Number,
    default: Infinity,
  },
  isShowAll: {
    type: Boolean,
    default: true,
  },
  // 配合checkStyleClass使用，这是高度
  estimateSize: {
    type: Number,
    default: 34,
  },
  checkStyleClass: {
    type: Object,
    default: () => ({}),
  },
  // 文字是否排序,一般用于纯数字排序
  nameSort: {
    type: Boolean,
    default: false,
  },
};
