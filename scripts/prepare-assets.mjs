import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const siteRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(siteRoot, "..");
const petsRoot = path.join(workspaceRoot, "desktop-pet-mvp", "pets");
const releaseRoot = path.join(workspaceRoot, "desktop-pet-mvp", "release");

const generatedPetsDir = path.join(siteRoot, "public", "generated", "pets");
const generatedPetPackagesDir = path.join(siteRoot, "public", "generated", "pet-packages");
const generatedDownloadsDir = path.join(siteRoot, "public", "generated", "downloads");
const generatedPetsFile = path.join(siteRoot, "src", "data", "pets.generated.ts");
const generatedReleasesFile = path.join(siteRoot, "src", "data", "releases.generated.ts");

const playerPetOrder = [
  "shaling",
  "snowfeather",
  "wanhua",
  "xiutai",
  "duling",
  "mingyue-shi",
];

await mkdir(generatedPetsDir, { recursive: true });
await mkdir(generatedPetPackagesDir, { recursive: true });
await mkdir(generatedDownloadsDir, { recursive: true });
await rm(generatedPetsDir, { recursive: true, force: true });
await rm(generatedPetPackagesDir, { recursive: true, force: true });
await mkdir(generatedPetsDir, { recursive: true });
await mkdir(generatedPetPackagesDir, { recursive: true });

const pets = [];
const petPackageJobs = [];
const petFolders = await readdir(petsRoot, { withFileTypes: true });
const petIds = petFolders
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort(sortPetIds);

for (const id of petIds) {
  const manifestPath = path.join(petsRoot, id, "pet.json");
  const rawManifest = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(rawManifest);
  const sourceSprite = path.join(petsRoot, id, manifest.spritesheetPath);
  const spriteName = `${id}.webp`;
  const targetSprite = path.join(generatedPetsDir, spriteName);
  await writeIdlePreview(sourceSprite, targetSprite);
  const packageName = `${id}.zip`;
  const targetPackage = path.join(generatedPetPackagesDir, packageName);

  const category = id.startsWith("boss-") ? "bosses" : id.startsWith("jx3-") ? "sects" : "players";
  const categoryLabel = category === "bosses" ? "首领" : category === "sects" ? "门派" : "玩家";
  const theme = await extractPetTheme(sourceSprite, manifest.siteThemeAccent);

  pets.push({
    id: manifest.id,
    displayName: manifest.displayName,
    description: compactDescription(manifest.description),
    spriteUrl: `generated/pets/${spriteName}`,
    downloadUrl: `generated/pet-packages/${packageName}`,
    stateRow: 0,
    category,
    categoryLabel,
    theme,
  });

  petPackageJobs.push({
    displayName: manifest.displayName,
    manifestPath,
    sourceSprite,
    spriteRelativePath: manifest.spritesheetPath,
    targetPackage,
  });
}

await writePetPackages(petPackageJobs);

await writeFile(
  generatedPetsFile,
  [
    "import type { SitePet } from \"./types\";",
    "",
    "const generatedPets: SitePet[] =",
    JSON.stringify(pets, null, 2),
    ";",
    "",
    "const basePath = import.meta.env.BASE_URL;",
    "",
    "export const featuredPets: SitePet[] = generatedPets.map((pet) => ({",
    "  ...pet,",
    "  spriteUrl: `${basePath}${pet.spriteUrl}`,",
    "  downloadUrl: `${basePath}${pet.downloadUrl}`,",
    "}));",
    "",
  ].join("\n"),
);

const releases = await scanReleases();
await writeFile(
  generatedReleasesFile,
  [
    "import type { ReleaseAsset } from \"./types\";",
    "",
    "export const releaseAssets: ReleaseAsset[] =",
    JSON.stringify(releases, null, 2),
    ";",
    "",
  ].join("\n"),
);

console.log(`Prepared ${pets.length} pet previews and ${releases.length} release records.`);

function compactDescription(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "本地桌宠素材，适配 8x9 动画状态。";
  }
  return value.replace(/\s+/g, " ").trim();
}

function sortPetIds(a, b) {
  const aPlayerIndex = playerPetOrder.indexOf(a);
  const bPlayerIndex = playerPetOrder.indexOf(b);
  const aIsPlayer = aPlayerIndex !== -1 || !a.startsWith("jx3-");
  const bIsPlayer = bPlayerIndex !== -1 || !b.startsWith("jx3-");

  if (aIsPlayer && bIsPlayer) {
    const safeA = aPlayerIndex === -1 ? Number.MAX_SAFE_INTEGER : aPlayerIndex;
    const safeB = bPlayerIndex === -1 ? Number.MAX_SAFE_INTEGER : bPlayerIndex;
    return safeA - safeB || a.localeCompare(b);
  }

  if (aIsPlayer !== bIsPlayer) return aIsPlayer ? -1 : 1;
  return a.localeCompare(b);
}

