import React,{useState} from 'react';
import AnalysisHistory from './AnalysisHistory.jsx';
export default function IssueDetail({feedback:f,actions,research,onSave,onBack,onAction,ai,onAnalyze}){
 const a=f.assessment||{},s=f.aiAnalysis;
 const [dirty,setDirty]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 return <div className="issue-simple">
 <button className="secondary" onClick={onBack}>← 返回反馈列表</button>
 <div className="section-heading detail-heading"><div><p className="eyebrow">理解问题，再决定行动</p><h2>{a.title||f.context||'待梳理的体验问题'}</h2></div><span className="pill">{a.updatedAt?'判断已保存':'待梳理'}</span></div>
 <form className="panel judgment-card" key={f.id+(a.updatedAt||'')} onChange={()=>setDirty(true)} onSubmit={async e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));setSaving(true);setError('');try{const ok=await onSave({...a,...values,title:a.title||f.context||'待核实的体验问题'});if(ok)setDirty(false)}catch{setError('保存失败，请重试。')}finally{setSaving(false)}}}>
 <label>是什么<textarea name="problem" defaultValue={a.problem||''} placeholder="发生了什么，用户希望怎样？" required rows={3}/></label>
 <label>为什么这样判断<textarea name="basis" defaultValue={a.basis||''} placeholder="写明原文依据，以及尚未确认的信息。" required rows={3}/></label>
 <label>下一步怎么做<textarea name="proposal" defaultValue={a.proposal||''} placeholder="先补充什么信息，或采取什么可验证的行动？" rows={3}/></label>
 <div className="row"><button disabled={saving}>{saving?'保存中…':'保存判断'}</button>{a.updatedAt&&<button type="button" className="secondary" disabled={saving||dirty} onClick={onAction}>{actions.length?'查看待办':'加入待办'}</button>}<small>{dirty?'有修改待保存':'原文与历史分析独立保留'}</small></div>{error&&<p role="alert">{error}</p>}
 </form>
 <details className="panel compact-detail"><summary>查看原文</summary><h4>实际描述</h4><blockquote>{f.actual}</blockquote><h4>用户期望</h4><p>{f.expected||'未提供'}</p><h4>补充证据</h4><p>{f.evidence||'未提供'}</p>{f.supplementText&&<p>{f.supplementText}</p>}{f.suggestion&&<p>提交者建议：{f.suggestion}</p>}<small>来源：{f.source} · {f.sourceId||f.id}</small></details>
 <details className="panel compact-detail"><summary>更多：AI建议、历史与关联记录</summary><h3>AI建议 · 供审核参考</h3>
 {s?<><p><b>是什么：</b>{s.problem}</p><p><b>判断依据：</b>{s.basis||'请结合引用核对。'}</p><p><b>仍需确认：</b>{s.unknowns}</p><p><b>下一步：</b>{s.proposal}</p>{s.facts?.length>0&&<><h4>材料中的陈述</h4><ul>{s.facts.map((x,i)=><li key={i}>{x.text}</li>)}</ul></>}{s.hypotheses?.length>0&&<><h4>待验证假设</h4><ul>{s.hypotheses.map((x,i)=><li key={i}>{x}</li>)}</ul></>}<details><summary>引用及调用信息</summary>{s.quotes?.map((q,i)=><blockquote key={i}>{q.text} <small>[{q.field}]</small></blockquote>)}<small>{s.model} · {s.usage?.total_tokens??'未知'} Tokens · {s.citationCheck}</small></details></>:<p>尚无AI分析。</p>}
 {ai?.configured?<><p className="muted">分析会将本条反馈发送至DeepSeek，使用个人API额度；结果不会覆盖已保存判断。</p><button className="secondary" onClick={onAnalyze}>{s?'重新分析':'生成AI建议'}</button></>:<p className="muted">当前未连接模型，仅可查看已有分析。</p>}
 <AnalysisHistory key={f.id} feedback={f}/>{a.unknowns&&<p><b>此前记录的待核实信息：</b>{a.unknowns}</p>}
 {actions.length>0&&<><h4>关联待办</h4>{actions.map(x=><p key={x.id}>{x.title} · {x.status}</p>)}</>}{research.map(r=><p key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></p>)}
 </details></div>;
}
