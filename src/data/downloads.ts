import { releaseAssets } from "./releases.generated";

type DownloadTarget = {
  label: string;
  detail: string;
  href: string;
  status: "available" | "preview" | "soon";
  asset?: string;
};

const configuredMacUrl = import.meta.env.VITE_DESKTOP_PET_MAC_URL ?? "";
const configuredWindowsUrl = import.meta.env.VITE_DESKTOP_PET_WINDOWS_URL ?? "";
const defaultMacUrl = "https://github.com/2020zhouyi/desktop-pet/releases/download/v0.1.1/Desktop.Pet.MVP-0.1.1-mac-arm64.dmg";
const defaultWindowsUrl = "https://github.com/2020zhouyi/desktop-pet/releases/download/v0.1.1/Desktop.Pet.MVP-0.1.1-win-x64.exe";

const localMacRecord = releaseAssets.find((asset) => asset.kind === "macos");
const localMacAsset = releaseAssets.find((asset) => asset.kind === "macos" && asset.publicPath);
const localWindowsRecord = releaseAssets.find((asset) => asset.kind === "windows");
const localWindowsAsset = releaseAssets.find(
  (asset) => asset.kind === "windows" && asset.publicPath,
);

export const downloadTargets: DownloadTarget[] = [
  {
    label: "macOS",
    detail: "Apple Silicon / Intel，当前主验证平台",
    href: configuredMacUrl || localMacAsset?.publicPath || defaultMacUrl,
    status: "available",
    asset: localMacRecord?.fileName,
  },
  {
    label: "Windows",
    detail: "Windows x64 安装程序，安装完成后直接启动",
    href: configuredWindowsUrl || localWindowsAsset?.publicPath || defaultWindowsUrl,
    status: "available",
    asset: localWindowsRecord?.fileName,
  },
  {
    label: "Linux",
    detail: "计划中，优先等核心体验稳定后推进",
    href: "",
    status: "soon",
  },
];

export const releaseInventory = releaseAssets;
