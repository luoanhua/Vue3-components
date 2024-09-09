import { computed, onMounted, onUnmounted, onUpdated, Ref } from 'vue';

export const useResizeChange = (props: any, rootRef: Ref<HTMLElement | null | any>, emit: any) => {
  let resizeObserver: ResizeObserver | null = null;
  const shapeKey = computed(() => (props.horizontal ? 'offsetWidth' : 'offsetHeight'));

  // 获取当前大小
  const getCurrentSize = () => {
    return rootRef.value ? rootRef.value[shapeKey.value] : 0;
  };

  // 触发大小改成
  const handleDispatchSizeChange = () => {
    const { event, uniqueKey, hasInitial } = props;
    emit(event, uniqueKey, getCurrentSize(), hasInitial);
  };

  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleDispatchSizeChange();
      });
      rootRef.value && resizeObserver.observe(rootRef.value);
    }
  });

  onUpdated(() => {
    handleDispatchSizeChange();
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
};
