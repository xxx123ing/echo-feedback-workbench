import test from 'node:test';
import assert from 'node:assert/strict';
import {validateStructured} from '../server/structured-analysis.mjs';
const input={evidence:'已有可复用日程链接；仅允许配置。'};
const card={facts:[{field:'evidence',text:'已有可复用日程链接'}],gaps:[],hypotheses:['入口可见性调整可能减少查找时间']};
test('empty gaps do not require fabricated questions',()=>assert.equal(validateStructured(card,input).unknowns,'当前资料未发现明确缺失项'));
test('rejects unsupported evidence and invalid arrays',()=>{assert.throws(()=>validateStructured({...card,facts:[{field:'evidence',text:'用户已完成报名'}]},input));assert.throws(()=>validateStructured({...card,gaps:'未知'},input));});
test('rejects exact cross-field duplicates and contradictory fallback',()=>{assert.throws(()=>validateStructured({...card,gaps:['已有可复用日程链接']},input));assert.throws(()=>validateStructured({...card,gaps:card.hypotheses},input));assert.throws(()=>validateStructured({...card,gaps:['未发现明确缺失项，但需确认版本']},input));});
