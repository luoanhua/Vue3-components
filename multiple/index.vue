<template>
  <el-popover
    :trigger="trigger"
    :placement="placement"
    ref="popoverRef"
    :popper-style="{ minWidth: popoverWidth, width: popoverWidth, padding: 0 }"
    v-model:visible="visible"
    :show-arrow="showArrow"
    @before-enter="handleShowEnter"
  >
    <!-- 选中框 -->
    <div class="multiple-select-box">
      <div class="list-search" v-if="showSearch">
        <el-input v-model="states.inputVal" style="height: 28px" placeholder="过滤" :suffix-icon="Search" />
      </div>
      <template v-if="filteredOptions.length">
        <!-- 全部 -->
        <multiple-check
          @check-change="handleCheckAll"
          :styleClass="checkStyleClass"
          :source="{ label: allName(), value: 'all' }"
          :list="isCheckAll ? ['all'] : []"
          :isCheckHalf="isCheckHalf"
          v-if="isShowAll"
        ></multiple-check>
        <!-- 列表 -->
        <virtual-list
          class="list-box"
          ref="virtualListRef"
          :data-key="valueKey"
          :data-sources="filteredOptions"
          :data-component="MultipleCheck"
          :estimate-size="estimateSize"
          :extraProps="{ labelKey, valueKey, list: modelValue, styleClass: checkStyleClass, maxCheck: max, provideName }"
        />
      </template>
      <div v-else class="list-empty">无数据</div>
    </div>
    <!-- 输入框 -->
    <template #reference>
      <template v-if="!isIcon">
        <div class="input-box" :class="[visible ? 'is-focus' : '']" :style="{ width: inputWidth, height: inputHeight }">
          <div style="width: calc(100% - 20px)" class="text-cut" :title="getName">{{ getName }}</div>
          <div style="width: 20px; display: flex">
            <el-icon>
              <ArrowDown :class="[visible ? 'icon-animation-up' : 'icon-animation-down']" color="#39617f" />
            </el-icon>
          </div>
        </div>
      </template>
      <template v-else>
        <img :style="{ width: inputWidth, height: inputHeight }" class="pointer" v-if="!isCheckHalf" :src="getImgUrl(defaultIcon)" alt="" />
        <img :style="{ width: inputWidth, height: inputHeight }" class="pointer" v-else :src="getImgUrl(activeIcon)" alt="" />
      </template>
    </template>
  </el-popover>
</template>

<script setup>
import { ArrowDown, Search } from '@element-plus/icons-vue';
import MultipleCheck from './multiple-check/index.vue';
import VirtualList from '@/components/virtual-list/index.ts';
import { computed, nextTick, onMounted, reactive, ref, unref, watch, provide } from 'vue';
import { MultipleProps } from './props';

const $emits = defineEmits(['update:modelValue', 'change']);
const props = defineProps(MultipleProps);

const popoverRef = ref();
const virtualListRef = ref();

const provideName = Symbol('multiple-check');

const visible = ref(false);
// 状态
const states = reactive({
  inputVal: '',
  selectOption: [],
  selectLabel: [],
  allLabel: [],
  allValue: [],
  filterLabel: [],
  filterValue: [],
});

const allOptions = ref([]);
const filteredOptions = ref([]);

const allOptionsMap = computed(() => {
  const valueMap = new Map();
  allOptions.value.forEach((option, index) => {
    valueMap.set(getValue(option), { ...option, index });
  });
  return valueMap;
});

// 选中名称
const getName = computed(() => {
  let { selectLabel } = states;
  let { allName, options, separator, nameSort } = props;
  let name = allName();
  if (selectLabel.length && selectLabel.length != options.length) {
    if (nameSort) {
      name = handleQuickSort(selectLabel).join(separator);
    } else {
      name = selectLabel.join(separator);
    }
  }
  return name;
});

