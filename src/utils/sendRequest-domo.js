// 为控制请求并发的Demo
const sendRequest = (urls, max, callback) => {
  let finished = 0;
  const total = urls.length;
  const handler = () => {
    if (urls.length) {
      const url = urls.shift();
      fetch(url)
        .then(() => {
          finished++;
          handler();
        })
        .catch((err) => {
          throw Error(err);
        });
    }

    if (finished >= total) {
      callback();
    }
  };
  // for控制初始并发
  for (let i = 0; i < max; i++) {
    handler();
  }
};

const urls = Array.from({ length: 10 }, (v, k) => k);

const fetch = function (idx) {
  return new Promise((resolve) => {
    const timeout = parseInt(Math.random() * 1e4);
    console.log('----请求开始');
    setTimeout(() => {
      console.log('----请求结束');
      resolve(idx);
    }, timeout);
  });
};

const max = 4;

const callback = () => {
  console.log('所有请求执行完毕');
};

sendRequest(urls, max, callback);
