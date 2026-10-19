import test from 'node:test';
import assert from 'node:assert/strict';
import {acceptIntake,validateIntake} from '../src/intake.js';
const state={projects:[{id:'app'},{id:'event'},{id:'content'}],feedback:[],logs:[]};
const input={projectId:'event',requestId:'test-request-id-1234',data:{actual:'构造测试：组队通知缺少时间',outcome:'不适用',source:'构造测试案例'}};
test('intake assigns exact project and ignores client approval or id fields',()=>{const result=acceptIntake(state,{...input,data:{...input.data,status:'已确认',id:'fake',category:'功能异常'}});assert.equal(result.state.feedback[0].projectId,'event');assert.equal(result.state.feedback[0].status,'待审核');assert.notEqual(result.id,'fake');assert.equal(result.state.feedback[0].category,'待判断')});
test('retry with same request id does not create duplicate feedback',()=>{const first=acceptIntake(state,input);const second=acceptIntake(first.state,input);assert.equal(first.id,second.id);assert.equal(second.state.feedback.length,1);assert.equal(second.duplicate,true)});
test('invalid project, blank evidence text and negative metrics fail validation',()=>{assert.throws(()=>validateIntake('missing',input.data,state.projects));assert.throws(()=>validateIntake('app',{...input.data,actual:' '},state.projects));assert.throws(()=>validateIntake('content',{...input.data,exposure:'-1'},state.projects));assert.throws(()=>acceptIntake(state,{...input,requestId:'bad'}))});
