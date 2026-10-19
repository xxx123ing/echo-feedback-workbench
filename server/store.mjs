import {readFile,writeFile,rename,mkdir,copyFile} from 'node:fs/promises';
import {initialState} from '../src/domain.js';
export function createStore(directory){
 const file=new URL('state.json',directory);let queue=Promise.resolve();
 async function read(){try{return JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;const s=initialState();return {...s,feedback:[],projects:s.projects.map(p=>({...p,name:{app:'示例健康App · 产品体验',event:'示例活动 · 黑客松活动',content:'内容平台 · 内容复盘'}[p.id],background:'收集真实反馈，保留原文与证据。建议经人工确认后进入改进与复测。'})),revision:0}}}
 function transact(fn){const task=queue.then(async()=>{const current=await read();const next=await fn(current);next.revision=current.revision+1;await mkdir(directory,{recursive:true});try{await copyFile(file,new URL('state.backup.json',directory))}catch(e){if(e.code!=='ENOENT')throw e}const tmp=new URL('state.tmp',directory);await writeFile(tmp,JSON.stringify(next,null,2));await rename(tmp,file);return next});queue=task.catch(()=>{});return task}
 return {read,transact};
}
