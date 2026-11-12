import {test} from 'node:test';
import assert from 'node:assert/strict';
import {KANA} from '../js/deck.js';
import {STROKES,strokeCount,strokesSVG,stepSVG} from '../js/strokes.js';

test('every character in the deck has stroke data',()=>{
  const missing=[...new Set(KANA.flatMap(x=>[...x.k]))].filter(ch=>!(STROKES[ch]&&STROKES[ch].s.length>=1&&STROKES[ch].s.length===STROKES[ch].n.length));
  assert.deepEqual(missing,[]);
});
test('stroke counts add up across both characters',()=>{
  assert.equal(strokeCount('キ'),3);
  assert.equal(strokeCount('キャ'),strokeCount('キ')+strokeCount('ャ'));
});
test('a two-character entry draws one picture per character, numbered straight through',()=>{
  const svg=strokesSVG('キャ');
  assert.equal((svg.match(/<svg/g)||[]).length,2);
  assert.match(svg,/>4<\/text>/); // ャ's first stroke is number 4
  const step=stepSVG('キャ',4,true);
  assert.equal((step.match(/class="now"/g)||[]).length,2); // stroke 4 and its number, in the second picture
});
test('a missing character gives no strokes rather than crashing',()=>{
  assert.equal(strokeCount('Q'),0);
});
