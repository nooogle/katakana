import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ROWS,KANA,BY,CONFMAP,PAIRS} from '../js/deck.js';

test('the deck has every entry: 46 basic, 25 dakuten, 33 combinations, 19 foreign sounds, ー and ッ',()=>{
  assert.equal(KANA.length,46+25+33+19+2);
});
test('two-character entries are single entries with their own romaji',()=>{
  assert.equal(BY['キャ'].r,'kya');
  assert.equal(BY['ファ'].r,'fa');
  assert.equal(BY['ティ'].r,'ti');
  assert.equal(BY['ウォ'].r,'wo');
});
test('ヲ, ヂ and ヅ show their alternative readings',()=>{
  assert.equal(BY['ヲ'].r,'wo (o)');
  assert.equal(BY['ヂ'].r,'ji (di)');
  assert.equal(BY['ヅ'].r,'zu (du)');
});
test('ー and ッ share the marks row',()=>{
  assert.equal(BY['ー'].row,BY['ッ'].row);
  assert.equal(ROWS.find(r=>r.id===BY['ー'].row).sec,'marks');
});
test('same-sounding entries share a sound key, so they are never offered together',()=>{
  for(const [a,b] of [['ヲ','オ'],['ヲ','ウォ'],['ヂ','ジ'],['ヂ','ディ'],['ヅ','ズ'],['ヅ','ドゥ']])
    assert.equal(BY[a].s,BY[b].s,`${a} and ${b}`);
});
test('no two entries with different sounds show the same romaji or use the same clip',()=>{
  for(const x of KANA)for(const y of KANA){
    if(x===y||x.s===y.s)continue;
    assert.notEqual(x.r,y.r,`${x.k} and ${y.k} both show ${x.r}`);
    if(x.a&&y.a)assert.notEqual(x.a,y.a,`${x.k} and ${y.k} both use clip ${x.a}`);
  }
});
test('every entry except ー and ッ has a clip name',()=>{
  assert.deepEqual(KANA.filter(x=>!x.a).map(x=>x.k),['ー','ッ']);
});
test('look-alikes are linked',()=>{
  for(const [a,b] of [['シ','ツ'],['ソ','ン'],['ッ','ツ'],['キャ','キョ'],['ガ','カ'],['バ','パ'],['ファ','フ']])
    assert.ok(CONFMAP[a]&&CONFMAP[a].has(b),`${a} should look like ${b}`);
});
test('ー and ッ each have 10 made-up pairs built only from basic kana',()=>{
  const basic=new Set(ROWS.filter(r=>r.sec==='basic').flatMap(r=>r.k));
  for(const m of ['ー','ッ']){
    assert.equal(PAIRS[m].length,10);
    for(const p of PAIRS[m]){
      assert.ok(p.long.includes(m),p.long);
      assert.equal(p.long.replace(m,''),p.short.replace(m,''));
      for(const ch of p.short)assert.ok(basic.has(ch),`${ch} in ${p.short}`);
      for(const f of ['rl','rs','al','as'])assert.ok(p[f],`${p.long} ${f}`);
      assert.notEqual(p.rl,p.rs);
    }
  }
});
test('every row is an array of entries, and sections come in order',()=>{
  const order=['basic','dakuten','combo','foreign','marks'];
  let last=0;
  for(const r of ROWS){
    assert.ok(Array.isArray(r.k),r.id);
    assert.equal(r.k.length,r.r.length,r.id);
    const i=order.indexOf(r.sec);assert.ok(i>=last,`${r.id} section ${r.sec}`);last=i;
  }
});
test('a mix-up between two-character entries keeps both entries whole',async()=>{
  const {mixKey,mixParts}=await import('../js/deck.js');
  assert.equal(mixKey('キャ','キョ'),mixKey('キョ','キャ'));
  assert.deepEqual(mixParts(mixKey('キョ','キャ')),['キャ','キョ']);
  assert.deepEqual(mixParts(mixKey('シ','ツ')),['シ','ツ']);
});
test('pickPair picks one of the mark’s pairs, and whether the long or short word is shown',async()=>{
  const {pickPair,PAIRS}=await import('../js/deck.js');
  const seq=v=>{let i=0;return ()=>v[i++];};
  const a=pickPair('ー',seq([0,0.2]));
  assert.equal(a.long,PAIRS['ー'][0].long);assert.equal(a.showLong,true);
  const b=pickPair('ッ',seq([0.999,0.7]));
  assert.equal(b.long,PAIRS['ッ'][9].long);assert.equal(b.showLong,false);
  assert.equal(b.word,b.short);assert.equal(b.romaji,b.rs);assert.equal(b.clip,b.as);
  assert.equal(pickPair('カ'),null);
});
test('a mix-up only counts between two real entries (not the other word of a ー/ッ pair)',async()=>{
  const {mixKey}=await import('../js/deck.js');
  assert.equal(mixKey('ー','~'),null);
  assert.equal(mixKey('カ','?'),null);
  assert.ok(mixKey('シ','ツ'));
});
test('ー and ッ have no sound of their own; everything else does',async()=>{
  const {hasSound}=await import('../js/deck.js');
  assert.equal(hasSound('ー'),false);
  assert.equal(hasSound('ッ'),false);
  assert.equal(hasSound('カ'),true);
  assert.equal(hasSound('ファ'),true);
});
test('a backup from another app (or with cards not in this deck) is spotted before it is restored',async()=>{
  const {unknownCards}=await import('../js/deck.js');
  assert.deepEqual(unknownCards({cards:{'あ|read':{},'か|write':{}}}),['あ|read','か|write']);
  assert.deepEqual(unknownCards({cards:{'ア|read':{},'キャ|write':{}}}),[]);
  assert.deepEqual(unknownCards({cards:{}}),[]);
});
