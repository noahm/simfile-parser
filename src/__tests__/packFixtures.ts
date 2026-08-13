/**
 * Helpers for building zip fixtures out of the real packs in this repo, shared
 * by the browser and node zip test suites.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { makeZip, ZipFixtureFile, ZipFixtureOptions } from "./makeZip.js";

export const packsRoot = path.resolve(import.meta.dirname, "../../packs");

/**
 * Reads a real pack off disk so it can be zipped up for the end to end tests.
 * Audio is skipped to keep the fixtures small; it is never parsed anyway.
 * @param packName name of a pack in the packs directory
 * @param prefix path to nest the pack's contents under inside the archive
 * @returns one entry per file in the pack
 */
export function readPackFiles(packName: string, prefix = ""): ZipFixtureFile[] {
  const root = path.join(packsRoot, packName);
  const files: ZipFixtureFile[] = [];
  const walk = (dir: string) => {
    for (const child of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, child.name);
      if (child.isDirectory()) {
        walk(full);
      } else if (!/\.(ogg|mp3|wav|avi|mpg)$/i.test(child.name)) {
        files.push({
          name: prefix + path.relative(root, full).split(path.sep).join("/"),
          data: new Uint8Array(fs.readFileSync(full)),
        });
      }
    }
  };
  walk(root);
  return files;
}

/**
 * @param packName name of a pack in the packs directory
 * @param prefix path to nest the pack's contents under inside the archive
 * @param options how to encode the archive
 * @returns the pack as a zip file
 */
export async function zipPack(
  packName: string,
  prefix = "",
  options: ZipFixtureOptions = {},
) {
  const blob = await makeZip(readPackFiles(packName, prefix), options);
  return new File([blob], `${packName}.zip`);
}

/**
 * Asserts something was found, so the tests can go on to use it without
 * reaching for non-null assertions.
 * @param value the possibly missing value
 * @param what a description of what was being looked for
 * @returns the value
 */
export function found<T>(value: T | null | undefined, what: string): T {
  if (!value) {
    throw new Error(`expected to find ${what}`);
  }
  return value;
}