async function writeIdlePreview(sourcePath, targetPath) {
  await execFileAsync("python3", [
    "-c",
    [
      "from PIL import Image",
      "import sys",
      "source, target = sys.argv[1], sys.argv[2]",
      "image = Image.open(source).convert('RGBA')",
      "idle = image.crop((0, 0, min(1536, image.width), min(208, image.height)))",
      "idle.save(target, 'WEBP', lossless=True, method=6)",
    ].join("\n"),
    sourcePath,
    targetPath,
  ]);
}

async function writePetPackages(jobs) {
  await execFileAsync("python3", [
    "-c",
    [
      "import json, re, sys, zipfile",
      "from pathlib import PurePosixPath",
      "jobs = json.loads(sys.argv[1])",
      "for job in jobs:",
      "    root = re.sub(r'[<>:\"/\\\\|?*\\x00-\\x1f]', '_', str(job['displayName'])).strip(' .') or 'pet'",
      "    relative = PurePosixPath(str(job['spriteRelativePath']).replace('\\\\', '/'))",
      "    if relative.is_absolute() or '..' in relative.parts:",
      "        raise ValueError(f'Unsafe spritesheet path: {relative}')",
      "    with zipfile.ZipFile(job['targetPackage'], 'w') as archive:",
      "        archive.write(job['manifestPath'], f'{root}/pet.json', compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)",
      "        archive.write(job['sourceSprite'], f'{root}/{relative.as_posix()}', compress_type=zipfile.ZIP_STORED)",
    ].join("\n"),
    JSON.stringify(jobs),
  ]);
}

async function extractPetTheme(spritePath, override) {
  try {
    const { stdout } = await execFileAsync("python3", [
      "-c",
      [
        "from PIL import Image",
        "import colorsys, json, sys",
        "source, override = sys.argv[1], sys.argv[2]",
        "img = Image.open(source).convert('RGBA').crop((0, 0, 192, 208)).resize((64, 70))",
        "buckets = {}",
        "for r,g,b,a in img.getdata():",
        "    if a < 165: continue",
        "    h,s,v = colorsys.rgb_to_hsv(r/255,g/255,b/255)",
        "    if s < .18 or v < .15 or v > .92: continue",
        "    key = (round(h*18)%18, round(s*5), round(v*5))",
        "    buckets.setdefault(key, [0,0,0,0])",
        "    buckets[key][0] += 1",
        "    buckets[key][1] += r",
        "    buckets[key][2] += g",
        "    buckets[key][3] += b",
        "if override:",
        "    accent = override",
        "elif buckets:",
        "    key, data = max(buckets.items(), key=lambda item: item[1][0] * (.55 + item[0][1]/5*.3 + (1-abs(item[0][2]/5-.58))*.15))",
        "    n = data[0]; accent = '#%02x%02x%02x' % (data[1]//n, data[2]//n, data[3]//n)",
        "else:",
        "    accent = '#8b5b4a'",
        "def rgb(hexv): return tuple(int(hexv[i:i+2],16) for i in (1,3,5))",
        "def hx(values): return '#%02x%02x%02x' % tuple(max(0,min(255,round(v))) for v in values)",
        "base = rgb(accent)",
        "soft = hx(tuple(v*.14 + w*.86 for v,w in zip(base,(255,250,242))))",
        "deep = hx(tuple(v*.56 for v in base))",
        "print(json.dumps({'accent': accent, 'accentSoft': soft, 'accentDeep': deep, 'accentText': deep}))",
      ].join("\n"),
      spritePath,
      typeof override === "string" ? override : "",
    ]);
    return JSON.parse(stdout);
  } catch {
    return { accent: "#8b5b4a", accentSoft: "#efe5dc", accentDeep: "#4e3329", accentText: "#4e3329" };
  }
}

async function scanReleases() {
  try {
    const entries = await readdir(releaseRoot);
    const releaseFiles = entries.filter((entry) => {
      return /\.(dmg|exe|zip)$/i.test(entry) && !entry.endsWith(".blockmap");
    });

    const shouldCopy = process.env.DESKTOP_PET_SITE_COPY_RELEASE === "1";
    if (shouldCopy) {
      await rm(generatedDownloadsDir, { recursive: true, force: true });
      await mkdir(generatedDownloadsDir, { recursive: true });
    }

    const assets = [];
    for (const fileName of releaseFiles) {
      const sourcePath = path.join(releaseRoot, fileName);
      const stats = await stat(sourcePath);
      const kind = classifyRelease(fileName);
      let publicPath = "";

      if (shouldCopy) {
        const targetPath = path.join(generatedDownloadsDir, fileName);
        await copyFile(sourcePath, targetPath);
        publicPath = `generated/downloads/${encodeURIComponent(fileName)}`;
      }

      assets.push({
        fileName,
        kind,
        sizeMb: Math.round((stats.size / 1024 / 1024) * 10) / 10,
        publicPath,
      });
    }

    return assets.sort((a, b) => a.fileName.localeCompare(b.fileName));
  } catch {
    return [];
  }
}

function classifyRelease(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.includes("mac") || lower.includes("darwin")) return "macos";
  if (lower.includes("win")) return "windows";
  if (lower.includes("linux")) return "linux";
  return "other";
}
