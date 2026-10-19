export const types = {app:'App 体验',event:'活动反馈',content:'内容复盘'};
export const categories = ['待判断','功能异常','理解障碍','流程体验','内容建议','其他'];
export function inspectFeedback(data) {
  const missing=[];
  if(!data.actual || data.actual.trim().length<15) missing.push('请描述当时做了什么，以及具体发生的现象。');
  if(!data.expected?.trim()) missing.push('你原本希望发生什么？');
  if(!data.context?.trim()) missing.push('请补充发生的环节、版本或内容样本。');
  return missing.slice(0,2);
}
export function suggestCategory(data) {
  const text=data.actual||'';
  if(/闪退|报错|打不开|崩溃/.test(text)) return '功能异常';
  if(/不懂|看不懂|不明白/.test(text)) return '理解障碍';
  if(/等待|太长|太久|麻烦/.test(text)) return '流程体验';
  return '待判断';
}
export function contentMetrics(data) {
  const exposure=Number(data.exposure),interactions=Number(data.interactions);
  if(data.exposure==='' || data.exposure==null || data.interactions==='' || data.interactions==null || !Number.isFinite(exposure) || !Number.isFinite(interactions) || exposure<=0 || interactions<0) return null;
  return interactions/exposure*100;
}
export function mergeFeedback(rows, selected) {
  const chosen=rows.filter(x=>selected.includes(x.id));
  if(chosen.length<2 || new Set(chosen.map(x=>x.projectId)).size!==1) throw new Error('至少选择同一项目的两条未合并反馈');
  if(chosen.some(x=>x.groupId)) throw new Error('请先撤销已有合并');
  const groupId=crypto.randomUUID();
  return rows.map(x=>selected.includes(x.id)?{...x,groupId}:x);
}
export function initialState(){return {projects:[
  {id:'app',name:'示例健康App · 团队内测样本',type:'app',audience:'参与内部测试的团队成员',goal:'验证入口理解、任务完成和反馈可复现性',visibility:'团队私有',background:'依据录屏建立的项目框架；下列反馈均为虚构演示，不是实际用户评价。'},
  {id:'event',name:'黑客松 · 活动体验样本',type:'event',audience:'参赛者、组织者、体验者',goal:'区分不同角色在报名、组队、展示环节的问题',visibility:'邀请参与',background:'演示项目，未导入真实活动数据。'},
  {id:'content',name:'内容平台 · 内容复盘样本',type:'content',audience:'账号运营人员',goal:'结合内容背景和指标提出待验证的改进假设',visibility:'团队私有',background:'演示项目，不代表账号真实经营成果。'}
],feedback:[
 {id:'sample-app',projectId:'app',role:'团队测试者',context:'演示版本 / 首页',actual:'不知道从哪个入口开始放松体验，来回切换了页面。',expected:'能找到明确的开始入口',outcome:'需要帮助',source:'虚构演示',category:'理解障碍',status:'待审核',createdAt:new Date().toISOString()},
 {id:'sample-event',projectId:'event',role:'参赛者',context:'演示活动 / 组队',actual:'等了很久，没有看到组队结果，也不知道下一步找谁。',expected:'知道组队结果及联系人',outcome:'未完成',source:'虚构演示',category:'流程体验',status:'待审核',createdAt:new Date().toISOString()},
 {id:'sample-content',projectId:'content',role:'运营人员',context:'示例笔记 / 统一观察窗口',actual:'希望核查这篇笔记的互动表现；目前只有单篇数据，不能判断原因。',expected:'确认指标口径后再提出假设',exposure:1000,interactions:40,outcome:'已完成',source:'虚构演示',category:'待判断',status:'待审核',createdAt:new Date().toISOString()}
],actions:[],research:[],logs:[]};}
