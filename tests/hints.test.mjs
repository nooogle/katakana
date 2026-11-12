import {test} from 'node:test';
import assert from 'node:assert/strict';
import {KANA} from '../js/deck.js';
import {HINTS} from '../js/hintdata.js';

test('every entry in the deck has a hint',()=>{
  assert.deepEqual(KANA.filter(x=>!(HINTS[x.k]&&HINTS[x.k].trim())).map(x=>x.k),[]);
});
test('the basic hints are the drafted ones',()=>{
  assert.match(HINTS['ア'],/^An axe/);
});
test('dakuten hints are built from the base kana',()=>{
  assert.equal(HINTS['ガ'],'カ with two little marks, so ka becomes ga.');
  assert.equal(HINTS['パ'],'ハ with a little circle, so ha becomes pa.');
  assert.match(HINTS['ヂ'],/sounds just like ジ/);
});
test('combination and foreign-sound hints explain the small kana',()=>{
  assert.match(HINTS['キャ'],/small ャ/);
  assert.match(HINTS['キャ'],/kya/);
  assert.match(HINTS['ファ'],/small ァ/);
  assert.match(HINTS['ファ'],/fa/);
  assert.match(HINTS['ヴ'],/v sound/);
});
test('ー and ッ explain what they do',()=>{
  assert.match(HINTS['ー'],/カー is kaa/);
  assert.match(HINTS['ッ'],/カッタ is katta/);
});
