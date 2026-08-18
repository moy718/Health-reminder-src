# 健康提醒（Health Reminder Neon）🍀

久坐 / 喝水 / 护眼 健康提醒桌面应用 —— 用 **霓虹灯边框 + 不打断打字的弹窗** 提醒你起来活动。

> 本项目 fork 自 [kaima2022/Health-reminder](https://github.com/kaima2022/Health-reminder)（MIT 协议），
> 感谢原作者的开源贡献。本 fork 在原版基础上做了体验增强，详见下方「主要改动」。

## ✨ 特色

- 🎇 **霓虹灯边框提醒**：到点时屏幕四周亮起彩色霓虹灯带——彩虹色流光 + 半椭圆波浪滚动（支持**多显示器**，每块屏幕都显示）
- 💬 **不打断打字的提醒弹窗**：右上角弹出任务提醒（久坐→"请走动一会"、喝水→"请喝水"、护眼→"请远眺"、其他→"XX提醒"），**不抢键盘焦点**，你正在打字完全不受影响，12 秒后自动消失
- 🔄 **提醒自动循环**：提醒弹出后自动进入下一轮计时，无需手动点击，永不卡住
- 🌙 **作息自动化**：22 点自动退出，次日早上 8 点静默启动并进入托盘
- 🪟 **保留电脑画面**：锁屏使用独立透明层，桌面和当前应用仍作为实时背景显示
- 其余继承原版功能：强制锁屏休息、空闲检测（离开电脑且没有声音时暂停计时）、悬浮窗、托盘菜单、统计打卡、中英双语等

## 🚀 使用

到 [Releases](../../releases/latest) 页面下载 Windows 版本：

| 文件 | 用途 |
| --- | --- |
| `health-reminder-neon_*_windows-x64-setup.exe` | Windows 10/11 64 位安装包，推荐普通用户使用 |
| `health-reminder-neon_*_windows-x64-portable.zip` | 免安装便携版，解压后运行其中的 EXE |
| `SHA256SUMS.txt` | 下载文件的 SHA-256 完整性校验值 |

> GitHub 自动显示的 `Source code (zip)` 和 `Source code (tar.gz)` 只包含源码，不是 Windows 安装包，因此其中没有 EXE。需要直接使用软件的用户应下载上表中的安装包或便携版。

双击安装包完成安装即可。首次运行便携版时，Windows 可能显示安全提示，这是因为个人开源版本没有购买商业代码签名证书；请确认下载地址来自本仓库后再运行。

## 🛠️ 从源码构建

环境要求：Node.js 18+、Rust（stable）、Windows 10/11

```bash
npm install
npm run tauri dev      # 开发调试
npm run tauri build    # 打包安装包（输出在 src-tauri/target/release/bundle/）
```

维护者发布新版本时，应先同步 `package.json`、`src-tauri/Cargo.toml` 和 `src-tauri/tauri.conf.json` 中的版本号，再创建并推送同版本标签（例如 `v1.8.4`）。GitHub Actions 会自动构建 Windows 安装包、便携版及校验文件并附加到 Release。

## 📄 主要改动（相对原版）

1. 提醒方式改为**屏幕边框霓虹灯**：透明置顶窗口 + CSS 渐变流光 + 半椭圆波浪滚动，支持双屏
2. 新增**提醒弹窗**：任务专属文案，`focused(false)` 不抢焦点，鼠标穿透，自动隐藏
3. 提醒**自动重置**：无需点击"我知道了"，计时自动进入下一轮
4. **22 点自动退出、早上 8 点自动启动**（8 点任务会在错过时间后尽快补启动）
5. 移除在线检查更新入口（本项目不发布在线版本）
6. Windows 空闲检测加入声音活动判断：默认播放设备有声音时保持工作状态，声音停止后重新累计空闲时间
7. 修复：提醒触发时创建窗口导致主线程死锁、界面卡死的问题
8. 修复：多个任务同秒触发时锁屏倒计时叠加，导致真实 1 秒却减少 2 秒的问题

## ⚖️ 协议

MIT License —— 保留原项目版权声明（见 [LICENSE](LICENSE)）。

## 🙏 致谢

- [kaima2022/Health-reminder](https://github.com/kaima2022/Health-reminder) —— 本项目的基础
