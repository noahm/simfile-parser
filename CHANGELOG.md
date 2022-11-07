# Changelog

## Unreleased

- **BREAKING** drop support for Node 12, begin testing in node 18
- Fix issues parsing SSC: no longer crashes on files with only a single chart, no longer missing the final chart when multiple exist

## v0.2.1

- Fixed some problems detecting images

## v0.2.0

- Added SSC parser
- Fixed issues parsing charts with rolls

## v0.1.0

Initial public release. Parses DWI and SM files (most of the time) and picks up associated images (sometimes).
