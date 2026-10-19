import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectFeedback,mergeFeedback,contentMetrics,suggestCategory} from '../src/domain.js';
test('incomplete feedback has at most two optional follow-up questions',()=>{assert.equal(inspectFeedback({actual:'不好用'}).length,2)});
test('complete evidence does not trigger repetitive questions',()=>{assert.deepEqual(inspectFeedback({actual:'点击确认上传按钮后页面没有变化，重新打开仍然如此。',expected:'看到上传成功提示',context:'App测试版本首页'}),[])});
test('merge preserves evidence and rejects cross-project rows',()=>{const rows=[{id:'1',projectId:'a',actual:'原始一'},{id:'2',projectId:'a',actual:'原始二'},{id:'3',projectId:'b'}];const result=mergeFeedback(rows,['1','2']);assert.equal(result[0].actual,'原始一');assert.equal(result[0].groupId,result[1].groupId);assert.equal(rows[0].groupId,undefined);assert.throws(()=>mergeFeedback(rows,['1','3']));assert.throws(()=>mergeFeedback(result,['1','2']));});
test('metrics reject missing or zero denominators and retain zero interactions',()=>{assert.equal(contentMetrics({exposure:0,interactions:5}),null);assert.equal(contentMetrics({exposure:100,interactions:''}),null);assert.equal(contentMetrics({exposure:100,interactions:0}),0);assert.equal(contentMetrics({exposure:1000,interactions:40}),4)});
test('rules do not fabricate a category for unrelated feedback',()=>assert.equal(suggestCategory({actual:'今天试用了一下'}),'待判断'));
