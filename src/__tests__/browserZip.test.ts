import * as fs from "node:fs";
import * as path from "node:path";
import { parsePack as parsePackFromDisk } from "../main";
import { parsePack, parseZipPack } from "../browser/index";
import { openZip, isZip, DirLike, isDir } from "../browser/vfs";
import { readCentralDirectory, readEntry } from "../browser/zip";
import { makeZip, ZipFixtureFile, ZipFixtureOptions } from "./makeZip";
import { setErrorTolerance } from "../util";

setErrorTolerance("bail");

const packsRoot = path.resolve(import.meta.dirname, "../../packs");
const fixturePack = "Bhop Ball";

/**
 * Reads a real pack off disk so it can be zipped up for the end to end tests.
 * Audio is skipped to keep the fixtures small; it is never parsed anyway.
 * @param packName name of a pack in the packs directory
 * @param prefix path to nest the pack's contents under inside the archive
 * @returns one entry per file in the pack
 */
function readPackFiles(packName: string, prefix = ""): ZipFixtureFile[] {
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
async function zipPack(
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
function found<T>(value: T | null | undefined, what: string): T {
  if (!value) {
    throw new Error(`expected to find ${what}`);
  }
  return value;
}

/**
 * @param dir a virtual directory
 * @returns the names of its children, sorted
 */
async function childNames(dir: DirLike) {
  const names: string[] = [];
  for await (const entry of dir.entries()) {
    names.push(isDir(entry) ? `${entry.name}/` : entry.name);
  }
  return names.sort();
}

describe("zip format reader", () => {
  const files: ZipFixtureFile[] = [
    { name: "song/steps.sm", data: "#TITLE:Test;" },
    { name: "song/banner.png", data: new Uint8Array([1, 2, 3, 4, 5]) },
    { name: "readme.txt", data: "x".repeat(5000) },
  ];

  /**
   * @param options how to encode the archive
   * @returns the archive's entries mapped to their decoded contents
   */
  async function roundTrip(options: ZipFixtureOptions) {
    const blob = await makeZip(files, options);
    const entries = await readCentralDirectory(blob);
    const contents: Record<string, string> = {};
    for (const entry of entries.filter((e) => !e.isDirectory)) {
      const bytes = new Uint8Array(
        await (await readEntry(blob, entry)).arrayBuffer(),
      );
      contents[entry.name] = Array.from(bytes).join(",");
    }
    return contents;
  }

  /**
   * @returns the fixture files keyed the same way roundTrip returns them
   */
  function expected() {
    const contents: Record<string, string> = {};
    for (const file of files) {
      const bytes =
        typeof file.data === "string"
          ? new TextEncoder().encode(file.data)
          : file.data;
      contents[file.name] = Array.from(bytes).join(",");
    }
    return contents;
  }

  test("reads deflated entries", async () => {
    expect(await roundTrip({})).toEqual(expected());
  });

  test("reads stored entries", async () => {
    expect(await roundTrip({ stored: true })).toEqual(expected());
  });

  test("reads zip64 archives", async () => {
    expect(await roundTrip({ zip64: true })).toEqual(expected());
  });

  test("reads archives with a trailing comment", async () => {
    expect(await roundTrip({ comment: "made with some archiver" })).toEqual(
      expected(),
    );
  });

  test("reads explicit directory entries", async () => {
    const blob = await makeZip(files, { includeDirEntries: true });
    const entries = await readCentralDirectory(blob);
    expect(entries.filter((e) => e.isDirectory).map((e) => e.name)).toEqual([
      "song/",
    ]);
  });

  test("decodes utf-8 filenames", async () => {
    const blob = await makeZip([{ name: "曲/ステップ.sm", data: "#TITLE:a;" }]);
    const entries = await readCentralDirectory(blob);
    expect(entries[0].name).toBe("曲/ステップ.sm");
  });

  test("decodes cp437 filenames", async () => {
    const blob = await makeZip([{ name: "Café/naïve.sm", data: "#TITLE:a;" }], {
      cp437: true,
    });
    const entries = await readCentralDirectory(blob);
    expect(entries[0].name).toBe("Café/naïve.sm");
  });

  test("rejects data that is not a zip", async () => {
    const notAZip = new Blob(["this is definitely not a zip file"]);
    expect(await isZip(notAZip)).toBe(false);
    await expect(readCentralDirectory(notAZip)).rejects.toThrow(
      /no end of central directory/,
    );
  });

  test("recognizes a real zip by its magic number", async () => {
    expect(await isZip(await makeZip(files))).toBe(true);
  });
});

describe("openZip", () => {
  /**
   * @returns a small archive covering the shapes we care about
   */
  function sampleArchive() {
    return makeZip([
      { name: "Pack/Song One/steps.sm", data: "#TITLE:One;" },
      { name: "Pack/Song One/BANNER.png", data: "banner bytes" },
      { name: "Pack/Song Two/steps.sm", data: "#TITLE:Two;" },
      { name: "__MACOSX/Pack/._steps.sm", data: "junk" },
      { name: "Pack/.DS_Store", data: "junk" },
    ]);
  }

  test("rebuilds the folder tree, including implied folders", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    expect(await childNames(root)).toEqual(["Pack/"]);

    const [pack] = [...(await entriesOf(root))];
    expect(await childNames(pack as DirLike)).toEqual([
      "Song One/",
      "Song Two/",
    ]);
  });

  test("drops archiver junk", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    expect(await childNames(root)).not.toContain("__MACOSX/");
    const pack = (await entriesOf(root))[0] as DirLike;
    expect(await childNames(pack)).not.toContain(".DS_Store");
  });

  test("resolves paths relative to a directory", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    const pack = (await entriesOf(root))[0] as DirLike;
    const songOne = (await entriesOf(pack))[0] as DirLike;

    expect(await songOne.getFile("steps.sm")).toBeTruthy();
    expect(await songOne.getFile("nope.sm")).toBeNull();
    // walking back up out of the song folder
    expect(await songOne.getFile("../Song Two/steps.sm")).toBeTruthy();
    // nested from the pack root
    expect(await pack.getFile("Song Two/steps.sm")).toBeTruthy();
    // tags authored on windows sometimes use backslashes
    expect(await pack.getFile("Song Two\\steps.sm")).toBeTruthy();
  });

  test("resolves filenames case insensitively", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    const pack = (await entriesOf(root))[0] as DirLike;
    const songOne = (await entriesOf(pack))[0] as DirLike;
    // the simfile might tag this as banner.png while the archive has BANNER.png
    const banner = found(await songOne.getFile("banner.png"), "banner.png");
    expect(await (await banner.file()).text()).toBe("banner bytes");
  });

  test("only reads a given entry once", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    // an image often gets picked for more than one role in the same song
    const first = found(await root.getFile("Pack/Song One/BANNER.png"), "once");
    const second = found(
      await root.getFile("Pack/Song One/BANNER.png"),
      "again",
    );
    expect(first).not.toBe(second);
    expect(await first.file()).toBe(await second.file());
  });

  test("reads file contents lazily", async () => {
    const root = await openZip(await sampleArchive(), "archive");
    const file = found(
      await root.getFile("Pack/Song One/steps.sm"),
      "steps.sm",
    );
    expect(await (await file.file()).text()).toBe("#TITLE:One;");
  });
});

