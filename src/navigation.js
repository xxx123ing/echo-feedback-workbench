const pages=['overview','collect','inbox','research','actions','logs'];
export function readRoute(hash){
 try{
  const [path,query='']=hash.replace(/^#/,'').split('?');
  const projectId=new URLSearchParams(query).get('project')||'app';
  if(path.startsWith('issue/')&&path.length>6)return {tab:'detail',detailId:decodeURIComponent(path.slice(6)),projectId};
  return {tab:pages.includes(path)?path:'overview',detailId:null,projectId};
 }catch{return {tab:'overview',detailId:null,projectId:'app'}}
}
export function routeHref(tab,projectId='app',detailId=null){
 const path=tab==='detail'&&detailId?'issue/'+encodeURIComponent(detailId):pages.includes(tab)?tab:'inbox';
 return '#'+path+(projectId==='app'?'':'?project='+encodeURIComponent(projectId));
}
