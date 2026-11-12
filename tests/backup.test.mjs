import {test} from 'node:test';
import assert from 'node:assert/strict';
import {backupText,checkBackup} from '../js/backup.js';

const state={v:2,rows:['a'],cards:{'ア|read':{}},log:[],hints:{},settings:{}};

test('a backup is labelled with this app',()=>{
  assert.equal(JSON.parse(backupText(state)).app,'katakana-drill');
});
test('this app’s own backup restores, without the label ending up in the progress',()=>{
  const r=checkBackup(JSON.parse(backupText(state)));
  assert.equal(r.error,undefined);
  assert.deepEqual(r.state,state);
});
test('a backup labelled as the Hiragana drill’s is turned away by name',()=>{
  const r=checkBackup({...state,app:'hiragana-drill'});
  assert.match(r.error,/from the Hiragana drill/);
});
test('an older unlabelled backup still restores if its cards are katakana',()=>{
  assert.equal(checkBackup(state).error,undefined);
});
test('an older unlabelled backup with hiragana cards is turned away',()=>{
  assert.match(checkBackup({...state,cards:{'あ|read':{}}}).error,/another app/);
});
test('something that isn’t a backup at all is turned away',()=>{
  assert.ok(checkBackup({hello:1}).error);
  assert.ok(checkBackup(null).error);
});
