# Changelog

## v0.7.0

- Added support for in-browser parsing of entire simfile packs! Individual songs can be easily supported later. See [the readme](./README.md) for usage example.

## v0.6.1

- Avoid publishing yarn cache in published tarball

## v0.6.0

- **BREAKING** switched package output to pure ESM
- Removed dependency on 'fraction.js'
- Fix parsing BPMs when broken across multiple lines
- Parse display bpms to a better display format

## v0.5.0

- **BREAKING** drop support for Node 14
- Fixed non-song folders in packs causing fatal errors

## v0.4.1

- No changes (just working out auto-publishing)

## v0.4.0

- **BREAKING** renamed some exported types and/or fields
  - `FreezeBody` => `FreezeLocation`
  - `Bpm` => `BpmChange`
  - `Arrow['beat']` => `Arrow['quantization']`
- Quantization now reports 32nd and 64th steps, anything out of bounds is now reported as a 64th instead of a 12th
- More correctly return `displayBpm` values as written in the stepfile instead of always calculating a range
- Added considerable amounts of doc comments on types and functions
- Fixed potentially incorrect handling of simfiles using the less-standard `BACKGROUND` tag (compared to the more common `BG`)

## v0.3.0

- **BREAKING** drop support for Node 12, begin testing in node 18
- Fix issues parsing SSC: no longer crashes on files with only a single chart, no longer missing the final chart when multiple exist

## v0.2.1

- Fixed some problems detecting images

## v0.2.0

- Added SSC parser
- Fixed issues parsing charts with rolls

## v0.1.0

Initial public release. Parses DWI and SM files (most of the time) and picks up associated images (sometimes).
