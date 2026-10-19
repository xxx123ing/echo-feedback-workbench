import fixtures from './demo-fixtures.json';
import {initialState} from './domain.js';
import {acceptIntake} from './intake.js';
import {createDemoStore} from './demo-store.js';
const store=createDemoStore({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},()=>({...initialState(),feedback:structuredClone(fixtures),revision:0}));
export async function demoApi(path,options={}){
 if(path==='/api/ai/status')return {configured:false};
 const state=store.read();
 if(path==='/api/state'){if(options.method==='PUT'){const next=JSON.parse(options.body);return store.write(next,next.revision)}return structuredClone(state)}
 if(path.startsWith('/api/project/'))return structuredClone(state.projects.find(p=>p.id===decodeURIComponent(path.split('/').at(-1))));
 if(path==='/api/feedback'){const result=acceptIntake(state,JSON.parse(options.body));if(!result.duplicate)store.write(result.state,state.revision);return {id:result.id}}
 throw new Error('公开演示不连接外部服务；请本地运行源码验证真实接口。');
}
