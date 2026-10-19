import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoStore,STORAGE_KEY} from '../src/demo-store.js';
const seed=()=>({projects:[],feedback:[],actions:[],research:[],logs:[],revision:0});
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
test('saved judgments and actions survive a new store instance',()=>{const storage=memory(),a=createDemoStore(storage,seed);a.write({...a.read(),feedback:[{id:'E01',assessment:{problem:'核实'}}],actions:[{id:'A01'}]},0);const b=createDemoStore(storage,seed);assert.equal(b.read().feedback[0].assessment.problem,'核实');assert.equal(b.read().actions.length,1)});
test('stale writes cannot overwrite newer records',()=>{const s=createDemoStore(memory(),seed);s.write(s.read(),0);assert.throws(()=>s.write(seed(),0),/另一个页面/);assert.equal(s.read().revision,1)});
test('corrupted records are retained, not silently reset',()=>{const storage=memory();storage.setItem(STORAGE_KEY,'broken');assert.throws(()=>createDemoStore(storage,seed).read(),/原始数据已保留/);assert.equal(storage.getItem(STORAGE_KEY),'broken')});
test('storage failure is not reported as success',()=>{const s=createDemoStore({getItem:()=>null,setItem:()=>{throw new Error('quota')}},seed);assert.throws(()=>s.write(seed(),0),/保存失败/)});
