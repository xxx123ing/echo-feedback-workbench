import http from 'node:http';
import {createStore} from './store.mjs';
import {readResponses,importResponses} from './bridge.mjs';
import {acceptIntake} from '../src/intake.js';
import {aiStatus,analyzeFeedback} from './ai.mjs';
const pendingAnalysis=new Set();
const store=createStore(new URL('../data/',import.meta.url));
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(text.length>8*1024*1024)throw new Error('数据过大')}return JSON.parse(text)}
http.createServer(async(req,res)=>{
 try{
  if(!['127.0.0.1:5188','localhost:5188'].includes(req.headers.host))return send(res,403,{error:'仅支持本地访问'});
  if(req.headers.origin&&!['http://127.0.0.1:5187','http://localhost:5187'].includes(req.headers.origin))return send(res,403,{error:'来源不允许'});
  if(req.method==='GET'&&req.url==='/api/ai/status')return send(res,200,aiStatus());
  if(req.method==='POST'&&req.url==='/api/ai/analyze'){
   if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'需要 JSON'});
   const {feedbackId}=await body(req);
   const state=await store.read();const feedback=state.feedback.find(f=>f.id===feedbackId);
   if(!feedback)return send(res,404,{error:'反馈不存在'});
   if(pendingAnalysis.size)return send(res,409,{error:'已有分析正在进行，请等待完成后再试。'});
   pendingAnalysis.add(feedbackId);
   try{
    const analysis=await analyzeFeedback(feedback);
    const next=await store.transact(s=>({...s,feedback:s.feedback.map(f=>f.id===feedbackId?{...f,aiAnalysis:analysis,aiHistory:[...(f.aiHistory||[]),analysis],analysisStatus:'AI建议待审核'}:f),logs:[{id:crypto.randomUUID(),time:analysis.createdAt,projectId:feedback.projectId,message:`AI分析完成 · ${analysis.model} · ${analysis.latencyMs}ms · ${analysis.usage.total_tokens??'未知'} tokens · 原文匹配通过，等待人工审核`},...s.logs]}));
    return send(res,200,next);
   }catch(e){
    await store.transact(s=>({...s,logs:[{id:crypto.randomUUID(),time:new Date().toISOString(),projectId:feedback.projectId,message:'AI分析失败：'+e.message},...s.logs]}));
    return send(res,502,{error:e.message});
   }finally{pendingAnalysis.delete(feedbackId)}
  }
  if(req.method==='GET'&&req.url.startsWith('/api/project/')){
   const id=decodeURIComponent(req.url.slice('/api/project/'.length));
   const state=await store.read();const p=state.projects.find(p=>p.id===id);
   return p?send(res,200,{id:p.id,name:p.name,type:p.type,goal:p.goal}):send(res,404,{error:'项目不存在'});
  }
  if(req.method==='POST'&&req.url==='/api/feedback'){
   if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'需要 JSON'});
   const input=await body(req);let result;
   try{await store.transact(s=>{result=acceptIntake(s,input);return result.state})}catch(e){return send(res,400,{error:e.message})}
   return send(res,201,{id:result.id,duplicate:result.duplicate});
  }
  if(req.method==='GET'&&req.url==='/api/state')return send(res,200,await store.read());
  if(req.method==='POST'&&req.url==='/api/sync'){
   const rows=await readResponses();let added=0;
   const next=await store.transact(s=>{const result=importResponses(s,rows);added=result.added;return {...result.state,lastSync:new Date().toISOString(),logs:[{id:crypto.randomUUID(),time:new Date().toISOString(),projectId:'app',message:`同步 Formbricks：新增 ${added} 条完整反馈；已有记录保留人工处理结果`},...s.logs]}});
   return send(res,200,{state:next,added});
  }
  if(req.method==='PUT'&&req.url==='/api/state'){
   if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'需要 JSON'});
   const next=await body(req);
   if(!['projects','feedback','actions','research','logs'].every(k=>Array.isArray(next[k])))return send(res,400,{error:'记录格式不完整'});
   const saved=await store.transact(current=>{if(next.revision!==current.revision){const e=new Error('其他窗口已更新记录，请刷新后重试。');e.status=409;throw e}return next});
   return send(res,200,saved);
  }
  send(res,404,{error:'接口不存在'});
 }catch(e){send(res,e.status||500,{error:e.message||'本地服务异常'})}
}).listen(5188,'127.0.0.1',()=>console.log('回声本地数据服务 http://127.0.0.1:5188'));
