import test from 'node:test';
import assert from 'node:assert/strict';
import {readRoute,routeHref} from '../src/navigation.js';
test('detail and inbox have distinct addresses and restore project and record on refresh',()=>{
 const detail=routeHref('detail','event','formbricks:123');
 assert.notEqual(detail,routeHref('inbox','event'));
 assert.deepEqual(readRoute(detail),{tab:'detail',projectId:'event',detailId:'formbricks:123'});
 assert.deepEqual(readRoute(routeHref('inbox','event')),{tab:'inbox',projectId:'event',detailId:null});
});
test('existing inbox links still open the list and malformed routes recover',()=>{assert.equal(readRoute('#inbox').tab,'inbox');assert.equal(readRoute('#issue/%zz').tab,'overview')});
