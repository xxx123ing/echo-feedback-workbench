export const sourceOptions=['本人实际观察','转述记录','构造测试案例'];
export function validateIntake(projectId, data, projects){
 if(!projects.some(p=>p.id===projectId))throw new Error('项目不存在，请检查反馈链接');
 for(const key of ['actual','outcome','source'])if(typeof data[key]!=='string'||!data[key].trim())throw new Error('请填写实际体验、任务结果和材料来源');
 if(!sourceOptions.includes(data.source))throw new Error('材料来源无效');
 if(!['已完成','完成但有障碍','需要帮助','未完成','不适用'].includes(data.outcome))throw new Error('任务结果无效');
 const keys=['role','context','actual','expected','outcome','evidence','suggestion','source','exposure','interactions','supplementText'];
 const clean=Object.fromEntries(keys.map(k=>[k,typeof data[k]==='string'?data[k].trim():'']));
 if(Object.values(clean).some(v=>v.length>12000))throw new Error('单个字段最多 12000 字');
 for(const k of ['exposure','interactions'])if(clean[k]!==''&&(!Number.isFinite(Number(clean[k]))||Number(clean[k])<0))throw new Error('曝光和互动次数必须是非负数字');
 return clean;
}
export function acceptIntake(state, input){
 if(typeof input.requestId!=='string'||!/^[-a-zA-Z0-9]{16,80}$/.test(input.requestId))throw new Error('提交标识无效，请刷新重试');
 const clean=validateIntake(input.projectId,input.data||{},state.projects);
 const existing=state.feedback.find(f=>f.requestId===input.requestId);
 if(existing){if(existing.projectId!==input.projectId)throw new Error('提交标识冲突');return {state,id:existing.id,duplicate:true}}
 const record={...clean,id:crypto.randomUUID(),requestId:input.requestId,projectId:input.projectId,status:'待审核',category:'待判断',analysisStatus:'待分析（AI未接入）',createdAt:new Date().toISOString()};
 return {state:{...state,feedback:[record,...state.feedback],logs:[{id:crypto.randomUUID(),time:record.createdAt,projectId:input.projectId,message:'收到回声反馈入口提交的记录（'+clean.source+'）'},...state.logs]},id:record.id,duplicate:false};
}
