// Every voice clip the app uses: clip name (audio/<name>.mp3) → the katakana to say.
// Built from the deck, so the list never drifts from it. tools/make_voice.py runs this to get the list:
//   node tools/clips.mjs        prints the whole table as JSON
import {KANA,ROWMAP,PAIRS} from '../js/deck.js';

export const CLIPS={};
for(const x of KANA)if(x.a)CLIPS[x.a]=x.k;
for(const p of [...PAIRS['ー'],...PAIRS['ッ']]){CLIPS[p.al]=p.long;CLIPS[p.as]=p.short;}

// The clips made for this app. The rest (basic kana, dakuten and combinations) came from the Hiragana drill,
// since katakana sounds exactly the same.
export const NEW_CLIPS=Object.keys(CLIPS).filter(n=>n.startsWith('pair-')||ROWMAP[KANA.find(x=>x.a===n)?.row]?.sec==='foreign');

if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify({clips:CLIPS,new:NEW_CLIPS}));
