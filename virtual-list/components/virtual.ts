// 方向类型
const DIRECTION_TYPE = {
  FRONT: 'FRONT', //向上/左滚动
  BEHIND: 'BEHIND', // 向下/右滚动
};

// 内容类型
const CALC_TYPE = {
  INIT: 'INIT', //最初的
  FIXED: 'FIXED', //固定的
  DYNAMIC: 'DYNAMIC', //动态的
};

// 缓存
const LEADING_BUFFER = 2;

interface ParamType {
  keeps: number;
  uniqueIds: Array<string>;
  estimateSize: number;
  slotHeaderSize?: number;
  [propName: string]: any;
}

interface RangeType {
  start: number;
  end: number;
  padFront: number;
  padBehind: number;
  [propName: string]: any;
}

export default class Virtual {
  param: ParamType;
  sizes: Map<string, number>;
  firstRangeTotalSize: number;
  firstRangeAverageSize: number;
  lastCalcIndex: number;
  fixedSizeValue: number;
  calcType: string;
  offset: number;
  direction: string;
  range: RangeType;
  callUpdate: (range: RangeType) => void;
  constructor(param: ParamType, callUpdate: (range: RangeType) => void) {
    this.handleInit(param, callUpdate);
  }

  handleInit(param: ParamType, callUpdate: (range: RangeType) => void) {
    // param
    this.param = param;
    this.callUpdate = callUpdate;

    // size
    this.sizes = new Map();
    this.firstRangeTotalSize = 0;
    this.firstRangeAverageSize = 0;
    this.lastCalcIndex = 0;
    this.fixedSizeValue = 0;
    this.calcType = CALC_TYPE.INIT;

    // scroll
    this.offset = 0;
    this.direction = '';

    this.range = Object.create(null);
    if (param) {
      this.handleCheckRange(0, param.keeps - 1);
    }
  }

  // 销毁
  handleDestroy() {
    this.handleInit(null, null);
  }

  // 返回当前渲染范围
  getRange() {
    const range = Object.create(null);
    range.start = this.range.start;
    range.end = this.range.end;
    range.padFront = this.range.padFront;
    range.padBehind = this.range.padBehind;
    return range;
  }

  // 是否在后面
  handleIsBehind() {
    return this.direction === DIRECTION_TYPE.BEHIND;
  }
  // 是否在前面
  handleIsFront() {
    return this.direction === DIRECTION_TYPE.FRONT;
  }

  // 返回起始索引偏移量
  getOffset(start: number) {
    return (start < 1 ? 0 : this.getIndexOffset(start)) + this.param.slotHeaderSize;
  }

  // 更新param
  handleUpdateParam(key: string, value: any) {
    if (this.param && key in this.param) {
      // 如果唯一ID发生变化，找出被删除的ID并从size映射中移除
      if (key === 'uniqueIds') {
        this.sizes.forEach((v, key) => {
          if (!value.includes(key)) {
            this.sizes.delete(key);
          }
        });
      }
      this.param[key] = value;
    }
  }

