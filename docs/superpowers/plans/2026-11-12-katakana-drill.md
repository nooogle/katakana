# Katakana drill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Katakana drill, a sibling of the Hiragana drill. It covers the basic kana, dakuten, combinations, foreign sounds, ー and ッ, and lives at <https://nooogle.github.io/katakana/>.

**Architecture:** Start from a copy of the Hiragana drill (`/Users/jon/develop/cds/hiragana`) placed in this repo (`/Users/jon/develop/cds/katakana`, already pushed to `nooogle/katakana` with Pages on). Then change it in place:

- Deck entries become strings that may hold two characters (キャ).
- Stroke pictures render one box per character.
- ー and ッ get a pair-based variant of the read and recall cards.
- Everything else (scheduler, queues, storage, screens) stays as it is.

**Tech Stack:** Plain HTML, CSS and ES modules, with no build step and no npm. Pure-data modules are tested with Node's built-in test runner (`node --test`, Node 22 is installed). Python 3 is used for the tools. Screens are checked by hand at `python3 -m http.server 8000`.

**Spec:** `docs/superpowers/specs/2026-11-12-katakana-design.md`. Read it in full before any task. Its appendix holds the draft hints.

## Global Constraints

- No build step and no npm. Third-party code is copied into `vendor/`, pinned, with its licence alongside.
- Phone first, with light and dark mode. Colours are CSS variables on `:root`. Keep the hiragana navy scheme unchanged (`--accent:#27407A`).
- Every storage key and cache name is namespaced `katakana-`. The saved-progress key is `katakana-drill-v1`.
- Docs and on-screen text are plain, friendly English. Keep the hiragana app's tone.
- After adding, renaming or removing a file, or changing a voice clip, rerun `python3 tools/make_sw.py . sw.js <new-version>`.
- Never edit anything in `/Users/jon/develop/cds/hiragana` (read and copy only), except the one home-page link in Task 10, which goes in the `nooogle.github.io` repo.
- Romaji for long vowels is doubled (`kaa`). Foreign sounds show as she, je, che, ti, di, tu, du, fa, fi, fe, fo, wi, we, wo, va, vi, vu, ve, vo. ヲ shows `wo (o)`. ヂ and ヅ show `ji (di)` and `zu (du)`.
- Never commit the Google API key.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Someone who already uses the Hiragana drill opens the Katakana drill.** Both apps must keep their own progress and offline cache, and neither service worker may delete the other's caches. → namespace test in Task 1.
2. **Two-character entries anywhere the code used to split a row string into characters** (`[...row.k]`), such as the chart, placement, row sheet and hint keys. Each must treat キャ as one entry. → deck test in Task 2, plus the chart check in Task 2.
3. **Two answer buttons showing the same romaji, or two answers that sound the same** (ヲ/ウォ, ヂ/ディ, ヅ/ドゥ, オ/ヲ). The learner expects one right answer that's clearly different from the rest. → test in Task 2.
4. **A character with no KanjiVG data** (possibly ー or the small vowels). Writing cards and Practise must still work, falling back to a hand-drawn path, never a blank box or a crash. → test in Task 3.
5. **A narrow phone (360 px wide) showing a two-character writing card.** Both boxes fit side by side, with no sideways scrolling, and drawing in one box doesn't draw in the other. → manual check in Task 4.

---

### Task 1: Copy the app and give it its own name and storage

**Files:**
- Create: everything from the hiragana repo except `.git`, `docs/`, `preview/*` (keep an adapted `preview/README.md`) and the stray `'$S'/` folder.
- Modify: `js/storage.js` (STORE), `sw.js` and `tools/make_sw.py` (PREFIX and the comment), `js/sheets.js:107` (the cache-version regex), and the names in `index.html`, `manifest.webmanifest`, `js/screens/home.js`, `js/screens/session.js`, `js/screens/report.js`, `js/welcome.js`, `js/sheets.js`, `js/app.js`, `css/style.css` (header comment). Also adapt `CLAUDE.md`, `README.md` and `preview/README.md`.
- Test: `tests/namespace.test.mjs`

**Interfaces:**
- Produces: the app running at localhost:8000 with the hiragana deck but katakana names and storage. A `tests/` folder run with `node --test tests/`.