// 是否全选
const isCheckAll = computed(() => {
  let { filterValue } = states;
  return handleIsIncludes(filterValue, props.modelValue.slice());
});
// 是否半全选
const isCheckHalf = computed(() => {
  let { selectOption, filterValue } = states;
  return Boolean(selectOption.length && !handleIsIncludes(filterValue, props.modelValue.slice()));
});

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      handleScrollTop();
      handleInitInputVal();
    }
  }
);

watch(
  () => states.inputVal,
  () => {
    handleScrollTop();
    handleUpdateOptions();
  }
);

watch(
  () => props.options,
  () => {
    handleUpdateOptions();
    handleInit();
  },
  {
    deep: true,
  }
);

watch(
  () => props.modelValue,
  () => {
    handleInit();
  },
  {
    deep: true,
  }
);

// 获取当前时间
const getCurTime = () => {
  return new Date().getTime();
};

// 排序
function handleQuickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) {
      continue;
    }
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [...handleQuickSort(left), pivot, ...handleQuickSort(right)];
}

// 选中全部
const handleCheckAll = () => {
  let selectedValues = props.modelValue.slice();
  if (isCheckAll.value) {
    // 取消全选
    if (filteredOptions.value.length == allOptions.value.length) {
      selectedValues = [];
      states.selectOption.length = 0;
      states.selectLabel.length = 0;
    } else {
      let { option, values, labels } = handleRemove(filteredOptions.value, states.selectOption);
      selectedValues = values;
      states.selectLabel = labels;
      states.selectOption = option;
    }
  } else {
    // 全选
    if (filteredOptions.value.length == allOptions.value.length) {
      selectedValues = states.allValue.slice();
      states.selectLabel = states.allLabel.slice();
      states.selectOption = allOptions.value.slice();
    } else {
      let { option, values, labels } = handleUniqueObject(filteredOptions.value, states.selectOption);
      selectedValues = values;
      states.selectLabel = labels;
      states.selectOption = option;
    }
  }
  handleUpdate(selectedValues);
};

// 去掉数据
const handleRemove = (a, b) => {
  let { labelKey, valueKey } = props;
  let option = [];
  let values = [];
  let labels = [];
  let obj = {};
  for (let key of a) {
    obj[key[valueKey]] = 1;
  }
  for (let key of b) {
    if (!obj[key[valueKey]]) {
      option.push(key);
      values.push(key[valueKey]);
      labels.push(key[labelKey]);
    }
  }
  return {
    option,
    values,
    labels,
  };
};