  // 通过id保存每个尺寸图
  handleSaveSize(id: string, size: number) {
    this.sizes.set(id, size);

    // 1.我们假设大小类型在开始时是固定的，并记住第一个大小值
    // 2.如果在下次保存时没有与此不同的大小值
    // 3.我们认为它是一个固定大小的列表，否则就是动态大小的列表。
    if (this.calcType === CALC_TYPE.INIT) {
      this.fixedSizeValue = size;
      this.calcType = CALC_TYPE.FIXED;
    } else if (this.calcType === CALC_TYPE.FIXED && this.fixedSizeValue !== size) {
      this.calcType = CALC_TYPE.DYNAMIC;

      delete this.fixedSizeValue;
    }

    // 仅计算第一个范围内的平均大小
    if (this.calcType !== CALC_TYPE.FIXED && typeof this.firstRangeTotalSize !== 'undefined') {
      if (this.sizes.size < Math.min(this.param.keeps, this.param.uniqueIds.length)) {
        this.firstRangeTotalSize = [...this.sizes.values()].reduce((acc, val) => acc + val, 0);
        this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size);
      } else {
        delete this.firstRangeTotalSize;
      }
    }
  }

  // 在一些特殊情况下（例如长度改变）我们需要在一行中更新
  // 尝试根据当前方向通过前导缓冲区渲染下一个范围
  handleDataSourcesChange() {
    let start = this.range.start;

    if (this.handleIsFront()) {
      start = start - LEADING_BUFFER;
    } else if (this.handleIsBehind()) {
      start = start + LEADING_BUFFER;
    }

    start = Math.max(start, 0);

    this.handleUpdateRange(this.range.start, this.getEndByStart(start));
  }

  // 当插槽大小改变时，我们也需要强制更新
  handleSlotSizeChange() {
    this.handleDataSourcesChange();
  }

  // 计算滚动范围
  handleScroll(offset: number) {
    this.direction = offset < this.offset ? DIRECTION_TYPE.FRONT : DIRECTION_TYPE.BEHIND;
    this.offset = offset;

    if (!this.param) {
      return;
    }

    if (this.direction === DIRECTION_TYPE.FRONT) {
      this.handleFront();
    } else if (this.direction === DIRECTION_TYPE.BEHIND) {
      this.handleBehind();
    }
  }

  // 前置
  handleFront() {
    const overs = this.getScrollOvers();
    // 如果起点不超过终点，则不应更改范围。
    if (overs > this.range.start) {
      return;
    }

    // 向上移动一个缓冲长度，并确保其安全
    const start = Math.max(overs - this.param.buffer, 0);
    this.handleCheckRange(start, this.getEndByStart(start));
  }

  // 后置
  handleBehind() {
    const overs = this.getScrollOvers();
    // 如果在缓冲区内滚动，范围不应更改
    if (overs < this.range.start + this.param.buffer) {
      return;
    }

    this.handleCheckRange(overs, this.getEndByStart(overs));
  }

  // 根据当前的滚动偏移量返回经过
  getScrollOvers() {
    // 如果存在插槽头，我们需要减去它的大小
    const offset = this.offset - this.param.slotHeaderSize;
    if (offset <= 0) {
      return 0;
    }

    // 如果是固定类型
    if (this.handleIsFixedType()) {
      return Math.floor(offset / this.fixedSizeValue);
    }

    let low = 0;
    let middle = 0;
    let middleOffset = 0;
    let high = this.param.uniqueIds.length;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      middleOffset = this.getIndexOffset(middle);

      if (middleOffset === offset) {
        return middle;
      } else if (middleOffset < offset) {
        low = middle + 1;
      } else if (middleOffset > offset) {
        high = middle - 1;
      }
    }

    return low > 0 ? --low : 0;
  }

  // 从给定的索引返回一个滚动偏移量，在这里可以提高效率吗？
  // 虽然呼叫频率很高，但这只是数字的叠加
  getIndexOffset(givenIndex: number) {
    if (!givenIndex) {
      return 0;
    }

    let offset = 0;
    let indexSize = 0;
    for (let index = 0; index < givenIndex; index++) {
      indexSize = this.sizes.get(this.param.uniqueIds[index]);
      offset = offset + (typeof indexSize === 'number' ? indexSize : this.getEstimateSize());
    }

    // 记住上次计算的索引
    this.lastCalcIndex = Math.max(this.lastCalcIndex, givenIndex - 1);
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex());

    return offset;
  }

  // 是否固定大小类型
  handleIsFixedType() {
    return this.calcType === CALC_TYPE.FIXED;
  }

  // 返回真实的最后一个索引
  getLastIndex() {
    return this.param.uniqueIds.length - 1;
  }

  // 在某些情况下，范围被破坏了，我们需要纠正它
  // 然后决定是否需要更新到下一个范围
  handleCheckRange(start: number, end: number) {
    const keeps = this.param.keeps;
    const total = this.param.uniqueIds.length;

    // 数据少于保留的，全部渲染
    if (total <= keeps) {
      start = 0;
      end = this.getLastIndex();
    } else if (end - start < keeps - 1) {
      // 如果范围长度小于保持值，则基于结束值进行更正
      start = end - keeps + 1;
    }

    if (this.range.start !== start) {
      this.handleUpdateRange(start, end);
    }
  }

  // 设置为新的范围并重新渲染
  handleUpdateRange(start: number, end: number) {
    this.range.start = start;
    this.range.end = end;
    this.range.padFront = this.getPadFront();
    this.range.padBehind = this.getPadBehind();
    this.callUpdate(this.getRange());
  }

  // 通过start返回end
  getEndByStart(start: number) {
    const theoryEnd = start + this.param.keeps - 1;
    const truelyEnd = Math.min(theoryEnd, this.getLastIndex());
    return truelyEnd;
  }

  // 返回总前偏移量
  getPadFront() {
    if (this.handleIsFixedType()) {
      return this.fixedSizeValue * this.range.start;
    } else {
      return this.getIndexOffset(this.range.start);
    }
  }

  // 返回前置偏移的总数
  getPadBehind() {
    const end = this.range.end;
    const lastIndex = this.getLastIndex();

    if (this.handleIsFixedType()) {
      return (lastIndex - end) * this.fixedSizeValue;
    }

    // 如果全部计算完毕，返回精确的偏移量。
    if (this.lastCalcIndex === lastIndex) {
      return this.getIndexOffset(lastIndex) - this.getIndexOffset(end);
    } else {
      // 如果不是，使用估计值
      return (lastIndex - end) * this.getEstimateSize();
    }
  }

  // 获取估计值大小
  getEstimateSize() {
    return this.handleIsFixedType() ? this.fixedSizeValue : this.firstRangeAverageSize || this.param.estimateSize;
  }
}
