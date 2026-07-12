import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const heroSource = await readFile(path.join(root, "src/components/HeroPetCarousel.tsx"), "utf8");
const spriteSource = await readFile(path.join(root, "src/components/PetSprite.tsx"), "utf8");
const styles = await readFile(path.join(root, "src/styles.css"), "utf8");

assert.doesNotMatch(heroSource, /heroPets\.forEach\s*\(/u, "hero must not eagerly preload every animated sprite");
assert.match(heroSource, /staticOnly=\{index !== activeIndex\}/u, "inactive hero pets must use static posters");
assert.match(spriteSource, /IntersectionObserver/u, "gallery sprites must load when they approach the viewport");
assert.match(spriteSource, /rootMargin:\s*"80px 0px"/u, "gallery preload distance must stay conservative");
assert.match(spriteSource, /loading=\{priority \? "eager" : "lazy"\}/u, "poster images must use native lazy loading");
assert.match(styles, /animation-play-state:\s*paused/u, "offscreen sprite animations must pause");

const posterRoot = path.join(root, "public/generated/pets");
const posterNames = (await readdir(posterRoot)).filter((name) => name.endsWith("-poster.webp"));
assert.equal(posterNames.length, 30, "every pet must have one lightweight poster");

const posterBytes = (await Promise.all(
  posterNames.map(async (name) => (await stat(path.join(posterRoot, name))).size),
)).reduce((total, size) => total + size, 0);
assert.ok(posterBytes <= 1_500_000, `poster budget exceeded: ${posterBytes} bytes`);

const heroAssetNames = [
  "player-01.webp",
  "player-01-poster.webp",
  "player-02-poster.webp",
  "boss-04-poster.webp",
  "player-04-poster.webp",
  "jx3-u4e03-u79c0-01-poster.webp",
];
const heroBytes = (await Promise.all(
  heroAssetNames.map(async (name) => (await stat(path.join(posterRoot, name))).size),
)).reduce((total, size) => total + size, 0);
assert.ok(heroBytes <= 600_000, `hero image budget exceeded: ${heroBytes} bytes`);

console.log(`performance budget tests passed (${heroBytes} hero bytes, ${posterBytes} poster bytes)`);