// 是否包含
const handleIsIncludes = (child, parent) => {
  if (child.length && parent.length) {
    const map = new Map();
    for (let i = 0; i < parent.length; i++) {
      map.set(parent[i], i);
    }
    for (let j = 0; j < child.length; j++) {
      if (!map.has(child[j])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

// 对象去重
const handleUniqueObject = (a, b) => {
  let arr = a.concat(b);
  let option = [];
  let values = [];
  let labels = [];
  let obj = {};
  let { labelKey, valueKey } = props;

  for (let key of arr) {
    if (!obj[key[valueKey]]) {
      option.push(key);
      values.push(key[valueKey]);
      labels.push(key[labelKey]);
      obj[key[valueKey]] = 1;
    }
  }
  return {
    option,
    values,
    labels,
  };
};

// 选中item
const handleCheckItem = (option) => {
  let selectedValues = props.modelValue.slice();
  const index = getValueIndex(selectedValues, getValue(option));
  if (index > -1) {
    // 减
    selectedValues = [...selectedValues.slice(0, index), ...selectedValues.slice(index + 1)];
    states.selectOption.splice(index, 1);
    states.selectLabel.splice(index, 1);
  } else {
    // 增
    selectedValues = [...selectedValues, getValue(option)];
    states.selectOption.push(option);
    states.selectLabel.push(getLabel(option));
  }
  handleUpdate(selectedValues);
};

// 更新
const handleUpdate = (val) => {
  let { selectOption, selectLabel, allValue, allLabel } = states;
  $emits('update:modelValue', val);
  $emits('change', { data: val, option: selectOption, label: selectLabel, isCheckAll: isCheckAll.value, allValue, allLabel, allOptions: allOptions.value });
};

// 更新位置
const handleUpdatePosition = () => {
  nextTick(() => {
    unref(popoverRef).popperRef?.popperInstanceRef?.update();
  });
};

// 打开前
const handleShowEnter = () => {
  handleUpdatePosition();
};

// 获取img
const getImgUrl = (img) => {
  return new URL(`${props.iconUrl}${img}`, import.meta.url).href;
};

// 初始化输入
const handleInitInputVal = () => {
  states.inputVal = '';
};

// 滚动到顶部
const handleScrollTop = () => {
  nextTick(() => {
    virtualListRef.value?.setScrollToOffset(0);
  });
};

// 更新options
const handleUpdateOptions = () => {
  allOptions.value = handleFilterOptions('');
  filteredOptions.value = handleFilterOptions(states.inputVal);
  states.allLabel = handleFilterOptions('', 'label');
  states.allValue = handleFilterOptions('', 'value');
  states.filterLabel = handleFilterOptions(states.inputVal, 'label');
  states.filterValue = handleFilterOptions(states.inputVal, 'value');
};

// 过滤options
const handleFilterOptions = (input, key) => {
  return [...props.options].reduce((all, item) => {
    if (input.trim()) {
      if (getLabel(item).toLocaleLowerCase().includes(input.trim().toLocaleLowerCase())) {
        if (key) {
          all.push(key == 'label' ? getLabel(item) : getValue(item));
        } else {
          all.push(item);
        }
      }
    } else {
      if (key) {
        all.push(key == 'label' ? getLabel(item) : getValue(item));
      } else {
        all.push(item);
      }
    }
    return all;
  }, []);
};

// 通过value值查询下标
const getValueIndex = (arr = [], value) => {
  if (!isObject(value)) {
    return arr.indexOf(value);
  }
  let index = -1;
  arr.some((item, i) => {
    if (getValue(item) === getValue(value)) {
      index = i;
      return true;
    }
    return false;
  });
  return index;
};

// 是否是对象
const isObject = (val) => val !== null && typeof val === 'object';

// 获取value
const getValue = (option) => {
  return option[props.valueKey];
};

// 获取label
const getLabel = (option) => {
  return option[props.labelKey];
};

// 获取options
const getOption = (value) => {
  if (allOptionsMap.value.has(value)) {
    let option = allOptionsMap.value.get(value);
    return option;
  }
};

// 初始化
const handleInit = () => {
  if (props.modelValue.length && allOptionsMap.value.size) {
    states.selectOption.length = 0;
    states.selectLabel.length = 0;
    for (let key of props.modelValue) {
      let option = getOption(key);
      states.selectOption.push(option);
      states.selectLabel.push(getLabel(option));
    }
  } else {
    states.selectOption = [];
    states.selectLabel = [];
  }
};
provide(provideName, handleCheckItem);

onMounted(() => {
  handleUpdateOptions();
  handleUpdatePosition();
  handleInit();
});
</script>

<style lang="scss" scoped>
.input-box {
  display: flex;
  align-items: center;
  padding-left: 10px;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}
.text-cut {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pointer {
  cursor: pointer;
}
.is-focus {
  box-shadow: 0 0 0 1px #409eff inset;
  color: #a8abb2;
}
.icon-animation-up {
  transition: all 0.2s;
  transform: rotateZ(180deg);
}
.icon-animation-down {
  transition: all 0.2s;
  transform: rotateZ(0deg);
}
.multiple-select-box {
  padding: 5px 0;
  .list-search {
    padding: 0 5px;
  }
  .list-box {
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 10px !important;
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb {
      // 普通状态下宽度
      border-style: dashed;
      border-color: transparent;
      border-width: 3px;
      background-clip: padding-box;
      cursor: pointer;
    }
    &::-webkit-scrollbar-thumb:hover {
      // 悬停状态宽度
      background-clip: border-box;
      // 悬停状态颜色
      background: rgba(157, 165, 183, 0.3);
      cursor: pointer;
    }
  }
  .list-empty {
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
  }
}
</style>
