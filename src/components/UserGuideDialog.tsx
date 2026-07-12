import { BookOpen, Download, FolderOpen, MousePointer2, X } from "lucide-react";
import { useRef } from "react";

export function UserGuideDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openGuide = () => dialogRef.current?.showModal();
  const closeGuide = () => dialogRef.current?.close();

  return (
    <>
      <button className="guide-trigger" onClick={openGuide} ref={triggerRef} type="button">
        <BookOpen size={17} />使用说明
      </button>

      <dialog
        aria-labelledby="guide-title"
        className="user-guide-dialog"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeGuide();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeGuide();
          }
        }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="guide-page">
          <header className="guide-header">
            <div>
              <span>DESKTOP PET MANUAL · V0.1</span>
              <h2 id="guide-title">剑三小桌宠使用说明</h2>
            </div>
            <button aria-label="关闭使用说明" className="guide-close" onClick={closeGuide} type="button"><X /></button>
          </header>

          <div className="guide-body">
            <section className="guide-intro">
              <p>下载、启动、选择角色，然后让小宠物安静待在电脑桌面上。</p>
              <div className="guide-index" aria-label="说明目录">
                <a href="#guide-install">01 安装启动</a>
                <a href="#guide-controls">02 基本操作</a>
                <a href="#guide-pets">03 选择与导入</a>
                <a href="#guide-copy">04 修改台词</a>
                <a href="#guide-faq">05 常见问题</a>
              </div>
            </section>

            <GuideSection icon={<Download />} index="01" title="下载与首次启动" id="guide-install">
              <div className="guide-platforms">
                <article>
                  <strong>macOS</strong>
                  <p>下载 mac-arm64 DMG。打开后将应用拖入“应用程序”，再启动桌宠。</p>
                  <p>当前版本未进行 Apple 签名和公证。如果系统阻止启动，请前往“系统设置 → 隐私与安全性”，确认仍要打开。</p>
                </article>
                <article>
                  <strong>Windows</strong>
                  <p>下载 win-x64 ZIP，完整解压后再打开应用。不要直接在压缩包预览窗口中运行。</p>
                </article>
              </div>
            </GuideSection>

            <GuideSection icon={<MousePointer2 />} index="02" title="基本操作" id="guide-controls">
              <div className="guide-control-grid">
                <article><kbd>悬停</kbd><p>角色播放跳跃动作。</p></article>
                <article><kbd>单击</kbd><p>播放点击反馈，并显示一句角色气泡。</p></article>
                <article><kbd>拖拽</kbd><p>移动桌宠；向左、向右拖动会播放对应方向动作。</p></article>
                <article><kbd>右下角</kbd><p>拖动角色右下角的手柄，调整桌宠大小。</p></article>
                <article><kbd>右键</kbd><p>打开“选择宠物 / 退出”菜单。</p></article>
              </div>
            </GuideSection>

            <GuideSection icon={<FolderOpen />} index="03" title="选择、导入与删除角色" id="guide-pets">
              <ol className="guide-steps">
                <li><span>1</span><p>右键桌宠，选择“选择宠物…”。</p></li>
                <li><span>2</span><p>点击卡片预览角色，再点击“确认使用”。选择结果和角色大小会自动保存。</p></li>
                <li><span>3</span><p>需要导入角色时，点击选择窗口右上角的“管理宠物”，打开用户宠物目录。</p></li>
              </ol>
              <div className="guide-paths">
                <p><strong>macOS</strong><code>~/Library/Application Support/desktop-pet-mvp/pets/</code></p>
                <p><strong>Windows</strong><code>%APPDATA%\desktop-pet-mvp\pets\</code></p>
              </div>
              <div className="guide-note">
                <strong>导入规则</strong>
                <p>先解压角色 ZIP，再把包含 <code>pet.json</code> 和 <code>spritesheet.webp</code> 的完整角色文件夹复制到宠物目录。不要把 ZIP 文件本身直接放进去。</p>
                <p>Codex 创建的角色通常位于 <code>~/.codex/pets/&lt;pet-id&gt;/</code>，复制完整文件夹即可。</p>
              </div>
              <p>删除角色时，直接从用户宠物目录删除对应文件夹。如果删掉当前角色，应用会自动切换到其他可用角色。</p>
            </GuideSection>

            <GuideSection index="04" title="修改角色名称与气泡台词" id="guide-copy">
              <p>使用文本编辑器打开角色文件夹中的 <code>pet.json</code>。常用字段包括角色名称、标签和四类气泡：</p>
              <pre aria-label="宠物台词 JSON 示例"><code>{`{
  "displayName": "我的角色",
  "tags": ["玩家", "七秀"],
  "bubbleLines": {
    "welcome": ["我来啦，今天也一起加油。"],
    "click": ["我在呢。"],
    "drag": ["要搬去哪里？"],
    "petSwitch": ["换好啦，这次由我陪你。"]
  }
}`}</code></pre>
              <p>每类台词必须写成字符串数组。保存后重新打开选择窗口，必要时重启桌宠。</p>
            </GuideSection>

            <GuideSection index="05" title="常见问题" id="guide-faq">
              <div className="guide-faq-list">
                <details><summary>为什么点不到角色周围的透明区域？</summary><p>这是正常行为。透明区域会把点击传递给桌面或下方窗口，只有可见角色区域会响应操作。</p></details>
                <details><summary>导入角色后没有立即出现？</summary><p>回到宠物选择窗口。窗口重新获得焦点时会刷新资源；必要时关闭并重新打开选择窗口。</p></details>
                <details><summary>如何完全退出桌宠？</summary><p>右键角色，在菜单中选择“退出”。</p></details>
                <details><summary>为什么 macOS 首次启动会提示风险？</summary><p>当前本地构建没有 Apple 签名和公证，请确认安装包来源后，在“隐私与安全性”中手动允许打开。</p></details>
              </div>
            </GuideSection>
          </div>
        </div>
      </dialog>
    </>
  );
}

function GuideSection({ children, icon, id, index, title }: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  id: string;
  index: string;
  title: string;
}) {
  return (
    <section className="guide-section" id={id}>
      <div className="guide-section-title">
        <span>{index}</span>
        {icon ? <i aria-hidden="true">{icon}</i> : null}
        <h3>{title}</h3>
      </div>
      <div className="guide-section-content">{children}</div>
    </section>
  );
}
