export function saveObjArr(name, data) {
  // localStorage 存储数组对象的方法
  localStorage.setItem(name, JSON.stringify(data));
}

export function getObjArr(name) {
  // localStorage 获取数组对象的方法
  const res = window.localStorage.getItem(name);
  if (res && res !== 'undefined') {
    return JSON.parse(res);
  }
  return false;
}

export function clearLocalStorage(name) {
  localStorage.removeItem(name);
}
