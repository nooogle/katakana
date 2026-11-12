// Both apps share one storage space on nooogle.github.io, so nothing here may use the Hiragana drill's
// storage key or cache names, and the service worker must only ever clean up katakana caches.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,extname} from 'node:path';

const ROOT=new URL('..',import.meta.url).pathname;
const SKIP=new Set(['vendor','tests','.git','.superpowers','docs','audio','icons']);
function files(dir){
  return readdirSync(dir).flatMap(n=>{
    const p=join(dir,n);
    if(statSync(p).isDirectory())return SKIP.has(n)?[]:files(p);
    return ['.js','.html','.webmanifest','.py'].includes(extname(n))?[p]:[];
  });
}
const read=p=>readFileSync(join(ROOT,p),'utf8');

test('no file uses the Hiragana drill storage key or cache names',()=>{
  const bad=files(ROOT).filter(p=>/hiragana-drill-v1|'hiragana-'|hiragana-preview-/.test(readFileSync(p,'utf8')));
  assert.deepEqual(bad.map(p=>p.slice(ROOT.length)),[]);
});
test('progress is saved under katakana-drill-v1',()=>{
  assert.match(read('js/storage.js'),/'katakana-drill-v1'/);
});
test('the offline cache is named katakana-',()=>{
  const sw=read('sw.js');
  assert.match(sw,/'katakana-preview-'/);
  assert.match(sw,/'katakana-'/);
});
