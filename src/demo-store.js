export const STORAGE_KEY='echo-demo-state-v1';
export function createDemoStore(storage,seed){
 function read(){
  let raw;
  try{raw=storage.getItem(STORAGE_KEY)}catch{throw new Error('浏览器存储不可用，请允许网站保存本地数据。')}
  if(!raw)return structuredClone(seed());
  try{const value=JSON.parse(raw);if(value.version!==1||!['projects','feedback','actions','research','logs'].every(k=>Array.isArray(value.state?.[k]))||!Number.isInteger(value.state.revision))throw new Error();return value.state}
  catch{throw new Error('本地记录无法读取，原始数据已保留。请勿清除浏览器数据，先联系维护者导出恢复。')}
 }
 function write(next,revision){
  const current=read();
  if(current.revision!==revision)throw new Error('记录已在另一个页面更新，请刷新后重试，避免覆盖。');
  const saved={...next,revision:current.revision+1};
  try{storage.setItem(STORAGE_KEY,JSON.stringify({version:1,state:saved}))}catch{throw new Error('本地保存失败，可能空间不足或存储被禁用；请导出记录备份。')}
  return structuredClone(saved);
 }
 return {read,write};
}