- [ ] **Step 1: Copy the files.** Run `git -C /Users/jon/develop/cds/hiragana archive HEAD | tar -x -C /Users/jon/develop/cds/katakana --exclude='$S' --exclude='docs' --exclude='preview'`. Then copy `preview/README.md` by hand, and keep this repo's own `README.md` content as a starting note.
- [ ] **Step 2: Write the failing test** `tests/namespace.test.mjs`. It reads every `.js`, `.html`, `.webmanifest` and `.py` file outside `vendor/` and `tests/`, and asserts:
  - no file contains `hiragana-drill`, `'hiragana-'` or `hiragana-preview-`
  - `js/storage.js` contains `'katakana-drill-v1'`
  - `sw.js` contains `'katakana-preview-'` and `'katakana-'`
- [ ] **Step 3: Run `node --test tests/`.** Expected: FAIL, listing the hiragana names.
- [ ] **Step 4: Rename the namespaces and visible names.**
  - Change "Hiragana drill" to "Katakana drill", "Hiragana" to "Katakana" and "hiragana" to "katakana" in on-screen text, titles, the manifest (name, short_name, description) and the feedback subject.
  - In the `activate` handler of `sw.js`, the old-cache cleanup must only touch names starting with `katakana-`.
  - Rerun `python3 tools/make_sw.py . sw.js 2026-11-12a`.
  - Leave `how-it-works.html` and `how-the-voice-was-made.html` text for Task 9. Only fix their `<title>` here.
- [ ] **Step 5: Run `node --test tests/`.** Expected: PASS.
- [ ] **Step 6: Check by hand.** Open localhost:8000. The header says "Katakana drill", and in devtools the key `katakana-drill-v1` appears after adding a row.
- [ ] **Step 7: Commit** ("Katakana drill: copy the Hiragana drill and give it its own name and storage") **and push**, so Pages shows it.

### Task 2: The katakana deck, with two-character entries

**Files:**
- Modify: `js/deck.js` (whole file), `js/screens/home.js:13-14,36-37`, `js/sheets.js:21-30`, `js/app.js:52`, `js/hints.js:59` (the dakuten loop only; the hints themselves come in Task 5)
- Test: `tests/deck.test.mjs`

**Interfaces:**
- Produces, from `js/deck.js`:
  - `ROWS`: array of `{id, k: string[], r: string[], base?, sec}`. `k` is now an **array** of entries. `sec` is one of `'basic' | 'dakuten' | 'combo' | 'foreign' | 'marks'`.
  - `ROWMAP`.
  - `KANA`: array of `{k, r, s, a, row, i}`. `a` is the voice clip's base name, used in Task 6.
  - `BY`, `TYPES` (unchanged).
  - `CONFMAP`.
  - `PAIRS`: `{'ー': [{long:'カー', short:'カ', rl:'kaa', rs:'ka', al:'pair-kaa', as:'ka'}, …], 'ッ': [...]}`. `rl` and `rs` are the romaji of the long and short halves; `al` and `as` are their clip names.
- Every caller that did `[...row.k]` now uses `row.k` directly. Every caller that did `row.k[0]` keeps working, because it gets the first entry.

- [ ] **Step 1: Write the failing tests** in `tests/deck.test.mjs`, importing `../js/deck.js`:
  - `KANA.length === 46 + 25 + 33 + 19 + 2` (125).
  - `BY['キャ'].r === 'kya'`, `BY['ファ'].r === 'fa'`, `BY['ヲ'].r === 'wo (o)'`, `BY['ヂ'].r === 'ji (di)'`, `BY['ー'].row === BY['ッ'].row`.
  - The `s` values are equal for ヲ/オ, ヲ/ウォ, ヂ/ジ, ヂ/ディ, ヅ/ズ and ヅ/ドゥ. Without that, the existing `pickOptions` rule could offer them together.
  - Apart from those groups, no two entries share an `r` value, and no two share an `a` value except where `s` is equal.
  - `CONFMAP` links キャ↔キヤ only if キヤ exists, so test キャ↔キョ (same row) and シ↔ツ, ソ↔ン, ッ↔ツ instead.
  - `PAIRS['ー'].length === 10`, `PAIRS['ッ'].length === 10`. Every pair's characters, minus ー and ッ, are basic-row kana.
  - The `sec` values appear in the order basic, dakuten, combo, foreign, marks.
