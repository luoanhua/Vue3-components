<template>
  <div>
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
      <div class="single-select-box" @mouseenter="states.showScroll = true" @mouseleave="states.showScroll = false">
        <div class="list-search" v-if="showSearch">
          <el-input v-model="states.inputVal" style="height: 28px" placeholder="过滤" :suffix-icon="Search" />
        </div>
        <template v-if="filteredOptions.length">
          <!-- 全部 -->
          <single-list
            @itemOtherWay="handleCheckAll"
            :styleClass="checkStyleClass"
            :source="{ [labelKey]: allName(), [valueKey]: 'all' }"
            :list="isCheckAll ? ['all'] : []"
            :labelKey="labelKey"
            :valueKey="valueKey"
            :visible="visible"
            v-if="isShowAll"
          ></single-list>
          <!-- 列表 -->
          <virtual-list
            class="list-box"
            :class="[states.showScroll ? 'auto-y' : 'hidden-y']"
            ref="virtualListRef"
            :data-key="valueKey"
            :data-sources="filteredOptions"
            :data-component="SingleList"
            :estimate-size="estimateSize"
            :extraProps="{ labelKey, valueKey, list: [modelValue], styleClass: checkStyleClass, visible: visible }"
            @itemOtherWay="handleCheckItem"
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
          <img :style="{ width: inputWidth, height: inputHeight }" class="pointer" v-if="isCheckAll" :src="getImgUrl(defaultIcon)" alt="" />
          <img :style="{ width: inputWidth, height: inputHeight }" class="pointer" v-else :src="getImgUrl(activeIcon)" alt="" />
        </template>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { ArrowDown, Search } from '@element-plus/icons-vue';
import SingleList from './single-list/index.vue';
import VirtualList from '@/components/virtual-list/index.ts';
import { computed, nextTick, onMounted, reactive, ref, unref, watch, watchEffect } from 'vue';
import { SingleProps } from './props';

const $emits = defineEmits(['update:modelValue', 'change']);
const props = defineProps(SingleProps);

const popoverRef = ref();
const virtualListRef = ref();

const visible = ref(false);
// 状态
const states = reactive({
  inputVal: '',
  selectOption: [],
  showScroll: false,
  selectIndex: 0,
  allLabel: [],
  allValue: [],
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
  let { selectOption } = states;
  let { allName } = props;
  let name = allName();
  if (selectOption.length) {
    name = getLabel(selectOption[0]);
  }
  return name;
});

// 是否全选
const isCheckAll = computed(() => {
  let { selectOption } = states;
  return Boolean(!selectOption.length);
});

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      handleInitInputVal();
    } else {
      handleScrollIndex();
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

// 选中全部
const handleCheckAll = () => {
  let selectedValues = '';
  states.selectOption.length = 0;
  handleUpdate(selectedValues);
};

// 选中item
const handleCheckItem = (option) => {
  let selectedValues = getValue(option);
  states.selectOption.length = 0;
  states.selectOption = [option];
  handleUpdate(selectedValues);
};

// 更新
const handleUpdate = (val) => {
  let { selectOption, allValue, allLabel } = states;
  visible.value = false;
  $emits('update:modelValue', val);
  $emits('change', { data: val, option: selectOption, isCheckAll: isCheckAll.value, allValue, allLabel, allOptions: allOptions.value });
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
    virtualListRef.value?.setScrollToIndex(0);
  });
};

// 滚动到选择的位置
const handleScrollIndex = () => {
  nextTick(() => {
    virtualListRef.value?.setScrollToIndex(states.selectIndex);
  });
};

// 更新options
const handleUpdateOptions = () => {
  allOptions.value = handleFilterOptions('');
  filteredOptions.value = handleFilterOptions(states.inputVal);
  states.allLabel = handleFilterOptions('', 'label');
  states.allValue = handleFilterOptions('', 'value');
};

// 过滤options
const handleFilterOptions = (input, key) => {
  return [...props.options].reduce((all, item) => {
    if (input.trim()) {
      if (getLabel(item).toLocaleLowerCase().includes(input.trim().toLocaleLowerCase())) {
        all.push(item);
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
  if (props.modelValue && allOptionsMap.value.size) {
    states.selectOption.length = 0;
    let option = getOption(props.modelValue);
    states.selectIndex = option.index;
    states.selectOption = [option];
  } else {
    states.selectOption = [];
    states.selectIndex = 0;
  }
};

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
.pointer {
  cursor: pointer;
}
.hidden-y {
  overflow-y: hidden;
}
.auto-y {
  overflow-y: auto;
}
.single-select-box {
  padding: 5px 0;
  .list-search {
    padding: 0 5px;
  }
  .list-box {
    min-height: 100px;
    max-height: 200px;
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
