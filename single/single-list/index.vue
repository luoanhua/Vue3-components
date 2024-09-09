<template>
  <div class="single-list" :style="styleClass" :class="[getCheckClass, getDisable]" @click.prevent="handleCheckAll" @mouseenter="inputHover = false" @mouseleave="inputHover = false">
    <span>{{ getName }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const inputHover = ref(false);
const $emits = defineEmits(['itemOtherWay']);
const props = defineProps({
  source: {
    type: Object,
    default: () => ({}),
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  list: {
    type: Array,
    default: () => [],
  },
  styleClass: {
    type: Object,
    default: () => ({}),
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.visible,
  (val) => {
    inputHover.value = val;
  }
);

const getHoverClass = computed(() => {
  return inputHover.value && getCheckClass.value == 'is-selected' ? 'is-hover' : '';
});

const getName = computed(() => {
  let { source, labelKey } = props;
  return source[labelKey];
});

const getDisable = computed(() => {
  let { source } = props;
  return source.disabled ? 'is-disabled' : '';
});

const getCheckClass = computed(() => {
  let { list, valueKey, source } = props;
  return list.indexOf(source[valueKey]) != -1 ? 'is-selected' : '';
});

const handleCheckAll = () => {
  if (getDisable.value == 'is-disabled') {
    return;
  }
  $emits('itemOtherWay', props.source);
};
</script>

<style lang="scss" scoped>
.single-list {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
}
.single-list:hover,
.is-hover {
  background-color: #eaf2ff;
}
.single-list.is-disabled:hover {
  background-color: unset;
}
.is-selected {
  color: #409eff;
  font-weight: 700;
}
.is-disabled {
  color: #a8abb2;
  cursor: not-allowed;
  background-color: unset;
}
</style>
