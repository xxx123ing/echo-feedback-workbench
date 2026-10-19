import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAnalysis} from '../server/ai.mjs';
const input={actual:'点击保存后没有成功提示。'};
const card={title:'缺少保存提示',problem:'保存结果不明确',unknowns:'需验证实际是否保存',proposal:'补充提示并测试',quotes:[{field:'actual',text:'没有成功提示'}]};
test('AI quotations must exist verbatim in their declared source',()=>{assert.equal(validateAnalysis(card,input).quotes.length,1);assert.throws(()=>validateAnalysis({...card,quotes:[{field:'actual',text:'保存造成数据丢失'}]},input));assert.throws(()=>validateAnalysis({...card,quotes:[{field:'expected',text:'没有成功提示'}]},input))});
test('malformed model fields and empty evidence are rejected',()=>{assert.throws(()=>validateAnalysis({...card,unknowns:[]},input));assert.throws(()=>validateAnalysis({...card,quotes:[]},input));assert.throws(()=>validateAnalysis(null,input))});
test('generic missing-information placeholder is rejected',()=>{assert.throws(()=>validateAnalysis({...card,unknowns:'暂无更多已知条件，需后续验证'},input));assert.equal(validateAnalysis({...card,unknowns:'需核实点击次数及保存是否完成'},input).unknowns,'需核实点击次数及保存是否完成')});
