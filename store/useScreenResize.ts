import { defineStore } from 'pinia';
import { reactive } from 'vue';
export const useScreenResize = defineStore('useScreenResize', () => {
  const screenStates = reactive({
    windowSize: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    },
  });
  function setWindowSize() {
    screenStates.windowSize.width = document.body.clientWidth;
    screenStates.windowSize.height = document.body.clientHeight;
  }
  return {
    screenStates,
    setWindowSize,
  };
});

// import { useScreenResize } from '@/store/index.ts';
// const { setWindowSize } = useScreenResize();
// const windowResize = useScreenResize().screenStates.windowSize;
// watch(
//   [() => windowResize],
//   (val, oldVal) => {
//     console.log('触发了');
//   },
//   {
//     deep: true,
//   }
// );

// window.onresize = debounce(() => {
//   setWindowSize();
// }, 200);
