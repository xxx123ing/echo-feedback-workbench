import React,{useState} from 'react';
export function analysisHistory(feedback){
 const rows=[...(feedback.aiHistory||[]),...(feedback.aiAnalysis?[feedback.aiAnalysis]:[])];
 return [...new Map(rows.filter(r=>r?.id).map(r=>[r.id,r])).values()].sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
}
const time=value=>value?new Date(value).toLocaleString('zh-CN'):'时间未记录';
const seconds=value=>Number.isFinite(value)?(value/1000).toFixed(2)+' 秒':'未记录';
export default function AnalysisHistory({feedback}){
 const history=analysisHistory(feedback);
 const [open,setOpen]=useState(history.length>=2);
 const [leftId,setLeftId]=useState(''),[rightId,setRightId]=useState('');
 const right=history.find(r=>r.id===rightId)||history.at(-1);
 const left=history.find(r=>r.id===leftId)||history.at(-2)||history[0];
 const label=(r,i)=>`第 ${i+1} 次 · ${r.promptVersion||'版本未记录'} · ${time(r.createdAt)}`;
 const fields=[['问题标题','title'],['核心问题','problem'],['待核实信息','unknowns'],['方案与取舍','proposal']];
 return <section className="panel history-panel"><div className="row between"><div><h2>分析历史与版本对比</h2><p>已保存 {history.length} 次分析 · 查看历史不会调用模型或消耗额度。</p></div><button className="secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'收起版本对比':'展开分析历史与版本对比'}</button></div>{open&&(!history.length?<p>本条记录尚未生成 AI 分析，没有可比较的版本。模拟基线与真实反馈各自保存历史，不会混合。</p>:<><div className="grid two"><label>对比左侧版本<select value={left.id} onChange={e=>setLeftId(e.target.value)}>{history.map((r,i)=><option key={r.id} value={r.id}>{label(r,i)}</option>)}</select></label><label>对比右侧版本<select value={right.id} onChange={e=>setRightId(e.target.value)}>{history.map((r,i)=><option key={r.id} value={r.id}>{label(r,i)}</option>)}</select></label></div>{left.id===right.id&&<p className="banner">当前两侧是同一次记录；至少需要两次分析才能比较变化。</p>}<div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>对比项</th><th>左侧 · {left.promptVersion||'未记录'}</th><th>右侧 · {right.promptVersion||'未记录'}</th></tr></thead><tbody><tr><th>生成时间</th><td>{time(left.createdAt)}</td><td>{time(right.createdAt)}</td></tr><tr><th>模型</th><td>{left.model||'未记录'}</td><td>{right.model||'未记录'}</td></tr><tr><th>调用耗时</th><td>{seconds(left.latencyMs)}</td><td>{seconds(right.latencyMs)}</td></tr><tr><th>Token 用量</th><td>{left.usage?.total_tokens??'未记录'}</td><td>{right.usage?.total_tokens??'未记录'}</td></tr>{fields.map(([name,key])=><tr key={key} className={left[key]!==right[key]?'changed':''}><th>{name}{left[key]!==right[key]&&<small>内容有变化</small>}</th><td>{left[key]||'未记录'}</td><td>{right[key]||'未记录'}</td></tr>)}<tr><th>原文引用</th>{[left,right].map((r,i)=><td key={i}>{(r.quotes||[]).map((q,j)=><p key={j}>[{q.field}] {q.text}</p>)}</td>)}</tr></tbody></table></div><p className="muted">颜色只表示文字发生变化，不代表质量更高。单次耗时不能当作平均性能；历史记录未保存输入快照时，也不能仅凭页面认定两次输入完全一致。引用匹配不代表判断含义正确，采纳仍需审核。</p></>)}</section>;
}
