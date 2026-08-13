# simfile-parser

[![npm](https://img.shields.io/npm/v/simfile-parser)](https://www.npmjs.com/package/simfile-parser) [![npm bundle size](https://img.shields.io/bundlephobia/min/simfile-parser)](https://bundlephobia.com/package/simfile-parser)

Parse stepmania simfiles in javascript with zero dependencies. Works both in node (server-side or CLI) and in browser. Reads individual songs, whole packs, groups of packs, or even a pack still inside a zip file.

Original parsing code from [city41/stepcharts](https://github.com/city41/stepcharts). Props to Matt for building a really sweet site.

## Usage

```ts
// in node.js >= 16.9.0

import {
  parseAllPacks,
  parsePack,
  parseSong,
  calculateStats,
} from "simfile-parser";

// Use one of the three parsing functions depending on your needs:
const allMyStuff = parseAllPacks("/pathToStepmania/Songs");
const aGreatPack = parsePack("/pathToStepmania/Songs/DDRMAX2");
const aGreatSong = parseSong(".../Songs/Easy as Pie 2/Abracadabra");

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

Support dragging packs directly into a web app by parsing in-browser! A pack
can be either a folder of song folders or a **zip file** containing one.

```ts
// requires typescript 5.0 in "Bundler" module resolution mode for typings
import { parsePack } from "simfile-parser/browser";

// necessary to enable data drops
document.body.addEventListener("dragover", function (e) {
  e.preventDefault();
});

document.body.addEventListener("drop", async function (e) {
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

#### Zipped packs

`parsePack` detects zip files by content, so a pack dropped or selected as an
archive needs no unzipping first. You can also hand one straight to
`parseZipPack`, for example from a file input or a `fetch`:

```ts
import { parseZipPack } from "simfile-parser/browser";

const response = await fetch("/packs/Club Fantastic Season 1.zip");
const pack = await parseZipPack(await response.blob(), "Club Fantastic");
```

Archives are read lazily: only the archive index, each song's chart file, and
its images are ever decompressed, so the audio and video that make up the bulk
of a pack are skipped entirely and the whole archive never has to be held in
memory.

Only one pack per archive is supported. An archive holding several packs — a
whole `Songs` directory, say — throws rather than quietly parsing nothing:

```
expected an archive holding a single pack, but found 2: 'DDRMAX2', 'SuperNOVA2'
```

Reading zips uses [`DecompressionStream`][ds], which needs Chrome 103+,
Firefox 113+, or Safari 16.4+. Encrypted archives are not supported.

[ds]: https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream
