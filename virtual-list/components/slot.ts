import { defineComponent, h, ref } from 'vue';
import { SlotProps } from './props';
import { useResizeChange } from '../hook/useResizeChange';

// 用于头部或者底部
export const Slot = defineComponent({
  name: 'VirtualListSlot',
  props: SlotProps,
  emits: ['slotResize'],
  setup(props, { slots, emit }) {
    const rootRef = ref<HTMLElement | null>(null);
    useResizeChange(props, rootRef, emit);

    return () => {
      const { tag: Tag, uniqueKey } = props;

      return h(
        Tag,
        {
          ref: rootRef,
          key: uniqueKey,
        },
        slots.default?.()
      );
    };
  },
});
