// The deck: every katakana row, its entries and romaji, and which ones look alike.
// An entry is usually one kana, but combinations and foreign sounds are two (キャ, ファ).
// Pure data, no screen or storage code, so any other module (and the tests) can import it.

// sec: which part of the chart the row sits in. base: the row this one adds marks to (for look-alikes).
export const ROWS=[
  {id:'a',sec:'basic',k:['ア','イ','ウ','エ','オ'],r:['a','i','u','e','o']},
  {id:'k',sec:'basic',k:['カ','キ','ク','ケ','コ'],r:['ka','ki','ku','ke','ko']},
  {id:'s',sec:'basic',k:['サ','シ','ス','セ','ソ'],r:['sa','shi','su','se','so']},
  {id:'t',sec:'basic',k:['タ','チ','ツ','テ','ト'],r:['ta','chi','tsu','te','to']},
  {id:'n',sec:'basic',k:['ナ','ニ','ヌ','ネ','ノ'],r:['na','ni','nu','ne','no']},
  {id:'h',sec:'basic',k:['ハ','ヒ','フ','ヘ','ホ'],r:['ha','hi','fu','he','ho']},
  {id:'m',sec:'basic',k:['マ','ミ','ム','メ','モ'],r:['ma','mi','mu','me','mo']},
  {id:'y',sec:'basic',k:['ヤ','ユ','ヨ'],r:['ya','yu','yo']},
  {id:'r',sec:'basic',k:['ラ','リ','ル','レ','ロ'],r:['ra','ri','ru','re','ro']},
  {id:'w',sec:'basic',k:['ワ','ヲ','ン'],r:['wa','wo (o)','n']},
  {id:'g',sec:'dakuten',k:['ガ','ギ','グ','ゲ','ゴ'],r:['ga','gi','gu','ge','go'],base:'k'},
  {id:'z',sec:'dakuten',k:['ザ','ジ','ズ','ゼ','ゾ'],r:['za','ji','zu','ze','zo'],base:'s'},
  {id:'d',sec:'dakuten',k:['ダ','ヂ','ヅ','デ','ド'],r:['da','ji (di)','zu (du)','de','do'],base:'t'},
  {id:'b',sec:'dakuten',k:['バ','ビ','ブ','ベ','ボ'],r:['ba','bi','bu','be','bo'],base:'h'},
  {id:'p',sec:'dakuten',k:['パ','ピ','プ','ペ','ポ'],r:['pa','pi','pu','pe','po'],base:'h'},
  {id:'ky',sec:'combo',k:['キャ','キュ','キョ'],r:['kya','kyu','kyo']},
  {id:'sh',sec:'combo',k:['シャ','シュ','ショ'],r:['sha','shu','sho']},
  {id:'ch',sec:'combo',k:['チャ','チュ','チョ'],r:['cha','chu','cho']},
  {id:'ny',sec:'combo',k:['ニャ','ニュ','ニョ'],r:['nya','nyu','nyo']},
  {id:'hy',sec:'combo',k:['ヒャ','ヒュ','ヒョ'],r:['hya','hyu','hyo']},
  {id:'my',sec:'combo',k:['ミャ','ミュ','ミョ'],r:['mya','myu','myo']},
  {id:'ry',sec:'combo',k:['リャ','リュ','リョ'],r:['rya','ryu','ryo']},
  {id:'gy',sec:'combo',k:['ギャ','ギュ','ギョ'],r:['gya','gyu','gyo'],base:'ky'},
  {id:'j',sec:'combo',k:['ジャ','ジュ','ジョ'],r:['ja','ju','jo'],base:'sh'},
  {id:'by',sec:'combo',k:['ビャ','ビュ','ビョ'],r:['bya','byu','byo'],base:'hy'},
  {id:'py',sec:'combo',k:['ピャ','ピュ','ピョ'],r:['pya','pyu','pyo'],base:'hy'},
  {id:'fs',sec:'foreign',k:['シェ','ジェ','チェ'],r:['she','je','che']},
  {id:'ft',sec:'foreign',k:['ティ','ディ','トゥ','ドゥ'],r:['ti','di','tu','du']},
  {id:'ff',sec:'foreign',k:['ファ','フィ','フェ','フォ'],r:['fa','fi','fe','fo']},
  {id:'fw',sec:'foreign',k:['ウィ','ウェ','ウォ'],r:['wi','we','wo']},
  {id:'fv',sec:'foreign',k:['ヴァ','ヴィ','ヴ','ヴェ','ヴォ'],r:['va','vi','vu','ve','vo']},
  {id:'x',sec:'marks',k:['ー','ッ'],r:['long vowel','small tsu']},
];
export const ROWMAP=Object.fromEntries(ROWS.map(r=>[r.id,r]));

// Entries that sound the same as another, so they're never offered together as answers
const SOUND={'ヲ':'o','ウォ':'o','ヂ':'ji','ディ':'ji','ヅ':'zu','ドゥ':'zu','ー':'ー','ッ':'ッ'};
// Voice clip names (audio/<name>.mp3) that aren't just the romaji. ー and ッ have no sound of their own.
const CLIP={'ヲ':'wo','ヂ':'di','ヅ':'du','ディ':'dhi','ドゥ':'dwu','ウォ':'who','ー':null,'ッ':null};

