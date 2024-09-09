import { PropType } from 'vue';
export const SingleProps = {
  trigger: {
    type: String as PropType<'click' | 'hover'>,
    default: 'click',
  },
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
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
    default: false,
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
    default: false,
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
};