- [ ] **Step 2: Run `node --test tests/`.** Expected: FAIL.
- [ ] **Step 3: Write `js/deck.js`.**
  - Put the rows, romaji, look-alike groups and pairs exactly as listed in the spec's "The deck" section. Set `s` on ヲ, ウォ, ヂ, ディ, ヅ and ドゥ so each same-sounding group shares one `s`.
  - Clip names `a`: reuse the hiragana romaji names (`ka`, `kya`, `di`, `du`, `wo`). New names: `dhi` for ディ, `dwu` for ドゥ, `who` for ウォ, the plain romaji for the other foreign sounds, and `pair-<romaji>` for pair words.
  - ー and ッ each have the row id `'x'`, section `'marks'`, and `r` set to `'long vowel'` and `'small tsu'`.
- [ ] **Step 4: Update the callers** listed under Files to use `row.k` as an array. In `home.js`, render one chart heading per `sec`: "Basic katakana", "With dakuten", "Combinations", "Foreign sounds" and "Long and double". Use the existing `ROWS.filter(r=>!r.base)` pattern, changed to filter on `sec`.
- [ ] **Step 5: Run `node --test tests/`.** Expected: PASS.
- [ ] **Step 6: Check by hand.** All five sections appear on the chart. Adding the キャ row shows キャ キュ キョ as three cells. Placement for that row asks three read cards.
- [ ] **Step 7: Commit.**

### Task 3: Stroke data for every character

**Files:**
- Modify: `tools/make_strokes.py`, `js/strokes.js`
- Create: `vendor/kanjivg-katakana.js` (generated), `vendor/strokes-extra.js` (hand-drawn paths, only if needed)
- Delete: `vendor/kanjivg-hiragana.js`
- Test: `tests/strokes.test.mjs`

**Interfaces:**
- Consumes: `KANA` from Task 2.
- Produces, from `js/strokes.js`:
  - `STROKES` keyed by **single character**.
  - `strokesSVG(k, nums)`, `playStrokes(box, k, nums)`, `strokeCount(k)` and `stepSVG(k, n, num)` all accept a one- or two-character `k`. They render one `<svg>` per character inside a `<span class="multi">` wrapper.
  - Stroke numbers and step `n` count across both characters. For キャ, strokes 1–3 are キ and 4–6 are ャ.
  - `playStrokes` animates the characters in order.