// One entry per kana: k = the kana (one or two characters), r = romaji shown, s = the sound
// (used to avoid offering two that sound the same), a = the voice clip's name
export const KANA=[];
ROWS.forEach(row=>row.k.forEach((k,i)=>{const r=row.r[i];
  KANA.push({k,r,s:SOUND[k]||r.split(' ')[0],a:k in CLIP?CLIP[k]:r.split(' ')[0],row:row.id,i});}));
export const BY=Object.fromEntries(KANA.map(x=>[x.k,x]));

// Each entry has three cards: read it, pick it from romaji (or from its sound), and write it
export const TYPES=['read','recall','write'];

// Made-up pairs for ー and ッ, which have no sound on their own: hear or see one, and tell which it was.
// rl/rs = romaji of the long and short words, al/as = their voice clips.
const pair=(long,short,rl,rs,as)=>({long,short,rl,rs,al:'pair-'+rl,as:as||'pair-'+rs});
export const PAIRS={
  'ー':[['カー','カ','kaa','ka'],['キー','キ','kii','ki'],['スー','ス','suu','su'],['テー','テ','tee','te'],['ノー','ノ','noo','no'],
        ['マー','マ','maa','ma'],['ミー','ミ','mii','mi'],['ルー','ル','ruu','ru'],['ソー','ソ','soo','so'],['ホー','ホ','hoo','ho']]
       .map(([l,s,rl,rs])=>pair(l,s,rl,rs,rs)), // the short half is just the kana, so it uses the kana's own clip
  'ッ':[['カッタ','カタ','katta','kata'],['キッテ','キテ','kitte','kite'],['サッカ','サカ','sakka','saka'],['ネッコ','ネコ','nekko','neko'],
        ['モット','モト','motto','moto'],['ナッツ','ナツ','nattsu','natsu'],['ロッテ','ロテ','rotte','rote'],['ミッツ','ミツ','mittsu','mitsu'],
        ['マッチ','マチ','matchi','machi'],['ヤッテ','ヤテ','yatte','yate']]
       .map(([l,s,rl,rs])=>pair(l,s,rl,rs)),
};

// Entries that are easily confused with each other, used to pick convincing wrong answers
const CONF=[['シ','ツ'],['ソ','ン','リ'],['ク','タ','ケ'],['ワ','ウ','フ'],['フ','ヲ','ラ'],['チ','テ'],['コ','ユ','ロ','ヨ'],['マ','ム'],
  ['ヌ','ス','フ'],['ル','レ'],['ノ','メ'],['エ','ユ','コ'],['ナ','メ'],['セ','ヒ'],['ッ','ツ']];
export const CONFMAP={};
const link=(a,b)=>{if(a===b)return;(CONFMAP[a]=CONFMAP[a]||new Set()).add(b);(CONFMAP[b]=CONFMAP[b]||new Set()).add(a);};
CONF.forEach(c=>c.forEach(a=>c.forEach(b=>link(a,b))));
// Rows that add marks look like the row they're built on, entry by entry
ROWS.filter(r=>r.base).forEach(r=>r.k.forEach((k,i)=>link(k,ROWMAP[r.base].k[i])));
ROWMAP.b.k.forEach((k,i)=>link(k,ROWMAP.p.k[i]));
ROWMAP.by.k.forEach((k,i)=>link(k,ROWMAP.py.k[i]));
// Combinations and foreign sounds look like the others in their row, and like their first kana
ROWS.filter(r=>r.sec==='combo'||r.sec==='foreign').forEach(r=>r.k.forEach(a=>{
  r.k.forEach(b=>link(a,b));
  if(BY[a[0]])link(a,a[0]);
}));

// Two entries the learner mixed up, as one key (the same whichever way round), and back again.
// null unless both are real entries (on a ー/ッ card the other word is '~', which isn't one).
export const mixKey=(a,b)=>BY[a]&&BY[b]?[a,b].sort().join('|'):null;
export const mixParts=key=>key.split('|');

/** For ー or ッ: one of its pairs at random, and which word of it to show or play (word, romaji, clip).
 *  null for anything else. rand is there so the tests can choose. */
export function pickPair(k,rand=Math.random){
  const list=PAIRS[k];if(!list)return null;
  const p=list[Math.min(list.length-1,Math.floor(rand()*list.length))],showLong=rand()<0.5;
  return {...p,showLong,word:showLong?p.long:p.short,romaji:showLong?p.rl:p.rs,clip:showLong?p.al:p.as};
}

/** Whether entry k has a sound of its own (ー and ッ don't: they only change the sounds around them). */
export const hasSound=k=>!!(BY[k]&&BY[k].a);

/** Card ids in a saved progress object that aren't in this deck, such as a Hiragana drill backup's. */
export const unknownCards=state=>Object.keys((state&&state.cards)||{}).filter(id=>!BY[id.split('|')[0]]);
