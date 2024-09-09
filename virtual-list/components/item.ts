import { defineComponent, h, ref } from 'vue';
import { ItemProps } from './props';
import { useResizeChange } from '../hook/useResizeChange';

export const Item = defineComponent({
  name: 'VirtualListItem',
  props: ItemProps,
  emits: ['itemResize'],
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null);
    useResizeChange(props, rootRef, emit);

    return () => {
      const { tag: Tag, component: Comp, extraProps = {}, index, source, scopedSlots = {}, uniqueKey } = props;
      const mergedProps = {
        ...extraProps,
        source,
        index,
      };

      return h(
        Tag,
        {
          key: uniqueKey,
          ref: rootRef,
        },
        [
          h(Comp, {
            ...mergedProps,
            scopedSlots: scopedSlots,
          }),
        ]
      );
    };
  },
});
