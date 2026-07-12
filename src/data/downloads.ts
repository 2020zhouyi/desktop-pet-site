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
    href: configuredMacUrl || localMacAsset?.publicPath || "",
    status: configuredMacUrl || localMacAsset?.publicPath ? "available" : "preview",
    asset: localMacRecord?.fileName,
  },
  {
    label: "Windows",
    detail: "已有实验构建，仍需更多透明窗口兼容验证",
    href: configuredWindowsUrl || localWindowsAsset?.publicPath || "",
    status:
      configuredWindowsUrl || localWindowsAsset?.publicPath || localWindowsRecord
        ? "preview"
        : "soon",
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
