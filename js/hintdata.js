// The suggested memory hints, as plain data (so the tests can check every entry has one).
// The basic kana have their own; everything else gets a hint built from the kana it's made of.
// These are first drafts: check the shapes by eye against the real characters.

import {ROWS,ROWMAP,BY} from './deck.js';

export const HINTS={
'ア':'An axe: the top bar hooks down into the blade, and the long curve is the handle. "Ah!" as you swing it.',
'イ':'A short slanting line leaning on a tall post, like an easel. Easel, "i".',
'ウ':'Like hiragana う with a roof: a little dot on top, then a roof that hooks down on the right.',
'エ':'A steel girder standing up: a short top, a post and a long bottom. Engineer, "e".',
'オ':'Someone throwing one arm out and shouting "Oh!": a cross with a slanting stroke off the post.',
'カ':'Hiragana か without its extra flick. A karate chop.',
'キ':'Hiragana き without the curve at the bottom: a key with two teeth.',
'ク':'A cook\'s hat seen from the side, a short stroke with a roof hooking down. タ is the same with an extra line inside.',
'ケ':'A capital K tipping over sideways: "ke".',
'コ':'Hiragana こ with its two lines joined on the right into a corner: a "ko"rner.',
'サ':'A saw: a crossbar with two legs, the right one curving away.',
'シ':'Two drops on the left and a long stroke that sweeps UP, like someone smiling at the sky. ツ\'s marks sit along the top and its stroke sweeps DOWN.',
'ス':'Someone going down a slide, with one leg kicked out. ヌ has an extra stroke crossing the middle.',
'セ':'Like hiragana せ without its left post: a crossbar with a hook, and a long tail along the bottom.',
'ソ':'A short tick and a longer stroke, both coming DOWN from the top. In ン the long stroke sweeps UP from the bottom.',
'タ':'ク with an extra little line inside it.',
'チ':'A slanted top, a crossbar and a post that hooks left: a little cheerleader. テ has two flat lines on top.',
'ツ':'Two marks side by side along the top, and a long stroke crashing down like a tsunami wave.',
'テ':'Two flat lines and a stroke swinging down: a telephone pole. チ\'s top line slants.',
'ト':'A post with a little tick sticking out: a toe with a splinter.',
'ナ':'A cross whose leg bends left, like the top of hiragana な: a knife stuck in a cross.',
'ニ':'Two lines, just like the right side of hiragana に.',
'ヌ':'ス with a stroke crossing it: noodles caught on a chopstick.',
'ネ':'A little tree on a hill: a dot on top, a crossbar, a trunk and one branch. ホ has two branches and no dot.',
'ノ':'One single sweep, top right to bottom left: "No!"',
'ハ':'Two strokes spreading apart, like a big laugh: "ha ha".',
'ヒ':'A heel: a short bar and a line that runs down and along the bottom.',
'フ':'Just the top of hiragana ふ: Mount Fuji\'s hook.',
'ヘ':'Exactly the same as hiragana へ: a small hill.',
'ホ':'A cross with two little legs kicking out: "ho ho". Like the right half of hiragana ほ.',
'マ':'A bar hooking down, with a little stroke inside: an upside-down triangle, like a mum\'s apron. ム points the other way.',
'ミ':'Three lines slanting down: me, me, me.',
'ム':'A pointed cow\'s nose with one bump: "moo".',
'メ':'Two strokes crossing, like an X marking a mistake: "meh".',
'モ':'Hiragana も made with straight lines: two bars and a hook.',
'ヤ':'Hiragana や without the dot: a yak\'s horn.',
'ユ':'A sofa seen from the side: you sit on it. The bottom line sticks out, unlike コ.',
'ヨ':'A backwards E with three bars: "yo!"',
'ラ':'フ with a lid on top: "ra".',
'リ':'Just like hiragana り: two reeds by a river.',
'ル':'Two roots, the right one hooking up at the end: "roots".',
'レ':'One stroke down that swoops up at the end, like the right half of ル: a leg kicking.',
'ロ':'A square box: a "ro"om.',
'ワ':'A short post and a roof hooking down: "wa". ウ has a dot on top and ク starts with a slant.',
'ヲ':'フ with an extra line through it. It sounds just like オ, and you\'ll hardly ever see it in katakana.',
'ン':'A dot and a stroke sweeping UP from the bottom left, like a sneer: "n". ソ\'s long stroke comes DOWN from the top.',
'ヴ':'ウ with two little marks: a v sound, used in foreign words.',
'ー':'A straight line: hold the sound before it for twice as long. カー is kaa.',
'ッ':'A small ツ: a tiny pause that doubles the next sound. カッタ is katta, not kata.',
};

// Dakuten (two little marks) and handakuten (little circle): the base kana and how its sound changes
ROWS.filter(r=>r.sec==='dakuten').forEach(r=>r.k.forEach((k,i)=>{
  const b=ROWMAP[r.base].k[i],circle=r.id==='p';
  HINTS[k]=k==='ヂ'?'チ with two little marks. It sounds just like ジ, and you won\'t see it very often.'
    :k==='ヅ'?'ツ with two little marks. It sounds just like ズ, and you won\'t see it very often.'
    :`${b} with ${circle?'a little circle':'two little marks'}, so ${BY[b].r} becomes ${BY[k].s}.`;
}));

// Combinations: a kana and a small ャ, ュ or ョ, said as one sound
ROWS.filter(r=>r.sec==='combo').forEach(r=>r.k.forEach((k,i)=>{
  HINTS[k]=`${k[0]} followed by a small ${k[1]}: say them together as one quick sound, ${r.r[i]}.`;
}));

// Foreign sounds: the small vowel takes the place of the first kana's own vowel
ROWS.filter(r=>r.sec==='foreign').forEach(r=>r.k.forEach((k,i)=>{
  if(HINTS[k])return; // ヴ has its own
  const first=BY[k[0]].r;
  HINTS[k]=`${k[0]} followed by a small ${k[1]}: the small vowel replaces ${k[0]}'s own ${first.slice(-1)}, so you get ${r.r[i]}. Used for sounds Japanese doesn't have, in foreign words.`;
}));