/**
 * @param dir a virtual directory
 * @returns its children as an array
 */
async function entriesOf(dir: DirLike) {
  const all = [];
  for await (const entry of dir.entries()) {
    all.push(entry);
  }
  return all;
}

describe("parseZipPack", () => {
  /**
   * The node parser reads the same pack straight off disk, so it makes a good
   * reference for what the zip parser ought to produce.
   * @returns comparable fields for each song, sorted by title
   */
  const fromDisk = () =>
    parsePackFromDisk(path.join(packsRoot, fixturePack))
      .simfiles.map((s) => ({
        title: s.title.titleName,
        artist: s.artist,
        minBpm: s.minBpm,
        maxBpm: s.maxBpm,
        displayBpm: s.displayBpm,
        stopCount: s.stopCount,
        charts: Object.keys(s.charts).sort(),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

  /**
   * @param pack a parsed pack
   * @returns comparable fields for each song, sorted by title
   */
  const comparable = (pack: Awaited<ReturnType<typeof parseZipPack>>) =>
    pack.simfiles
      .map((s) => ({
        title: s.title.titleName,
        artist: s.artist,
        minBpm: s.minBpm,
        maxBpm: s.maxBpm,
        displayBpm: s.displayBpm,
        stopCount: s.stopCount,
        charts: Object.keys(s.charts).sort(),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

  test("matches the on-disk parser, for a pack wrapped in a folder", async () => {
    const zip = await zipPack(fixturePack, `${fixturePack}/`);
    const pack = await parseZipPack(zip);
    expect(pack.songCount).toBe(2);
    expect(pack.name).toBe(fixturePack);
    expect(comparable(pack)).toEqual(fromDisk());
  });

  test("matches the on-disk parser, for songs at the archive root", async () => {
    const zip = await zipPack(fixturePack);
    const pack = await parseZipPack(zip);
    expect(pack.songCount).toBe(2);
    // falls back to the archive's own filename for the pack name
    expect(pack.name).toBe(fixturePack);
    expect(comparable(pack)).toEqual(fromDisk());
  });

  test("ignores mac metadata sitting alongside the pack folder", async () => {
    // zips made on macos carry a __MACOSX folder next to the real one, which
    // would otherwise leave the pack folder looking like one of two candidates
    const blob = await makeZip([
      ...readPackFiles(fixturePack, `${fixturePack}/`),
      { name: "__MACOSX/._" + fixturePack, data: "junk" },
      { name: `__MACOSX/${fixturePack}/._steps.sm`, data: "junk" },
    ]);
    const pack = await parseZipPack(new File([blob], `${fixturePack}.zip`));
    expect(pack.name).toBe(fixturePack);
    expect(comparable(pack)).toEqual(fromDisk());
  });

  describe("a pack holding only one song", () => {
    /**
     * @param prefix path to nest the song under inside the archive
     * @returns an archive containing a single song folder
     */
    async function singleSongZip(prefix: string) {
      const song = "[T10] Central Utopia";
      const files = readPackFiles(fixturePack, prefix).filter((f) =>
        f.name.includes(song),
      );
      return new File([await makeZip(files)], "Solo Pack.zip");
    }

    // one song folder is the ambiguous case: a lone subfolder is normally a
    // wrapper to descend through, but here it is the song itself
    test("finds it at the archive root", async () => {
      const pack = await parseZipPack(await singleSongZip(""));
      expect(pack.songCount).toBe(1);
      expect(pack.name).toBe("Solo Pack");
    });

    test("finds it inside a pack folder", async () => {
      const pack = await parseZipPack(await singleSongZip("Solo Pack/"));
      expect(pack.songCount).toBe(1);
      expect(pack.name).toBe("Solo Pack");
    });
  });

  test("descends through several wrapper folders", async () => {
    const zip = await zipPack(fixturePack, `downloads/new/${fixturePack}/`);
    const pack = await parseZipPack(zip);
    expect(pack.songCount).toBe(2);
    expect(pack.name).toBe(fixturePack);
  });

  test("parses stored and zip64 archives the same way", async () => {
    const reference = comparable(
      await parseZipPack(await zipPack(fixturePack, `${fixturePack}/`)),
    );
    for (const options of [{ stored: true }, { zip64: true }]) {
      const zip = await zipPack(fixturePack, `${fixturePack}/`, options);
      expect(comparable(await parseZipPack(zip))).toEqual(reference);
    }
  });

  test("extracts images as files", async () => {
    const zip = await zipPack(fixturePack, `${fixturePack}/`);
    const pack = await parseZipPack(zip);
    const song = found(
      pack.simfiles.find((s) => s.title.titleDir.includes("Central Utopia")),
      "Central Utopia",
    );
    const bg = found(song.title.bg, "a background image");
    const banner = found(song.title.banner, "a banner image");
    expect(bg).toBeInstanceOf(File);
    expect(banner).toBeInstanceOf(File);
    // the real image bytes came through, not an empty placeholder
    expect(bg.size).toBeGreaterThan(0);
    expect(banner.size).toBeGreaterThan(0);
  });

  test("still finds the pack when junk folders sit beside it", async () => {
    const blob = await makeZip([
      ...readPackFiles(fixturePack, `${fixturePack}/`),
      { name: "_screenshots/shot.png", data: "not a song" },
    ]);
    const pack = await parseZipPack(new File([blob], "download.zip"));
    expect(pack.name).toBe(fixturePack);
    expect(comparable(pack)).toEqual(fromDisk());
  });

  describe("archives that aren't a single pack", () => {
    /**
     * @param packNames names of the packs to put in the archive
     * @returns an archive containing a song folder under each named pack
     */
    async function multiPackZip(packNames: string[]) {
      const files = packNames.flatMap((packName) => [
        { name: `Songs/${packName}/A Song/steps.sm`, data: "#TITLE:A;" },
      ]);
      return new File([await makeZip(files)], "Songs.zip");
    }

    test("refuses an archive holding more than one pack", async () => {
      const zip = await multiPackZip(["Bhop Ball", "Club Fantastic"]);
      await expect(parseZipPack(zip)).rejects.toThrow(
        "expected an archive holding a single pack, but found 2: " +
          "'Bhop Ball', 'Club Fantastic'",
      );
    });

    test("summarizes the rest when there are lots of packs", async () => {
      const names = ["A", "B", "C", "D", "E", "F", "G"];
      await expect(parseZipPack(await multiPackZip(names))).rejects.toThrow(
        "found 7: 'A', 'B', 'C', 'D', 'E', and 2 more",
      );
    });

    test("refuses an archive with no songs in it", async () => {
      const blob = await makeZip([
        { name: "notes/readme.txt", data: "no charts here" },
      ]);
      await expect(parseZipPack(new File([blob], "notes.zip"))).rejects.toThrow(
        /found no songs in this archive/,
      );
    });
  });

  test("accepts an explicit pack name", async () => {
    const zip = await zipPack(fixturePack, `${fixturePack}/`);
    expect((await parseZipPack(zip, "Custom Name")).name).toBe("Custom Name");
  });
});

describe("parsePack", () => {
  test("accepts a zip file directly", async () => {
    const zip = await zipPack(fixturePack, `${fixturePack}/`);
    const pack = await parsePack(zip);
    expect(pack.songCount).toBe(2);
    expect(pack.name).toBe(fixturePack);
  });

  test("rejects a file that is not a zip or a folder", async () => {
    const notAPack = new File(["#TITLE:lonely;"], "steps.sm");
    await expect(parsePack(notAPack)).rejects.toThrow(
      /expected a folder or zip file/,
    );
  });
});
