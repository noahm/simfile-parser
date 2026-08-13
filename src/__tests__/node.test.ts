import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseAllPacks, parsePack, parseSong } from "../main";
import { makeZip } from "./makeZip";
import { found, packsRoot, readPackFiles, zipPack } from "./packFixtures";
import { setErrorTolerance } from "../util";

setErrorTolerance("bail");

const fixturePack = "Bhop Ball";
const fixturePackPath = path.join(packsRoot, fixturePack);

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "simfile-parser-"));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/**
 * Writes an archive out to a real file, since reading one off disk is the
 * thing the node entry point adds.
 * @param name filename to write to
 * @param blob the archive
 * @returns the path the archive was written to
 */
async function writeArchive(name: string, blob: Blob): Promise<string> {
  const target = path.join(tmpDir, name);
  fs.writeFileSync(target, new Uint8Array(await blob.arrayBuffer()));
  return target;
}

/**
 * @param pack a parsed pack
 * @returns comparable fields for each song, sorted by title
 */
const comparable = (pack: Awaited<ReturnType<typeof parsePack>>) =>
  pack.simfiles
    .map((s) => ({
      title: s.title.titleName,
      artist: s.artist,
      displayBpm: s.displayBpm,
      minBpm: s.minBpm,
      maxBpm: s.maxBpm,
      charts: Object.keys(s.charts).sort(),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

describe("parsePack from a folder", () => {
  test("parses a pack directory", async () => {
    const pack = await parsePack(fixturePackPath);

    expect(pack.name).toBe(fixturePack);
    expect(pack.dir).toBe(fixturePack);
    expect(pack.path).toBe(fixturePackPath);
    expect(pack.songCount).toBe(2);
  });

  test("reports where each song and image lives on disk", async () => {
    const pack = await parsePack(fixturePackPath);
    const song = found(
      pack.simfiles.find((s) => s.title.titleDir.includes("Central Utopia")),
      "Central Utopia",
    );

    expect(song.title.titlePath).toBe(
      path.join(fixturePackPath, song.title.titleDir),
    );

    const banner = found(song.title.banner, "a banner");
    expect(banner.path).not.toBeNull();
    expect(fs.existsSync(banner.path as string)).toBe(true);
    // and the handle reads the very same bytes
    expect(new Uint8Array(await (await banner.file()).arrayBuffer())).toEqual(
      new Uint8Array(fs.readFileSync(banner.path as string)),
    );
  });

  test("finds a pack wrapped in a download folder", async () => {
    const wrapper = path.join(tmpDir, "downloads");
    fs.mkdirSync(path.join(wrapper, fixturePack), { recursive: true });
    fs.cpSync(fixturePackPath, path.join(wrapper, fixturePack), {
      recursive: true,
    });

    const pack = await parsePack(wrapper);

    expect(pack.name).toBe(fixturePack);
    expect(pack.songCount).toBe(2);
  });

  test("refuses a folder holding several packs", async () => {
    // pointed at a whole Songs directory, this used to hand back a pack with
    // no songs in it rather than saying anything
    await expect(parsePack(packsRoot)).rejects.toThrow(
      /expected a single pack, but found 11: .*and 6 more/,
    );
  });

  test("refuses a folder with no songs in it", async () => {
    const empty = path.join(tmpDir, "empty");
    fs.mkdirSync(empty, { recursive: true });

    await expect(parsePack(empty)).rejects.toThrow(/found no songs here/);
  });
});

describe("parsePack from a zip", () => {
  test("parses a pack from a path on disk", async () => {
    const archive = await writeArchive(
      "songs-at-root.zip",
      await zipPack(fixturePack),
    );

    const pack = await parsePack(archive);

    expect(comparable(pack)).toEqual(
      comparable(await parsePack(fixturePackPath)),
    );
  });

  test("matches the same pack parsed from its folder", async () => {
    const archive = await writeArchive(
      "wrapped.zip",
      await zipPack(fixturePack, `${fixturePack}/`),
    );

    const fromZip = await parsePack(archive);
    const fromDisk = await parsePack(fixturePackPath);

    expect(fromZip.name).toBe(fromDisk.name);
    expect(comparable(fromZip)).toEqual(comparable(fromDisk));
    // the one thing that legitimately differs
    expect(fromZip.path).toBeNull();
    expect(fromDisk.path).toBe(fixturePackPath);
  });

  test("names the pack after the file when songs sit at the archive root", async () => {
    const archive = await writeArchive(
      "Some Cool Pack.zip",
      await zipPack(fixturePack),
    );

    expect((await parsePack(archive)).name).toBe("Some Cool Pack");
  });

  test("accepts an explicit pack name", async () => {
    const archive = await writeArchive(
      "named.zip",
      await zipPack(fixturePack, `${fixturePack}/`),
    );

    expect((await parsePack(archive, "Custom Name")).name).toBe("Custom Name");
  });

  test("accepts a File without touching the disk", async () => {
    const pack = await parsePack(await zipPack(fixturePack));

    expect(pack.name).toBe(fixturePack);
    expect(pack.path).toBeNull();
  });

  test("accepts a bare Blob", async () => {
    const file = await zipPack(fixturePack);
    const pack = await parsePack(new Blob([file]), "From A Blob");

    expect(pack.name).toBe("From A Blob");
    expect(pack.songCount).toBe(2);
  });

  test("returns images as handles with no path but real bytes", async () => {
    const archive = await writeArchive(
      "images.zip",
      await zipPack(fixturePack),
    );

    const pack = await parsePack(archive);
    const withBanner = found(
      pack.simfiles.find((s) => s.title.banner),
      "a song with a banner",
    );
    const banner = found(withBanner.title.banner, "the banner");

    expect(banner.path).toBeNull();

    // the same image, read straight off disk, should match byte for byte
    const onDisk = found(
      readPackFiles(fixturePack).find((f) => f.name.endsWith(banner.name)),
      `${banner.name} on disk`,
    );
    const bytes = new Uint8Array(await (await banner.file()).arrayBuffer());
    expect(bytes).toEqual(onDisk.data);
  });

  test("reads only a small fraction of the archive", async () => {
    // stand in for the audio a real pack carries, which is never parsed. It
    // has to be incompressible for the archive to stay large, and stored so
    // building the fixture stays quick.
    const audio = readPackFiles(fixturePack)
      .filter((file) => file.name.endsWith(".sm"))
      .map((file) => ({
        name: file.name.replace(/\.sm$/, ".ogg"),
        data: new Uint8Array(randomBytes(2 * 1024 * 1024)),
      }));
    const archive = await makeZip([...readPackFiles(fixturePack), ...audio], {
      stored: true,
    });

    // every read the zip reader makes goes through Blob.slice, so counting the
    // ranges it asks for shows how much of the archive it actually touched
    const stats = { bytes: 0 };
    const counting = new Proxy(archive, {
      get(target, prop, receiver) {
        if (prop === "slice") {
          return (start = 0, end = target.size) => {
            stats.bytes += Math.min(end, target.size) - Math.max(start, 0);
            return target.slice(start, end);
          };
        }
        const value: unknown = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });

    const pack = await parsePack(counting, fixturePack);

    expect(pack.songCount).toBe(2);
    // images are only located during parsing, never read, so this is now well
    // under even the charts and images the pack holds
    const audioBytes = audio.reduce((sum, file) => sum + file.data.length, 0);
    expect(audioBytes).toBeGreaterThan(archive.size * 0.8);
    expect(stats.bytes).toBeLessThan(archive.size / 4);
  });

  test("rejects a file that isn't a zip", async () => {
    const notAZip = path.join(tmpDir, "not-a-zip.txt");
    fs.writeFileSync(notAZip, "just some text");

    await expect(parsePack(notAZip)).rejects.toThrow(/but got a single file/);
  });

  test("reports a missing file", async () => {
    await expect(parsePack(path.join(tmpDir, "nope.zip"))).rejects.toThrow();
  });

  test("refuses an archive holding more than one pack", async () => {
    const archive = await writeArchive(
      "two-packs.zip",
      await makeZip([
        ...readPackFiles(fixturePack, "Pack A/"),
        ...readPackFiles(fixturePack, "Pack B/"),
      ]),
    );

    await expect(parsePack(archive)).rejects.toThrow(
      "expected a single pack, but found 2: 'Pack A', 'Pack B'",
    );
  });
});

describe("parseSong", () => {
  test("parses a song folder from a path", async () => {
    const song = await parseSong(
      path.join(fixturePackPath, "[T10] Central Utopia"),
    );

    expect(song?.title.titleName).toBe("[T10] Central Utopia");
    expect(song?.title.titleDir).toBe("[T10] Central Utopia");
    expect(song?.title.titlePath).toBe(
      path.join(fixturePackPath, "[T10] Central Utopia"),
    );
  });

  test("parses a lone chart file from a path", async () => {
    const source = found(
      readPackFiles(fixturePack).find((f) => f.name.endsWith(".sm")),
      "a chart file",
    );
    const chart = path.join(tmpDir, "steps.sm");
    fs.writeFileSync(chart, source.data);

    const song = await parseSong(chart);

    expect(song?.title.titleName).toBeTruthy();
    expect(song?.title.titlePath).toBe(chart);
    // no folder to look in, so no images
    expect(song?.title.banner).toBeNull();
  });
});

describe("parseAllPacks", () => {
  test("parses folders and archives side by side", async () => {
    const root = path.join(tmpDir, "Songs");
    fs.mkdirSync(root, { recursive: true });
    fs.cpSync(fixturePackPath, path.join(root, "A Folder Pack"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, "A Zipped Pack.zip"),
      new Uint8Array(await (await zipPack(fixturePack)).arrayBuffer()),
    );
    // and something that is neither, which should just be skipped
    fs.writeFileSync(path.join(root, "notes.txt"), "ignore me");

    const packs = await parseAllPacks(root);

    expect(packs.map((p) => p.name).sort()).toEqual([
      "A Folder Pack",
      "A Zipped Pack",
    ]);
    expect(packs.every((p) => p.songCount === 2)).toBe(true);
  });
});
