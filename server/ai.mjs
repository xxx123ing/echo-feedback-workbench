import {structuredPrompt,validateStructured} from './structured-analysis.mjs';
import {loadEnvFile} from 'node:process';
try{loadEnvFile(new URL('../.env.local',import.meta.url))}catch{/* Never log configuration contents. */}
const endpoint='https://api.deepseek.com/chat/completions';
const model=['deepseek-flash','deepseek-v4-pro'].includes(process.env.DEEPSEEK_MODEL)?process.env.DEEPSEEK_MODEL:'deepseek-flash';
export function aiStatus(){return {configured:!!process.env.DEEPSEEK_API_KEY?.trim(),model,provider:'DeepSeek',promptVersion:'issue-card-v4'}}
export function validateAnalysis(value,input){
 const keys=['title','problem','unknowns','proposal'];
 if(!value||keys.some(k=>typeof value[k]!=='string'||!value[k].trim()||value[k].length>4000))throw new Error('模型输出字段不完整，请重试或人工整理。');
 if(/^(暂无更多已知条件[，,]?需后续验证|需后续验证|待核实)[。！!]?$/u.test(value.unknowns.replace(/\s/g,'')))throw new Error('信息缺口过于空泛，本次结果未采纳。');
 if(!Array.isArray(value.quotes)||!value.quotes.length||value.quotes.length>5)throw new Error('模型未提供有效原文引用，请重试。');
 const quotes=value.quotes.map(q=>{
  if(!q||!['actual','expected','evidence','suggestion'].includes(q.field)||typeof q.text!=='string'||q.text.trim().length<4||!(input[q.field]||'').includes(q.text))throw new Error('模型引用未通过原文核对，本次结果未采纳。');
  return {field:q.field,text:q.text};
 });
 return {...Object.fromEntries(keys.map(k=>[k,value[k]])),quotes,basis:quotes.map(q=>`[${q.field}] ${q.text}`).join('\n')};
}
export async function analyzeFeedback(feedback){
 if(!aiStatus().configured)throw new Error('尚未配置个人密钥，请在本地配置文件填写并重启数据服务。');
 const input=Object.fromEntries(['actual','expected','evidence','suggestion'].map(k=>[k,String(feedback[k]||'').slice(0,6000)]));
 const started=Date.now();let response;
 try{response=await fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(60000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.DEEPSEEK_API_KEY.trim()}`},body:JSON.stringify({model,thinking:{type:'disabled'},temperature:0.2,max_tokens:1800,response_format:{type:'json_object'},messages:[{role:'system',content:structuredPrompt},{role:'user',content:JSON.stringify(input)}]})})}catch{throw new Error('连接 DeepSeek 失败或超过60秒，请检查网络后重试。')}
 if(!response.ok){const errors={401:'密钥验证失败，请在本地更换有效密钥并重启数据服务。',402:'DeepSeek 账户余额不足，请在个人开放平台检查余额。',429:'调用过于频繁，请稍后重试。'};throw new Error(errors[response.status]||`DeepSeek 暂未完成请求（HTTP ${response.status}），请稍后重试。`)}
 let result;try{result=await response.json()}catch{throw new Error('接口返回格式异常，请稍后重试。')}
 if(result.choices?.[0]?.finish_reason!=='stop')throw new Error('模型输出未完整结束，本次不保存结果。');
 let data;try{data=JSON.parse(result.choices[0].message.content)}catch{throw new Error('模型输出不是有效JSON，请重试。')}
 const structured=validateStructured(data,input);
 const card={...validateAnalysis(structured,input),facts:structured.facts,gaps:structured.gaps,hypotheses:structured.hypotheses,consistencyCheck:structured.consistencyCheck};
 const usage=Object.fromEntries(['prompt_tokens','completion_tokens','total_tokens'].map(k=>[k,Number.isFinite(result.usage?.[k])?result.usage[k]:null]));
 return {...card,id:crypto.randomUUID(),model,promptVersion:'issue-card-v4',createdAt:new Date().toISOString(),latencyMs:Date.now()-started,usage,status:'待人工审核',citationCheck:'原文字符串匹配通过；含义仍需人工审核'};
}
