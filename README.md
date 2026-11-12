# Katakana drill: notes for working on the code

This is the developer side of the app. (For how to *use* it, see [How it works](how-it-works.html).)

This repo is the whole app. GitHub Pages publishes it at <https://nooogle.github.io/katakana/> (the home page listing all the apps lives in the separate `nooogle.github.io` repo).

It's plain HTML, CSS and JavaScript with no build step. GitHub Pages serves these files exactly as they are, and the browser loads the JavaScript as **ES modules**: each file `export`s what it shares and `import`s what it needs from the others.

## Where things are

```
katakana/               (this repo)
  index.html            the page skeleton: one empty <main>, then loads js/app.js
  css/style.css         all the styling (colours are variables at the top, with dark mode below)
  js/
    app.js              start-up, and the one click handler that routes every button (data-act="...")
    deck.js             the rows, entries (one or two characters, like キャ), romaji, voice clip names,
                        look-alikes, and the made-up pairs for ー and ッ
    storage.js          the progress object S, saved to localStorage; backups copy exactly this
    scheduler.js        FSRS: grading answers, unlocking card types, converting old progress
    queues.js           which cards come up: reviews, weakest, run through everything
    sound.js            voice clips and phone speech, and waiting for sounds to finish
    hints.js            hint boxes and the hint editor
    hintdata.js         the suggested hints (the basic kana by hand, the rest built from the kana they're made of)
    keys.js             keyboard shortcuts for computers (each key presses a button on screen)
    welcome.js          the welcome slides for first-time users, and the Android Install button
    tips.js             the one-time tips during practice (which ones have been seen is kept in settings)
    sheets.js           pop-up panels: row options, Settings, and Send feedback (by email)
    ui.js               shared bits: icons, toasts, chart colours, streak, "next cards ready" text
    drawing.js          the finger-drawing pad on writing cards
    strokes.js          the stroke order animation and pictures (one per character for キャ, numbered straight through)
    screens/
      home.js           the chart screen
      session.js        showing cards, answers, feedback, the done screen
      report.js         the Progress screen and its share text
  vendor/               the ts-fsrs library, untouched (MIT licence), and the stroke order data
                        from KanjiVG (CC BY-SA 3.0, built by tools/make_strokes.py)
    fonts/              the Klee One and Zen Maru Gothic fonts (SIL Open Font License), kept here so they
                        work offline (built by tools/make_fonts.py)
  icons/                app icons for iPhone, Android and desktop, and the favicons
  manifest.webmanifest  the app's name, icons and colours, used when it's installed
  audio/                one MP3 per sound, named in the deck (mostly by romaji; see tools/clips.mjs)
  sw.js                 the offline cache (generated, see below)
  how-it-works.html     the user guide
  how-the-voice-was-made.html
  tools/                helper scripts: make_sw.py (the offline cache list), make_strokes.py (the stroke data),
                        make_fonts.py (the fonts), make_voice.py and clips.mjs (the voice clips) and
                        make-icons.html (the app icons, drawn in the browser)
  tests/                checks for the deck, hints, stroke data, voice clips and storage names (see below)
  preview/              temporary copies of work in progress, for trying on a phone (see preview/README.md)
```

Screens are drawn by building HTML in JavaScript and putting it into the `<main id="app">` box. Buttons don't get their own handlers: each has a `data-act` attribute, and `app.js` has a single `switch` that decides what to do.

## Trying changes on your Mac

Modules won't load if you just double-click the HTML file (browsers block that). Run a tiny web server from the top of the repo instead:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Progress there is separate from the live site.

## Tests

The parts that are plain data (the deck, hints, stroke data, the clip list) and the storage names have checks you can run with Node, which comes with a test runner built in, so there's still nothing to install:

```bash
node --test tests/*.test.mjs
```

One check is marked "todo" until the new voice clips are made (see below): it lists the missing ones without failing.

## Voice clips

Most clips are the Hiragana drill's, since the sounds are the same. The foreign sounds and the made-up ー/ッ words are new. To make them, set `GOOGLE_API_KEY` and run `python3 tools/make_voice.py`: it makes every clip that isn't in `audio/` yet, into `out/`. Trim, level and listen to them as [the voice page](how-the-voice-was-made.html) describes, copy them into `audio/`, and rebuild the offline cache list. Never commit the key.

## The offline cache

`sw.js` keeps a copy of every file on the phone so the app works with no signal. Pages, scripts and styles are always fetched fresh when there's signal, so ordinary code changes need nothing extra. If the server takes more than 3 seconds to answer (a weak signal), the saved copy is used instead, so the app still opens quickly. But **if you add, rename or remove a file, or change a voice clip**, rebuild the list and give it a new version name:

```bash
python3 tools/make_sw.py . sw.js 2026-11-02a
```

The fonts are kept in the app, not loaded from Google, so they work offline. To save space, only the parts of each font covering characters the app uses are kept. If you add text with new characters (hiragana or kanji, say), run `python3 tools/make_fonts.py`, then rebuild the cache list as above. Until then, those characters just show in the phone's own font.

## Saved progress

Progress lives in `localStorage` under the key `katakana-drill-v1`, as one JSON object (`S` in `storage.js`). Keep that format compatible, or add a conversion step like `migrate()` in `scheduler.js`, so nobody loses their progress when the app updates.
