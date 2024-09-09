
<script>
import { computed, h, onMounted, onUpdated, ref, useSlots, watch } from 'vue';

export default {
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    maxLines: Number,
    ellipsis: {
      type: String,
      default: '...',
    },
  },
  setup(props, context) {
    const text = getText();
    const offset = ref(null);
    const textRef = ref();
    const contentRef = ref();

    const isClamped = computed(() => {
      if (!text) {
        return false;
      }
      return offset.value !== text.length;
    });

    const clampedText = computed(() => {
      return (text.slice(0, offset.value) || '').trim() + props.ellipsis;
    });

    const realText = computed(() => {
      return isClamped.value ? clampedText.value : text;
    });

    onMounted(() => {
      handleInit();
    });

    function getText() {
      let [content] = context.slots.default();
      return content ? content.children.trim() : '';
    }

    function handleInit() {
      offset.value = text.length;
      update();
    }
    function update() {
      applyChange();
      if (isOverflow() || isClamped.value) {
        search();
      }
    }
    function applyChange() {
      textRef.value.textContent = realText.value;
    }

    function search(...range) {
      const [from = 0, to = offset.value] = range;
      if (to - from <= 3) {
        stepToFit();
        return;
      }
      const target = Math.floor((to + from) / 2);
      clampAt(target);
      if (isOverflow()) {
        search(from, target);
      } else {
        search(target, to);
      }
    }
    function clampAt(offsetx) {
      offset.value = offsetx;
      applyChange();
    }

    function stepToFit() {
      fill();
      clamp();
    }
    function fill() {
      while ((!isOverflow() || getLines() < 2) && offset.value < text.length) {
        moveEdge(1);
      }
    }
    function clamp() {
      while (isOverflow() && getLines() > 1 && offset.value > 0) {
        moveEdge(-1);
      }
    }
    function moveEdge(steps) {
      clampAt(offset.value + steps);
    }

    function getLines() {
      return Object.keys(
        Array.prototype.slice.call(contentRef.value.getClientRects()).reduce((prev, { top, bottom }) => {
          const key = `${top}/${bottom}`;
          if (!prev[key]) {
            prev[key] = true;
          }
          return prev;
        }, {})
      ).length;
    }

    function isOverflow() {
      if (props.maxLines) {
        if (getLines() > props.maxLines) {
          return true;
        }
      }
      return false;
    }

    // 返回渲染函数
    return () => {
      const content = [
        h(
          'span',
          {
            ref: textRef,
          },
          realText.value
        ),
      ];
      const after = context.slots.after();
      if (after) {
        content.push(...(Array.isArray(after) ? after : [after]));
      }
      return h(
        props.tag,
        {
          style: {
            overflow: 'hidden',
          },
        },
        [
          h(
            'span',
            {
              style: {
                boxShadow: 'transparent 0 0',
              },
              ref: contentRef,
            },
            content
          ),
        ]
      );
    };
  },
};
</script>

<style lang="scss" scoped>
.clamp-box {
  width: 300px;
  border: 1px solid #eee;
  overflow: hidden;
}
</style>
