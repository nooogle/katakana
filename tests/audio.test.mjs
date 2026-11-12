// Every voice clip the app asks for must be in audio/. The clips for the foreign sounds and the made-up
// ー/ッ pairs are made by tools/make_voice.py (it needs Jon's Google key), so until then that check is a
// "todo": it reports what's missing without failing the run. Remove the todo once they're in.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {KANA,PAIRS} from '../js/deck.js';
import {CLIPS,NEW_CLIPS} from '../tools/clips.mjs';

const has=n=>existsSync(new URL(`../audio/${n}.mp3`,import.meta.url));
test('the clip list covers every entry and every pair word',()=>{
  for(const x of KANA)if(x.a)assert.ok(CLIPS[x.a],x.k);
  for(const p of [...PAIRS['ー'],...PAIRS['ッ']]){assert.equal(CLIPS[p.al],p.long);assert.ok(CLIPS[p.as],p.short);}
});
test('the clips carried over from the Hiragana drill are all here',()=>{
  assert.deepEqual(Object.keys(CLIPS).filter(n=>!NEW_CLIPS.includes(n)&&!has(n)),[]);
});
test('the new clips are all here',{todo:'run tools/make_voice.py'},()=>{
  assert.deepEqual(NEW_CLIPS.filter(n=>!has(n)),[]);
});