- [ ] **Step 1: Write the failing test** `tests/strokes.test.mjs`. For every character in every `KANA[].k`, `STROKES[ch]` exists, with `s.length === n.length >= 1`. Also, `strokeCount` from a small pure helper (`js/strokecount.js` if `strokes.js` can't be imported in Node because it uses `window`) returns 6 for キャ.
- [ ] **Step 2: Run it.** Expected: FAIL (no katakana data yet).
- [ ] **Step 3: Update `tools/make_strokes.py`.**
  - Read the deck entries with the new array syntax and collect the unique characters.
  - Fetch them from KanjiVG tag `r20260714` and write `vendor/kanjivg-katakana.js`.
  - Print the characters KanjiVG doesn't have instead of exiting.
  - Hand-draw any missing ones (likely ー, and maybe ァィゥェォ) in `vendor/strokes-extra.js`, in the 109 × 109 box. Small kana sit in the lower-left quarter, like KanjiVG's ャ. `strokes.js` merges the extra paths into `STROKES`.
- [ ] **Step 4: Make the `strokes.js` functions multi-character** as described under Interfaces.
- [ ] **Step 5: Run `node --test tests/`.** Expected: PASS.
- [ ] **Step 6: Check by hand.** On a ファ writing card in a session, Check animates フ then ァ. Practise steps through all the strokes across both boxes.
- [ ] **Step 7: Commit.**

### Task 4: Two-box writing cards

**Files:**
- Modify: `js/screens/session.js` (the write branch of `renderCard`, `clearDrawing`, `checkWriting`, `showStrokes`, and the Practise functions that use `.wsq` or `#cv`), `js/drawing.js` (only if needed), `css/style.css` (`.wsq` and `.multi`)

**Interfaces:**
- Consumes: the Task 3 functions.
- Produces: write cards for two-character entries, showing two drawing boxes side by side, each with its own canvas (`#cv0`, `#cv1`). Clear wipes both. The model text and stroke picture fill the boxes character by character.

- [ ] **Step 1: Render one `.wsq` per character** in the write branch and in Practise, each set up with `setupCanvas`. Single-character cards render exactly as they do now.
- [ ] **Step 2: Make Clear, Check and Don't know work across both boxes.** Check shows each character's strokes over its own box.
- [ ] **Step 3: Check by hand** at 360 px wide in devtools, in both light and dark mode:
  - The two boxes fit side by side with no sideways scrolling.
  - Drawing in the left box never marks the right one.
  - キ writing cards look the same as before.
- [ ] **Step 4: Commit.**

### Task 5: Hints

**Files:**
- Create: `js/hintdata.js` (pure data: `export const HINTS`)
- Modify: `js/hints.js` (import `HINTS` from `hintdata.js`, and delete the hiragana table and generator)
- Test: `tests/hints.test.mjs`

**Interfaces:**
- Consumes: `ROWS`, `ROWMAP`, `BY`, `KANA`.
- Produces: `HINTS[k]` for every `KANA[].k`. `hints.js` exports are unchanged.

- [ ] **Step 1: Write the failing test.**
  - Every `KANA[].k` has a non-empty `HINTS[k]`.
  - `HINTS['ア']` starts with "An axe".
  - `HINTS['ガ'] === 'カ with two little marks, so ka becomes ga.'`
  - `HINTS['キャ']` contains "small ャ" and "kya".
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Write `js/hintdata.js`.**
  - Copy the 46 hints word for word from the spec's appendix.
  - Generate the dakuten, combination, foreign-sound, ヴ, ー and ッ hints by the rules in the appendix.
  - ヂ and ヅ use the hiragana wording with ジ and ズ.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 6: Voice clips and the voice tool

**Files:**
- Create: `audio/*.mp3` (copy all 104 from the hiragana repo), `tools/make_voice.py`
- Modify: `js/sound.js` (`AUDIO_FILE` and the unlock clip), `js/sheets.js:68` and `js/app.js:59,116` (the test-voice and preview kana)
- Test: `tests/audio.test.mjs`

**Interfaces:**
- Consumes: `KANA[].a` and `PAIRS` from Task 2.
- Produces:
  - `AUDIO_FILE(k)` returns `'audio/' + BY[k].a + '.mp3'`.
  - `speakWord(text, clip)` in `sound.js` plays `audio/<clip>.mp3`, falling back to phone speech of `text`. Task 7 uses it.

- [ ] **Step 1: Write the test.** It lists every clip name needed (every `KANA[].a` except ー and ッ, plus every pair's `al` and `as`), and asserts each `audio/<name>.mp3` exists. Missing ones are reported by name. It's **expected to keep failing** for the new clips until Jon runs the tool. Mark it with `{todo: true}` so the suite passes, and Task 10 removes the `todo`.
- [ ] **Step 2: Write `tools/make_voice.py`.**
  - Start from `/Users/jon/hiragana-tts/generate.py`, keeping the retries, `TEMPLATE`, `VOICE` and `OUT_DIR`.
  - The table maps clip name to the **katakana** text to send. Build it from `js/deck.js` and the pairs, the same way `make_strokes.py` reads the deck, so the list never drifts.
  - Default to generating only the clips missing from `audio/`.
  - Docstring: running it needs `GOOGLE_API_KEY`, then trim, level and check as `how-the-voice-was-made.html` describes.
- [ ] **Step 3: Update `sound.js`, `sheets.js` and `app.js`.**
  - Unlock with `AUDIO_FILE('ア')`.
  - The test-voice button says `ハ ヘ ヲ ン ファ`.
  - The voice preview says `ア`.
  - Drop the ぢ/づ special case (the `a` field covers it).
- [ ] **Step 4: Run `node --test tests/`.** Expected: PASS, with the todo reporting the missing foreign and pair clips.
- [ ] **Step 5: Check by hand.** A カ listening card plays the clip. A ファ card falls back to phone speech without errors.
- [ ] **Step 6: Commit.**

### Task 7: ー and ッ cards

**Files:**
- Modify: `js/screens/session.js` (`renderCard` intro, read and recall branches, and `answer`), `js/queues.js` (only if a mark needs special handling in placement)
- Test: `tests/pairs.test.mjs` (only if a pure helper is extracted)

**Interfaces:**
- Consumes: `PAIRS`, `speakWord`.
- Produces: for an entry with `PAIRS[k]` (ー and ッ):
  - each card picks one pair at random into `sess.pair = {…pair, showLong: boolean}`
  - **intro**: shows the mark big, then the pair's two words with a play button for each
  - **read**: "What does this say?", showing the chosen word, with two buttons for `rl` and `rs`
  - **recall**: "Which one did you hear?", plays the chosen word, with two buttons for the long and short words
  - **write**: unchanged (draw the mark)
- The correct button carries `data-k="<mark>"` and the other carries `data-k="~"`, so `answer()` grading is unchanged. `answer()`'s feedback for marks says, for example, "カー is kaa. カ is ka." instead of looking up `BY[chosen]`.

- [ ] **Step 1: Add the mark branches in `renderCard`** and the feedback branch in `answer()`, as described above. Recall on marks is always the listening version, never the romaji version.
- [ ] **Step 2: If you extract `pickPair(k, rand)` as a pure function, test it.** It returns a pair from `PAIRS[k]` and a `showLong` that follows `rand`.
- [ ] **Step 3: Check by hand.**
  - Add the Long and double row. The intro, read and recall cards each work. A wrong answer shows both words with their romaji.
  - Reloading mid-session doesn't break.
  - The Progress screen counts ー and ッ like any other entry.
- [ ] **Step 4: Commit.**

### Task 8: Fonts and icons

**Files:**
- Modify: `tools/make_fonts.py:41` (character range), `vendor/fonts/*` (regenerated)
- Create: `tools/make-icons.html`
- Modify: `icons/*.png` (regenerated)

- [ ] **Step 1: Set the font range** in `make_fonts.py` to ASCII + U+30A0–U+30FF, keeping the scan of page and script text so any hiragana in the docs is kept. Run `python3 tools/make_fonts.py`.
- [ ] **Step 2: Write `tools/make-icons.html`.** It draws each icon size on a `<canvas>`, copying the existing hiragana icon: the navy square, the dashed guide lines and the white character. Sample the exact colours and proportions from the hiragana repo's `icons/icon-512.png`. It draws ア in the vendored Klee One 600 and offers each PNG as a download (no Pillow is installed, so the browser does the drawing).
  - Sizes: 32, 48, 180 (apple-touch), 192, 512, and maskable 512 with the safe-zone padding the current maskable icon uses.
- [ ] **Step 3: Generate the icons** and replace `icons/*.png`. Then compare side by side with the hiragana icons: same style, ア instead of あ.
- [ ] **Step 4: Rerun `make_sw.py`** with a new version, then commit.

### Task 9: Words: how-it-works, the voice page, README, CLAUDE.md, welcome

**Files:**
- Modify: `how-it-works.html`, `how-the-voice-was-made.html`, `README.md`, `CLAUDE.md`, `js/welcome.js`, `js/screens/report.js`, `js/tips.js` (if any tip mentions hiragana kana)

- [ ] **Step 1: Rewrite `how-it-works.html` for katakana.**
  - Explain the new sections, including the two-box writing cards and the ー/ッ pair cards.
  - Mention that the voice clips are shared with the Hiragana drill, and link to it.
- [ ] **Step 2: Update the voice page** to say it covers both apps and that the tool is now `tools/make_voice.py`. Mention the `dhi`/`dwu`/`who` and `pair-` names.
- [ ] **Step 3: Update `README.md` and `CLAUDE.md`** with this repo's layout, tests (`node --test tests/`), tools, address and storage key. The welcome slide shows ア with "Learn to read and write katakana".
- [ ] **Step 4: Read through every screen** at localhost and search for leftover hiragana wording: `grep -rn -i hiragana --include=*.js --include=*.html .`. Each remaining hit should be a deliberate reference to the sibling app.
- [ ] **Step 5: Rerun `make_sw.py`, then commit and push.**

### Task 10: Launch (after Jon has made the clips)

- [ ] **Step 1: Jon runs the voice tool.** He runs `GOOGLE_API_KEY=… python3 tools/make_voice.py`, then trims, levels and listens to the new clips, and copies them into `audio/`.
- [ ] **Step 2: Remove `todo` from `tests/audio.test.mjs`.** Run `node --test tests/`. Expected: all PASS.
- [ ] **Step 3: Rerun `make_sw.py`** with a new version, then commit and push.
- [ ] **Step 4: Try it on a phone** at <https://nooogle.github.io/katakana/>:
  - install it
  - go offline and use it
  - confirm the Hiragana drill on the same phone still has its progress
- [ ] **Step 5: Add the home-page link.** In `/Users/jon/develop/cds/nooogle.github.io`, add a Katakana drill entry next to the Hiragana one, then commit and push (check with Jon first).
