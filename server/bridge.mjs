export const surveyId = 'example-survey';
export const fields = {context:'context',scene:'scene',actual:'actual',expected:'expected',role:'role',evidence:'evidence',suggestion:'suggestion',outcome:'outcome'};
export function mapResponse(row) {
  const data=row.data||{};
  const projectId={'App／网页体验':'app','黑客松／项目活动':'event','内容平台内容复盘':'content'}[data[fields.scene]];
  if(!row.finished || !projectId || typeof data[fields.actual]!=='string') return null;
  return {id:`formbricks:${row.id}`,projectId,...Object.fromEntries(Object.entries(fields).filter(([key])=>key!=='scene').map(([key,value])=>[key,typeof data[value]==='string'?data[value]:''])),source:'source',sourceId:row.id,surveyId,rawData:data,status:'待审核',category:'待判断',analysisStatus:'待分析（AI未接入）',createdAt:row.createdAt.endsWith('Z')?row.createdAt:row.createdAt+'Z'};
}
export function importResponses(state, rows) {
  const existing=new Set(state.feedback.map(f=>f.id));
  const added=[];
  for(const row of rows){const f=mapResponse(row);if(f&&!existing.has(f.id)){added.push(f);existing.add(f.id)}}
  return {state:{...state,feedback:[...added,...state.feedback]},added:added.length};
}
export async function readResponses(){throw new Error('公开版未配置问卷连接器，请使用自有反馈入口。')}
