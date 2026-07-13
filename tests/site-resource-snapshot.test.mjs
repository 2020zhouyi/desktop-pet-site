import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedSource = await readFile(path.join(root, "src/data/pets.generated.ts"), "utf8");
const heroSource = await readFile(path.join(root, "src/components/HeroPetCarousel.tsx"), "utf8");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const petImages = (await readdir(path.join(root, "public/generated/pets")))
  .filter((name) => name.endsWith(".webp") && !name.endsWith("-poster.webp"));
const petPackages = (await readdir(path.join(root, "public/generated/pet-packages")))
  .filter((name) => name.endsWith(".zip"));
const recordCount = [...generatedSource.matchAll(/"id":/gu)].length;
const categoryCounts = {
  bosses: [...generatedSource.matchAll(/"category": "bosses"/gu)].length,
  players: [...generatedSource.matchAll(/"category": "players"/gu)].length,
  sects: [...generatedSource.matchAll(/"category": "sects"/gu)].length,
};

assert.equal(recordCount, 30, "site character snapshot must keep 30 records");
assert.deepEqual(categoryCounts, { bosses: 5, players: 5, sects: 20 });
assert.equal(petImages.length, 30, "site character snapshot must keep 30 sprite previews");
assert.equal(petPackages.length, 30, "site character snapshot must keep 30 downloadable packages");
assert.equal(packageJson.scripts.predev, undefined, "dev must not auto-sync desktop project assets");

for (const id of ["player-01", "player-02", "boss-04", "player-04", "jx3-u4e03-u79c0-01"]) {
  assert.ok(heroSource.includes(`"${id}"`), `original hero pet ${id} must be retained`);
}
assert.doesNotMatch(heroSource, /staticOnly=/u, "hero must render the original full idle animations");

console.log("site resource snapshot tests passed");
