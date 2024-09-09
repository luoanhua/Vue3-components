<template>
  <label class="el-checkbox el-checkbox--small" :style="styleClass" :class="[getCheckClass, getDisable]" :title="getName" @click.prevent="handleCheckAll">
    <span class="el-checkbox__input" :class="[getCheckClass, getCheckHalfClass, getDisable]">
      <input class="el-checkbox__original" type="checkbox" />
      <span class="el-checkbox__inner"></span>
    </span>
    <span class="el-checkbox__label text-cut" :class="[getCheckClass, getCheckHalfClass]"> {{ getName }}</span>
  </label>
</template>

<script setup>
import { computed, ref, inject } from 'vue';
const $emits = defineEmits(['checkChange']);
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
  isCheckHalf: {
    type: Boolean,
    default: false,
  },
  styleClass: {
    type: Object,
    default: () => ({}),
  },
  maxCheck: {
    type: Number,
    default: Infinity,
  },
  provideName: {
    type: Symbol,
    default: undefined,
  },
});
const checkChange = props.provideName ? inject(props.provideName) : undefined;

const getCheckClass = computed(() => {
  let { list, valueKey, source } = props;
  return list.indexOf(source[valueKey]) != -1 ? 'is-checked' : '';
});

const getCheckHalfClass = computed(() => {
  let { isCheckHalf } = props;
  return isCheckHalf ? 'is-indeterminate' : '';
});

const getName = computed(() => {
  let { source, labelKey } = props;
  return source[labelKey];
});

const getDisable = computed(() => {
  let { list, maxCheck, valueKey, source } = props;
  return source.disabled ? 'is-disabled' : list.indexOf(source[valueKey]) != -1 || list.length < maxCheck ? '' : 'is-disabled';
});

const handleCheckAll = () => {
  if (getDisable.value == 'is-disabled') {
    return;
  }
  typeof checkChange == 'function' && checkChange(props.source);
  $emits('checkChange', props.source);
};
</script>

<style lang="scss" scoped>
.text-cut {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.el-checkbox {
  padding: 0 9px;
  height: 34px;
  line-height: 34px;
  width: 100%;
  margin-right: 0;
}
.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}
.el-checkbox:hover {
  background-color: #eaf2ff;
}
.el-checkbox.is-disabled:hover {
  background-color: #fff;
}
.el-checkbox__label {
  font-size: 14px;
}
</style>
