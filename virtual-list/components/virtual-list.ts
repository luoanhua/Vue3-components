import { defineComponent, h, onActivated, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
import Virtual from './virtual';
import { Item } from './item';
import { Slot } from './slot';
import { VirtualProps } from './props';

// 事件类型
enum EVENT_TYPE {
  ITEM = 'itemResize',
  SLOT = 'slotResize',
}

// 插槽类型
enum SLOT_TYPE {
  HEADER = 'thead',
  FOOTER = 'tfoot',
}

interface Range {
  start: number;
  end: number;
  padFront: number;
  padBehind: number;
}

export default defineComponent({
  name: 'VirtualList',
  props: VirtualProps,
  emits: ['scroll', 'totop', 'tobottom', 'resized', 'itemOtherWay'],
  setup(props, { emit, slots, expose }) {
    const isHorizontal = props.direction === 'horizontal';
    const directionKey = isHorizontal ? 'scrollLeft' : 'scrollTop';
    const range = ref<Range | null>(null);
    const root = ref<HTMLElement | null>();
    const shepherd = ref<HTMLDivElement | null>(null);
    let virtual: Virtual;

    watch(
      () => props.dataSources.length,
      () => {
        virtual.handleUpdateParam('uniqueIds', getUniqueIdFromDataSources());
        virtual.handleDataSourcesChange();
      }
    );
    watch(
      () => props.keeps,
      (newValue) => {
        virtual.handleUpdateParam('keeps', newValue);
        virtual.handleSlotSizeChange();
      }
    );
    watch(
      () => props.start,
      (newValue) => {
        setScrollToIndex(newValue);
      }
    );
    watch(
      () => props.offset,
      (newValue) => setScrollToOffset(newValue)
    );

    // 通过id获取大小
    const getSize = (id: any) => {
      return virtual.sizes.get(id);
    };
    // 获取偏移
    const getOffset = () => {
      if (props.pageMode) {
        return document.documentElement[directionKey] || document.body[directionKey];
      } else {
        return root.value ? Math.ceil(root.value[directionKey]) : 0;
      }
    };
    // 返回客户端视口大小
    const getClientSize = () => {
      const key = isHorizontal ? 'clientWidth' : 'clientHeight';
      if (props.pageMode) {
        return document.documentElement[key] || document.body[key];
      } else {
        return root.value ? Math.ceil(root.value[key]) : 0;
      }
    };
    // 返回所有滚动大小
    const getScrollSize = () => {
      const key = isHorizontal ? 'scrollWidth' : 'scrollHeight';
      if (props.pageMode) {
        return document.documentElement[key] || document.body[key];
      } else {
        return root.value ? Math.ceil(root.value[key]) : 0;
      }
    };
    //Emit事件触发
    const handleEmitEvent = (offset: number, clientSize: number, scrollSize: number, evt: Event) => {
      emit('scroll', evt, virtual.getRange());

      if (virtual.handleIsFront() && !!props.dataSources.length && offset - props.topThreshold <= 0) {
        emit('totop');
      } else if (virtual.handleIsBehind() && offset + clientSize + props.bottomThreshold >= scrollSize) {
        emit('tobottom');
      }
    };
    // 滚动事件
    const handleScroll = (evt: Event) => {
      const offset = getOffset();
      const clientSize = getClientSize();
      const scrollSize = getScrollSize();

      // 弹回行为会造成方向错误
      if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
        return;
      }

      virtual.handleScroll(offset);
      handleEmitEvent(offset, clientSize, scrollSize, evt);
    };

    // 通过dataSource获取UniqueId
    const getUniqueIdFromDataSources = () => {
      const { dataKey, dataSources = [] } = props;
      return dataSources.map((dataSource: any) => (typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey]));
    };

    // Range改变
    const handleRangeChanged = (newRange: any) => {
      range.value = newRange;
    };

    //初始化
    const handleInstallVirtual = () => {
      virtual = new Virtual(
        {
          slotHeaderSize: 0,
          slotFooterSize: 0,
          keeps: props.keeps,
          estimateSize: props.estimateSize,
          buffer: Math.round(props.keeps / 3),
          uniqueIds: getUniqueIdFromDataSources(),
        },
        handleRangeChanged
      );

      // 同步初始范围
      range.value = virtual.getRange();
    };
    // 将当前滚动位置设置为预期索引
    const setScrollToIndex = (index: number) => {
      // 滚动到底部
      if (index >= props.dataSources.length - 1) {
        handleScrollToBottom();
      } else {
        const offset = virtual.getOffset(index);
        setScrollToOffset(offset);
      }
    };
    // 将当前滚动位置设置为预期偏移量
    const setScrollToOffset = (offset: number) => {
      if (props.pageMode) {
        document.body[directionKey] = offset;
        document.documentElement[directionKey] = offset;
      } else {
        if (root.value) {
          root.value[directionKey] = offset;
        }
      }
    };
    // 根据范围数据获取实际渲染槽
    // 就地修补策略将尝试尽可能重用组件
    // 所以那些被重用的组件不会触发生命周期挂载
    const getRenderSlots = () => {
      const slots = [];
      const { start, end } = range.value;
      const { dataSources, dataKey, itemClass, itemTag, itemStyle, extraProps, dataComponent, itemScopedSlots } = props;
      for (let index = start; index <= end; index++) {
        const dataSource = dataSources[index];
        if (dataSource) {
          const uniqueKey = typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey];
          if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
            slots.push(
              h(Item, {
                index: index,
                key: index,
                tag: itemTag,
                event: EVENT_TYPE.ITEM,
                horizontal: isHorizontal,
                uniqueKey: uniqueKey,
                source: dataSource,
                extraProps: extraProps,
                component: dataComponent,
                scopedSlots: itemScopedSlots,
                style: itemStyle,
                class: `${itemClass}${props.itemClassAdd ? ' ' + props.itemClassAdd(index) : ''}`,
                onItemResize: handleItemResized,
              })
            );
          } else {
            console.warn(`这个唯一标识不存在`);
          }
        } else {
          console.warn('无法从数据源获取索引');
        }
      }
      return slots;
    };

    // 当每个item被挂载或大小改变时调用事件，每个item都会触发
    const handleItemResized = (id: string, size: number) => {
      virtual.handleSaveSize(id, size);
      emit('resized', id, size);
    };

    // 当插槽挂载或大小改变时调用事件
    const handleSlotResized = (type: SLOT_TYPE, size: number, hasInit: boolean) => {
      if (type === SLOT_TYPE.HEADER) {
        virtual.handleUpdateParam('slotHeaderSize', size);
      } else if (type === SLOT_TYPE.FOOTER) {
        virtual.handleUpdateParam('slotFooterSize', size);
      }

      if (hasInit) {
        virtual.handleSlotSizeChange();
      }
    };

    // 设置当前滚动位置到底部
    const handleScrollToBottom = () => {
      if (shepherd.value) {
        const offset = shepherd.value[isHorizontal ? 'offsetLeft' : 'offsetTop'];
        setScrollToOffset(offset);

        // 检查是否真的滚动到底部
        // 也许列表没有渲染和计算到最后一个范围
        // 所以我们需要在下一个事件循环中重试，直到它真正到达底部
        setTimeout(() => {
          if (getOffset() + getClientSize() < getScrollSize()) {
            handleScrollToBottom();
          }
        }, 3);
      }
    };

    // 当使用页面模式时，我们需要手动更新插槽标题大小
    // 将相对于浏览器的根偏移量作为插槽标头大小
    const updatePageModeFront = () => {
      if (root.value) {
        const rect = root.value.getBoundingClientRect();
        const { defaultView } = root.value.ownerDocument;
        const offsetFront = isHorizontal ? rect.left + defaultView.pageXOffset : rect.top + defaultView.pageYOffset;
        virtual.handleUpdateParam('slotHeaderSize', offsetFront);
      }
    };

    // 获取存储（渲染）项的总数
    const getSizes = () => {
      return virtual.sizes.size;
    };

    onBeforeMount(() => {
      handleInstallVirtual();
    });

    // 从keep-alive唤醒时设置回偏移量
    onActivated(() => {
      setScrollToOffset(virtual.offset);
    });

    onMounted(() => {
      // 设定位置
      if (props.start) {
        setScrollToIndex(props.start);
      } else if (props.offset) {
        setScrollToOffset(props.offset);
      }

      //  在页面模式中，我们将滚动事件绑定到文档
      if (props.pageMode) {
        updatePageModeFront();
        document.addEventListener('scroll', handleScroll, {
          passive: false,
        });
      }
    });

    onUnmounted(() => {
      virtual.handleDestroy();
      if (props.pageMode) {
        document.removeEventListener('scroll', handleScroll);
      }
    });

    // 暴露方法
    expose({
      handleScrollToBottom,
      getSizes,
      getSize,
      getOffset,
      getScrollSize,
      getClientSize,
      setScrollToOffset,
      setScrollToIndex,
    });

    return () => {
      const { pageMode, rootTag: RootTag, wrapTag: WrapTag, wrapClass, wrapStyle, headerTag, headerClass, headerStyle, footerTag, footerClass, footerStyle } = props;
      const { padFront, padBehind } = range.value;
      const paddingStyle = {
        padding: isHorizontal ? `0px ${padBehind}px 0px ${padFront}px` : `${padFront}px 0px ${padBehind}px`,
      };
      const wrapperStyle = wrapStyle ? Object.assign({}, wrapStyle, paddingStyle) : paddingStyle;
      const { header, footer } = slots;

      return h(
        RootTag,
        {
          ref: root,
          onScroll: !pageMode && handleScroll,
        },
        [
          header &&
            h(
              Slot,
              {
                class: headerClass,
                style: headerStyle,
                tag: headerTag,
                event: EVENT_TYPE.SLOT,
                uniqueKey: SLOT_TYPE.HEADER,
                onSlotResize: handleSlotResized,
              },
              header()
            ),
          h(
            WrapTag,
            {
              class: wrapClass,
              style: wrapperStyle,
            },
            getRenderSlots()
          ),
          footer &&
            h(
              Slot,
              {
                class: footerClass,
                style: footerStyle,
                tag: footerTag,
                event: EVENT_TYPE.SLOT,
                uniqueKey: SLOT_TYPE.FOOTER,
                onSlotResize: handleSlotResized,
              },
              footer()
            ),
          h('div', {
            ref: shepherd,
            style: {
              width: isHorizontal ? '0px' : '100%',
              height: isHorizontal ? '100%' : '0px',
            },
          }),
        ]
      );
    };
  },
});
