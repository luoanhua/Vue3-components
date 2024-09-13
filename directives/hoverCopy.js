import { on, off } from '@/components/utils';
import { ElMessage } from 'element-plus';

// 该dom元素必须带有cursor:pointer 属性，才能配合复制
// 如果传参的话，是给style样式binding.value
// dblclick / click
const clickTypeFn = (type) => {
  let name = 'click';
  if (type) {
    name = type;
  } else {
    name = 'click';
  }
  return name;
};

const hoverCopy = {
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {
    const spanDom = document.createElement('span');
    spanDom.style.cssText = `
      background-color: #fff;
      color: #2783fc;
      font-size: 14px;
      padding: 3.5px 0px;
      text-align:center;
      width: 44px;
      font-weight: 400;
      opacity:0;
      ${binding.value}
    `;
    spanDom.id = 'spanId';
    spanDom.innerText = '复制';

    el.appendChild(spanDom);

    on(el, 'mouseenter', () => {
      spanDom.style.opacity = 1;
    });

    on(el, 'mouseleave', () => {
      spanDom.style.opacity = 0;
    });

    on(el, clickTypeFn(binding.arg), (e) => {
      if (window.getComputedStyle(e.target).getPropertyValue('cursor') == 'pointer') {
        navigator.clipboard.writeText(e.target.innerText);
        ElMessage({
          message: '复制成功',
          type: 'success',
        });
      }
    });
  },

  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handler = () => {};
    off(el, 'mouseenter', handler);
    off(el, 'mouseleave', handler);
    off(el, clickTypeFn(binding.arg), handler);
  },
};

export function setupHoverCopyDirective(app) {
  app.directive('hover-copy', hoverCopy);
}
