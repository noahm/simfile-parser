# simfile-parser

[![npm](https://img.shields.io/npm/v/simfile-parser)](https://www.npmjs.com/package/simfile-parser) [![npm bundle size](https://img.shields.io/bundlephobia/min/simfile-parser)](https://bundlephobia.com/package/simfile-parser)

Original parsing code from [city41/stepcharts](https://github.com/city41/stepcharts). Props to Matt for building a really sweet site.

Works both in node (server-side or CLI) and in browser. Bun and Deno support is untested, but an interesting future to explore!

## Usage

Install with `npm install --save simfile-parser` or `yarn add simfile-parser`

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

Support dragging packs directly into a web app by parsing in-browser!

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
    const pack = await parsePack(evt.dataTransfer.items[0]);
    console.log(`parsed pack "${pack.name}" with ${pack.songCount} songs`);
  } catch (e) {
    console.error(e);
  }
});
```
