# Katakana drill: design

Date: 2026-11-12. Status: draft for Jon to approve.

## What it is, and why

The Katakana drill is a sibling of the Hiragana drill (this repo, <https://nooogle.github.io/hiragana/>). It has the same look, the same flow, the same card types and the same spaced repetition, but it teaches katakana.

Learners usually do hiragana first and start katakana once hiragana is fairly solid. By then, hiragana reviews have spread out to every few days or weeks. So two separate apps, each with its own small daily review pile, suit the way people actually learn. They also keep the Hiragana drill, which already has users, completely untouched.

## Decisions Jon made

- **Separate repo and site.** It goes in a new repo, `nooogle/katakana`, published by GitHub Pages at <https://nooogle.github.io/katakana/>, and linked from the home page in the `nooogle.github.io` repo.
- **It should feel like a sibling.** Same design, same navy colour scheme, same icon style with ア in place of あ.
- **Built from a copy of the hiragana code.** Bug fixes and features will be synced between the two by hand, when it's worth it. Keeping them perfectly in step isn't a goal.
- **It includes the extras, and it doesn't launch without them.** That means the combinations (キャ…), the foreign sounds (ティ, ファ…), the long vowel mark ー and small ッ. The Hiragana drill will get its own extras later ([issue #1](https://github.com/nooogle/hiragana/issues/1)). Build the shared pieces, such as two-character writing cards, so they can be copied across.
- **No real words.** ー and ッ are taught with made-up pairs (カー / カ, カッタ / カタ), not loanwords. Real words may come later, as a separate app.
- **Hints:** Claude drafts them all now (see the appendix), and Jon refines them later.

## Goals

- Someone who has used the Hiragana drill feels at home straight away.
- It covers everything a beginner needs to read katakana: the basic kana, dakuten, combinations, common foreign sounds, ー and ッ.
- It works offline and installs as an app on a phone, just like the Hiragana drill.

## Non-goals

- Real words, meanings or vocabulary.
- Hiragana, or mixing hiragana and katakana in one app.
- Shared code between the two repos. Copying is fine.
- Rare sounds beyond the list below (イェ, ツァ, デュ and so on).

## Anti-goals: it fails if…

- it clashes with the Hiragana drill: the same `localStorage` key, the same cache names, or the service worker of one app touching the other's caches. Both apps share one storage space on nooogle.github.io.
- a hiragana user notices anything change in the Hiragana drill.
- the static stroke pictures and the stroke animation stop looking identical. Both come from the same KanjiVG data, as they do now.
- it feels like a different app: a different tone, layout or flow.

## Constraints (carried over from the Hiragana drill's CLAUDE.md and README)

- Plain HTML, CSS and ES modules. No build step and no npm. Third-party code is pinned in `vendor/` with its licence.
- Works well on a phone first, with light and dark mode (colours as CSS variables on `:root`).
- Every storage key and cache name is namespaced `katakana-...`.
- Docs are written in plain, friendly English.
- When files or voice clips change, rerun `tools/make_sw.py` with a new version name.
- Copy `CLAUDE.md`, `README.md` and `preview/README.md` into the new repo, and adapt them.

## The deck

Rows, in the order they appear on the chart:

| Section | Rows |
|---|---|
| Basic | ア, カ, サ, タ, ナ, ハ, マ, ヤ, ラ, ワ (ワ ヲ ン), the same as hiragana |
| Dakuten | ガ, ザ, ダ (with ヂ, ヅ), バ, パ, the same as hiragana |
| Combinations | キャ キュ キョ, シャ…, チャ…, ニャ…, ヒャ…, ミャ…, リャ…, ギャ…, ジャ…, ビャ…, ピャ… (33, the same set as `generate.py`) |
| Foreign sounds | シェ ジェ チェ / ティ ディ トゥ ドゥ / ファ フィ フェ フォ / ウィ ウェ ウォ / ヴァ ヴィ ヴ ヴェ ヴォ (19) |
| Long and double | ー and ッ |

- ヲ stays in, to mirror hiragana. Its hint says it's very rare in katakana.
- The small vowels (ァ ィ ゥ ェ ォ) and small ャ ュ ョ aren't cards of their own. They're taught inside the combinations and foreign sounds.
- Romaji shown for the foreign sounds: she, je, che, ti, di, tu, du, fa, fi, fe, fo, wi, we, wo, va, vi, vu, ve, vo. ヲ shows "wo (o)" so it can't be mistaken for ウォ, and ヂ and ヅ keep "ji (di)" and "zu (du)" as in hiragana. These three pairs are never offered together as answers: ヲ/ウォ, ヂ/ディ and ヅ/ドゥ. Set the sound key `s` on each entry so the existing "same sound" rule handles it. *Claude's call.*
- Romaji for long vowels is written doubled (`kaa`, `kii`), as in Genki. *Claude's call.*

### How each kind behaves

- **Single kana, combinations and foreign sounds** work exactly like hiragana kana today: read, recall (pick from romaji or from the sound) and write, unlocking in the same way.
- **Writing a combination or foreign sound** means drawing two characters, with the second one small, in two boxes. The stroke animation and step pictures show both. Build this so it can be copied to the Hiragana drill for issue #1.
- **ー and ッ** have no sound on their own, so they get their own kind of card based on fixed made-up pairs:
  - Listening: you hear one of a pair (カー or カ) and pick which one it was.
  - Reading: you see one (カッタ) and pick its romaji (`katta` or `kata`).
  - Writing: draw ー or ッ on its own, as a normal writing card.
  - **How they're scheduled:** ー and ッ are ordinary deck entries, each with the same three card ids as a kana (`ー|read`, `ー|recall`, `ー|write`). So the scheduler, unlocking, chart and report work unchanged. "Recall" becomes the listening-pair card, and "read" becomes the two-option romaji card. Each review picks one of the mark's pairs at random. The intro card shows the mark, one pair, and buttons to hear both halves. Two-option answers are graded like any other. *Claude's call.*
  - Use about 10 pairs for each, built only from basic kana. Suggested pairs:
    - ー: カー/カ, キー/キ, スー/ス, テー/テ, ノー/ノ, マー/マ, ミー/ミ, ルー/ル, ソー/ソ, ホー/ホ
    - ッ: カッタ/カタ, キッテ/キテ, サッカ/サカ, ネッコ/ネコ, モット/モト, ハッパ/ハパ, ロッテ/ロテ, ピッタ/ピタ, マッチ/マチ, ヤッテ/ヤテ

    *Claude's call; refine freely.*

### Look-alikes (for convincing wrong answers)

Start with these groups: シツ, ソンリ, クタケ, ワウフ, フヲラ, チテ, コユロヨ, マム, ヌスフ, ルレ, ノメ, エユコ, ナメ, セヒ. Then add these:

- each dakuten kana paired with its base kana
- バ/パ rows paired with each other
- each combination paired with its big-kana lookalike (キャ / キヤ, ファ / フア)
- ッ paired with ツ
- the combinations paired within their row (シャ / シュ / ショ)

*Claude's call.*

## Voice clips

- **Reuse all 104 existing clips** from `hiragana/audio/`, covering the basic kana, dakuten and all 33 combinations. Katakana sounds exactly the same.
- **New clips are needed** for the 19 foreign sounds and the made-up pairs: about 40 to 45 clips.
- Copy `/Users/jon/hiragana-tts/generate.py` into `tools/make_voice.py` in the new repo, and extend its table with the new sounds. Send katakana text to Google: it reads the foreign sounds more naturally, and it's the same trick `sound.js` already uses for phone speech. Then trim, level and check the clips as `how-the-voice-was-made.html` describes.
- **File name clashes:** clips are named by romaji, and `di`, `du` and `wo` are already ヂ, ヅ and ヲ. Give ディ, ドゥ and ウォ different names, such as `dhi`, `dwu` and `who`. The pairs could be named by their romaji with a prefix, such as `pair-kaa`. *Builder's call.*
- Jon runs the script, because it needs his Google API key in `GOOGLE_API_KEY`. The key is never committed.
- **The new clips are required before launch.** Phone speech can't reliably make カー and カ sound different. During the build, missing clips fall back to phone speech as they do today, so work isn't blocked. *Claude's call.*

## Stroke data and fonts

- Rerun `tools/make_strokes.py` on the katakana deck, writing `vendor/kanjivg-katakana.js`.
- **Check first** that KanjiVG has every character needed: the small kana ァィゥェォャュョッ, ヴ and ー. If any are missing, draw a simple path by hand in the same 109 × 109 box, and note it in the file.
- Change the character range in `tools/make_fonts.py` to katakana (U+30A0 to U+30FF, which includes ー). Keep whatever hiragana appears in the page text.

## Things to rename or redo

- Text: titles, `manifest.webmanifest`, the welcome slides, home ("Basic katakana"), session prompts ("Which katakana is this?"), report and share text, the feedback email subject, `how-it-works.html` and `how-the-voice-was-made.html`. Explain the new card kinds in the how-it-works page.
- Storage key: `katakana-drill-v1`. Cache prefix: `katakana-` in `sw.js`, `tools/make_sw.py` and the version lookup in `sheets.js`.
- Hiragana-only code: the ぢ/づ special cases in `sound.js` and `hints.js`, the unlock clip `AUDIO_FILE('あ')`, the test-voice button (`は へ を ん`), and the voice preview `speak('あ')`.
- Icons: the same navy square, dashed guide lines and white character, with ア. Regenerate every size in `icons/`, including the maskable one and the favicons.
- Leave out the stray tracked file `'$S'/shots/nocheck-4done.png` (an accident in the hiragana repo), and the hiragana `preview/` contents.
- The `nooogle.github.io` home page: add a Katakana drill entry next to the Hiragana one.

## Left to the builder

- How to arrange the new sections on the chart, and when they unlock, as long as they follow the hiragana pattern: greyed out until the learner adds them.
- The layout of the two-box writing card.
- File naming for the new clips, and the exact made-up pairs.
- **Where it's built (Jon's decision):** create the public `nooogle/katakana` repo and turn on Pages from day one, so it can be tried on a phone. Don't add the link on the nooogle home page until launch, which is once the extras and their voice clips are in.

## Appendix: draft hints (to refine later)

These are written in the same tone as the hiragana ones. Shapes need checking by eye against the real characters.

| Kana | Hint |
|---|---|
| ア | An axe: the top bar hooks down into the blade, and the long curve is the handle. "Ah!" as you swing it. |
| イ | A short slanting line leaning on a tall post, like an easel. Easel, "i". |
| ウ | Like hiragana う with a roof: a little dot on top, then a roof that hooks down on the right. |
| エ | A steel girder standing up: a short top, a post and a long bottom. Engineer, "e". |
| オ | Someone throwing one arm out and shouting "Oh!": a cross with a slanting stroke off the post. |
| カ | Hiragana か without its extra flick. A karate chop. |
| キ | Hiragana き without the curve at the bottom: a key with two teeth. |
| ク | A cook's hat seen from the side, a short stroke with a roof hooking down. タ is the same with an extra line inside. |
| ケ | A capital K tipping over sideways: "ke". |
| コ | Hiragana こ with its two lines joined on the right into a corner: a "ko"rner. |
| サ | A saw: a crossbar with two legs, the right one curving away. |
| シ | Two drops on the left and a long stroke that sweeps UP, like someone smiling at the sky. ツ's marks sit along the top and its stroke sweeps DOWN. |
| ス | Someone going down a slide, with one leg kicked out. ヌ has an extra stroke crossing the middle. |
| セ | Like hiragana せ without its left post: a crossbar with a hook, and a long tail along the bottom. |
| ソ | A short tick and a longer stroke, both coming DOWN from the top. In ン the long stroke sweeps UP from the bottom. |
| タ | ク with an extra little line inside it. |
| チ | A slanted top, a crossbar and a post that hooks left: a little cheerleader. テ has two flat lines on top. |
| ツ | Two marks side by side along the top, and a long stroke crashing down like a tsunami wave. |
| テ | Two flat lines and a stroke swinging down: a telephone pole. チ's top line slants. |
| ト | A post with a little tick sticking out: a toe with a splinter. |
| ナ | A cross whose leg bends left, like the top of hiragana な: a knife stuck in a cross. |
| ニ | Two lines, just like the right side of hiragana に. |
| ヌ | ス with a stroke crossing it: noodles caught on a chopstick. |
| ネ | A little tree on a hill: a dot on top, a crossbar, a trunk and one branch. ホ has two branches and no dot. |
| ノ | One single sweep, top right to bottom left: "No!" |
| ハ | Two strokes spreading apart, like a big laugh: "ha ha". |
| ヒ | A heel: a short bar and a line that runs down and along the bottom. |
| フ | Just the top of hiragana ふ: Mount Fuji's hook. |
| ヘ | Exactly the same as hiragana へ: a small hill. |
| ホ | A cross with two little legs kicking out: "ho ho". Like the right half of hiragana ほ. |
| マ | A bar hooking down, with a little stroke inside: an upside-down triangle, like a mum's apron. ム points the other way. |
| ミ | Three lines slanting down: me, me, me. |
| ム | A pointed cow's nose with one bump: "moo". |
| メ | Two strokes crossing, like an X marking a mistake: "meh". |
| モ | Hiragana も made with straight lines: two bars and a hook. |
| ヤ | Hiragana や without the dot: a yak's horn. |
| ユ | A sofa seen from the side: you sit on it. The bottom line sticks out, unlike コ. |
| ヨ | A backwards E with three bars: "yo!" |
| ラ | フ with a lid on top: "ra". |
| リ | Just like hiragana り: two reeds by a river. |
| ル | Two roots, the right one hooking up at the end: "roots". |
| レ | One stroke down that swoops up at the end, like the right half of ル: a leg kicking. |
| ロ | A square box: a "ro"om. |
| ワ | A short post and a roof hooking down: "wa". ウ has a dot on top and ク starts with a slant. |
| ヲ | フ with an extra line through it. It sounds just like オ, and you'll hardly ever see it in katakana. |
| ン | A dot and a stroke sweeping UP from the bottom left, like a sneer: "n". ソ's long stroke comes DOWN from the top. |

Generated hints, built by rule in the same way `hints.js` builds the dakuten ones:

- **Dakuten:** "カ with two little marks, so ka becomes ga." ヂ and ヅ reuse the hiragana wording ("sounds just like ジ, and you won't see it very often").
- **Combinations:** "キ followed by a small ャ: say them together as one quick sound, kya."
- **Foreign sounds:** "フ followed by a small ァ: the small vowel replaces フ's own u, so you get fa. Used for sounds Japanese doesn't have, in foreign words." ヴ: "ウ with two little marks: a v sound."
- **ー:** "A straight line: hold the sound before it for twice as long. カー is kaa."
- **ッ:** "A small ツ: a tiny pause that doubles the next sound. カッタ is katta, not kata."
