# Desktop Pet Site

一个独立的极简剑三桌宠展示站，只保留角色浏览和下载。

- 所有角色只展示待机动画；
- 桌面端每页展示 10 个角色，平板 8 个，手机 4 个；
- 使用上一组、下一组或页点流畅切换；
- 支持全部、门派、玩家和首领分类。
- 每张角色卡片都可以下载可导入桌宠的完整 ZIP；
- 页头和页脚提供 [GitHub 项目](https://github.com/2020zhouyi/desktop-pet)入口。

## Run

```sh
npm install
npm run dev
```

本地开发启动前会自动运行：

```sh
npm run prepare-assets
```

它会从 `../desktop-pet-mvp/pets`：

- 生成网站使用的待机动画预览和轻量首帧；
- 在 `public/generated/pet-packages/` 生成完整角色 ZIP；
- 保留原始 `pet.json` 和完整 `1536 × 1872` spritesheet，解压后可以复制到桌宠用户宠物目录。

同时会从 `../desktop-pet-mvp/release` 读取桌宠安装包元数据。

页面首屏只立即加载当前角色的完整待机动画，其余角色先使用首帧；图鉴动画会在接近视口时加载，并在离开视口后暂停。

生产构建直接使用仓库中已经生成的资源，不依赖相邻的桌宠项目：

```sh
npm run build
```

需要刷新角色资源并构建时使用：

```sh
npm run build:refresh-assets
```

## Downloads

桌宠安装包默认链接到 `desktop-pet` 仓库的公开 GitHub Release。也可以用环境变量临时覆盖：

```sh
VITE_DESKTOP_PET_MAC_URL=https://example.com/DesktopPet.dmg
VITE_DESKTOP_PET_WINDOWS_URL=https://example.com/DesktopPet.zip
```

本地预览如需临时把 release 复制到 `public/generated/downloads/`：

```sh
DESKTOP_PET_SITE_COPY_RELEASE=1 npm run prepare-assets
```

这个目录已被 `.gitignore` 忽略，避免误提交大体积安装包。

## GitHub Pages

`main` 分支每次推送都会通过 GitHub Actions 构建并发布站点。项目级 Pages 的基础路径由工作流中的 `VITE_BASE_PATH` 设置。
