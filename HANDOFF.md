# 项目交接文档（给接手的 AI / 开发者）

> 由上一任 AI 编写于 2026-08-10。接手前请先完整阅读本文件。

## 一、这是什么项目

**健康提醒（Health Reminder Neon）** —— Windows 桌面应用：久坐/喝水/护眼提醒。
fork 自 [kaima2022/Health-reminder](https://github.com/kaima2022/Health-reminder)（MIT 协议，LICENSE 文件必须保留）。

本 fork 的核心特色：
1. **霓虹灯边框提醒**：到点屏幕四边亮起彩色灯带（多屏支持、逆时针环绕、实心底带+半椭圆波浪、6 秒、鼠标穿透）
2. **提醒弹窗**：右上角弹出"请走动一会/请喝水/请远眺/XX提醒"，不抢键盘焦点、鼠标穿透、12 秒自动消失
3. **提醒自动循环**：提醒后自动重置计时，无需点击
4. **22 点后自动退出，次日早上 8 点通过 Windows 计划任务静默启动**

## 二、文件位置（都在 Windows 机器上）

| 用途 | 路径 |
|---|---|
| **源码** | `d:\桌面\test\Health-reminder-src\` |
| 构建产物（exe/安装包） | `d:\桌面\test\Health-reminder-src\src-tauri\target\release\` |
| 最新安装包（桌面） | `d:\桌面\健康提醒-霓虹灯版-安装包.exe` |
| **已安装应用** | `E:\health-reminder-neon\health-reminder.exe`（升级=直接复制 exe 覆盖） |
| 用户设置 | `%APPDATA%\desk-reminder\settings.json` |
| 调试日志 | `%APPDATA%\desk-reminder\debug.log`（代码里 debug_log 命令写入） |
| 版本备份 v5 | `d:\桌面\test\backup-v5\`（源码+安装包） |
| 版本备份 v9 | `d:\桌面\test\backup-v9\`（源码+安装包，**外观基准版**） |

## 三、技术栈与构建

- Tauri 2 + Rust（后端，`src-tauri/`）+ Vite + 原生 JS（前端，`src/`）
- 构建环境：Node v24 ✅、Rust MSVC 1.97 ✅（本机已装好；`~/.cargo/bin` 在 PATH 里）
- 构建命令：
  ```bash
  cd "d:\桌面\test\Health-reminder-src"
  npm run tauri build     # 产物在 src-tauri/target/release/bundle/nsis/
  ```
- 升级安装：**不要依赖 NSIS 安装器（静默安装偶发卡死）**，直接复制
  `src-tauri\target\release\health-reminder.exe` 覆盖 `E:\health-reminder-neon\health-reminder.exe`，
  再 taskkill 旧进程后启动即可。

## 四、关键文件地图

| 文件 | 职责 |
|---|---|
| `src-tauri/src/lib.rs` | 后端全部逻辑：计时循环（每秒 tick）、**霓虹窗口**（`ensure_neon_overlay`/`show_neon_overlay`，多屏，异步线程创建防死锁）、**提醒弹窗**（`ensure_reminder_popup`/`show_reminder_popup`）、**22 点退出**（计时循环内）、调试日志 `debug_log` |
| `neon.html` | 霓虹灯效果页（纯 CSS/JS，无框架）。波浪遮罩由 JS 生成 SVG data-URI（`waveMaskURI`），动画方向：上←左↓下→右↑（逆时针） |
| `popup.html` | 提醒弹窗页（监听 `popup-show` 事件显示文案，12s 自动隐藏） |
| `src/main.js` | 前端主逻辑：`triggerNotification`（提醒触发→弹窗+自动重置）、`completeReminderAndReset`、`showNeonReminder`（invoke 霓虹）、`dbgLog`（日志） |
| `src-tauri/capabilities/main.json` | 窗口权限（含 neon-overlay-*、reminder-popup） |
| `vite.config.js` | 多页面入口（index/neon/popup） |
| `src-tauri/tauri.conf.json` | productName=health-reminder-neon，**自动更新已禁用** |

## 五、关键设计决策（改代码前必读）

1. **创建窗口必须在异步线程**（`tauri::async_runtime::spawn`）：
   同步命令跑在主线程，直接 `WebviewWindowBuilder::build()` 会死锁冻结整个界面
   ——曾因此出过大 bug（霓虹不显示+提醒流程卡死），`show_neon_overlay` 里注释了原因，不要"优化"回同步。
2. **霓虹窗口**：不用 fullscreen（Windows 透明+全屏会黑屏），用显示器实际尺寸定位；
   `set_ignore_cursor_events(true)` 让鼠标穿透（用户要求闪烁时能操作）。
3. **提醒弹窗**：`focused(false)` 不抢键盘焦点（用户要求打字不被打断）。
4. **22 点退出**：`EXITED` 标记必须"先判断时间再置位"，否则永远不退出（出过此 bug，修复在 git 历史）。
5. **霓虹外观演进史**：mask 渐变边框 → 4 光条 → 正弦起伏（用户否）→ 实心底带+半椭圆（v9，用户认可）→ v10 加了平滑渐变+管芯高光（**用户否，退回 v9**）→ 现版本 = v9 外观 + 逆时针方向。
   用户审美偏好：**实心底带+半椭圆波浪、8 色渐变、不要管芯高光**。改外观前先问用户。
6. **调试日志**：`debug_log`/`dbgLog` 全链路埋点写入 `%APPDATA%\desk-reminder\debug.log`，排查问题靠它。

## 六、当前版本状态

- 当前开发版已升级为 **1.8.3**：移除在线检查更新入口；将确认后的 v13 一体式连续波浪 + 5.8 秒呼吸灯合入 `neon.html`；Windows 空闲判断新增默认播放设备声音检测（有声音不进入空闲，停止播放后重新累计）
- **1.8.4** 修复锁屏倒计时加速：后端只保留 pending queue 单通道投递，前端增加锁屏启动互斥，并按绝对结束时间计算剩余秒数，避免多个任务同秒到点时叠加计时器
- **1.8.5（仅本地，暂未推送 GitHub）** 增加 Windows 每天 08:00 自动启动计划任务（静默进托盘、错过后补启动、允许从睡眠唤醒），并增加单实例保护，避免计划任务与已运行程序形成双进程
- GitHub 发布：`.github/workflows/release.yml` 在推送 `v*` 标签时自动构建 Windows x64 安装包、便携版 ZIP 和 `SHA256SUMS.txt`，并上传到 Releases；GitHub 自动生成的 Source code ZIP 不包含 EXE
- git 分支 `master`，最新提交 = "霓虹灯运动方向统一为逆时针（外观保持 v9）"
- git 标签 `v9` = 外观冻结版（可 `git checkout v9 -- neon.html` 恢复外观）
- 提交身份是占位（health-reminder-neon），用户尚未推送 GitHub（教程已给，用户可能随时推送）

## 七、已知问题 / 待办

- [ ] NSIS 安装器静默安装偶发卡死（已知，用 exe 覆盖法绕开）
- [ ] 用户设置里任务标题/描述是乱码（数据损坏，用户未提，勿主动改）
- [ ] 护眼任务间隔目前是 1 分钟（用户测试用，可提醒改回）
- [ ] `debug_log` 埋点发布后可选清理
- [ ] 若用户推送 GitHub：仓库内已有 README（含 fork 声明），无敏感信息

## 八、协作注意

- **用户是计算机新手**：解释要通俗、中文、带具体路径；每次改动后交付"桌面安装包 + 运行版"两个结果；改完让用户实测（设置里点"测试"按钮可预览霓虹灯）。
- 改动流程惯例：先备份/打 tag → 改 → 无头 Edge 截图验证（`msedge --headless --screenshot` + PowerShell 像素分析脚本在 `d:\桌面\test\` 下）→ 编译 → 覆盖安装 → git 提交。
- 用户口头禅："冻结这一版方便回退"——大改动前先问是否备份。
