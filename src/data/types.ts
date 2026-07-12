export type SitePet = {
  id: string;
  displayName: string;
  description: string;
  spriteUrl: string;
  posterUrl: string;
  downloadUrl: string;
  stateRow: number;
  category: "sects" | "players" | "bosses";
  categoryLabel: string;
  theme: {
    accent: string;
    accentSoft: string;
    accentDeep: string;
    accentText: string;
  };
};

export type ReleaseAsset = {
  fileName: string;
  kind: "macos" | "windows" | "linux" | "other";
  sizeMb: number;
  publicPath: string;
};
