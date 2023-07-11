# simfile-parser

[![npm](https://img.shields.io/npm/v/simfile-parser)](https://www.npmjs.com/package/simfile-parser) [![npm bundle size](https://img.shields.io/bundlephobia/min/simfile-parser)](https://bundlephobia.com/package/simfile-parser)

Original parsing code from [city41/stepcharts](https://github.com/city41/stepcharts). Props to Matt for building a really sweet site.

Only works in node (server-side) for now but browser support is on the radar.

## Usage

Install with `npm install --save simfile-parser` or `yarn add simfile-parser`

```ts
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
