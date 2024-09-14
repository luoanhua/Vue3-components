import { getCurrentInstance, watch } from 'vue';
import { CancelToken } from 'axios';
import { Api as $api, httpAxios as $http } from '@/fetch/index';
export default function () {
  function cancelList(cancelTokenList, urlApi) {
    return cancelTokenList ? cancelTokenList : `${urlApi}CancelToken`;
  }
  async function getPortWithCancel({ method, urlApi, param, cancelTokenList }) {
    clearHttpRequestingList(cancelTokenList, urlApi);

    const res =
      (await httpPortWithCancel({
        method,
        urlApi,
        param,
        config: {
          cancelToken: new CancelToken((c) => {
            if (window[cancelList(cancelTokenList, urlApi)]) {
              window[cancelList(cancelTokenList, urlApi)].push(c);
            } else {
              window[cancelList(cancelTokenList, urlApi)] = [];
            }
          }),
        },
      })) || {};
    return res;
  }
  function httpPortWithCancel({ method, urlApi, param, config }) {
    return new Promise((resolve) => {
      $http(method, $api[urlApi], param, config)
        .then((res) => {
          resolve(res);
        })
        .catch((res) => {
          resolve(res);
        });
    });
  }

  // 清楚
  function clearHttpRequestingList(cancelTokenList, urlApi) {
    if (window[cancelList(cancelTokenList, urlApi)]?.length > 0) {
      window[cancelList(cancelTokenList, urlApi)].forEach((item) => {
        item();
      });
      window[cancelList(cancelTokenList, urlApi)] = [];
    }
  }
  return {
    getPortWithCancel,
  };
}
