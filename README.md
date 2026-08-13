# simfile-parser

[![npm](https://img.shields.io/npm/v/simfile-parser)](https://www.npmjs.com/package/simfile-parser) [![npm bundle size](https://img.shields.io/bundlephobia/min/simfile-parser)](https://bundlephobia.com/package/simfile-parser)

Parse stepmania simfiles in javascript with zero dependencies. Works both in node (server-side or CLI) and in browser. Reads individual songs, whole packs, groups of packs, or even a pack still inside a zip file.

Original parsing code from [city41/stepcharts](https://github.com/city41/stepcharts). Props to Matt for building a really sweet site.

## Usage

```ts
// in node.js >= 20

import {
  parseAllPacks,
  parsePack,
  parseSong,
  calculateStats,
} from "simfile-parser";

// Use one of the three parsing functions depending on your needs.
// Each takes a folder or a .zip, and each returns a promise.
const allMyStuff = await parseAllPacks("/pathToStepmania/Songs");
const aGreatPack = await parsePack("/pathToStepmania/Songs/DDRMAX2");
const alsoAPack = await parsePack("/downloads/DDRMAX2.zip");
const aGreatSong = await parseSong(".../Songs/Easy as Pie 2/Abracadabra");

// you can get some top level info about a song's contents too:
calculateStats(aGreatSong.charts["single-challenge"]);
/* returns:
{
  "freezes": 111,
  "gallops": 0,
  "jacks": 22,
  "jumps": 8,
}
*/
```

### Browser support

Support dragging packs directly into a web app by parsing in-browser! The
browser entry point offers the same `parsePack` and `parseSong`, taking
anything the browser hands you: a `DataTransferItem`, an `HTMLInputElement`, a
`File`, or a `Blob`.

```ts
// requires typescript 5.0 in "Bundler" module resolution mode for typings
import { parsePack } from "simfile-parser/browser";

// necessary to enable data drops
document.body.addEventListener("dragover", function (e) {
  e.preventDefault();
});

document.body.addEventListener("drop", async function (evt) {
  // also necessary to prevent browser navigating to dropped folder
  evt.preventDefault();
  if (!evt.dataTransfer) {
    return;
  }
  if (evt.dataTransfer.items.length !== 1) {
    console.error("too many items dropped, try just one folder");
    return;
  }

  try {
    // works for a dropped folder or a dropped .zip
    const pack = await parsePack(evt.dataTransfer.items[0]);
    console.log(`parsed pack "${pack.name}" with ${pack.songCount} songs`);
  } catch (e) {
    console.error(e);
  }
});
```

An archive can also be handed over directly, for example from a `fetch`:

```ts
const response = await fetch("/packs/Club Fantastic Season 1.zip");
const pack = await parsePack(await response.blob(), "Club Fantastic");
```

In the browser `path` is always `null`, since browsers never expose real paths.

### Zipped packs

Every parsing function can read a zip file directly rather than making you unzip it first. Archives are detected by content, not by file extension. `parsePack` also accepts a `Blob` or `File`, so an archive you already have in memory never has to be written out.

Given a path, an archive is read lazily off disk: only its index and each
song's chart file are read to parse a pack, and images are located but not
loaded until you ask for them. Parsing a 55 MB pack reads **0.44 MB**, and the
archive is never held in memory.

Reading zips uses [`DecompressionStream`][ds], which needs node 20+, Chrome
103+, Firefox 113+, or Safari 16.4+. Encrypted archives are not supported.

[ds]: https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream
