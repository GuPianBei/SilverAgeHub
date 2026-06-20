# 银发纪 UI 部阶段交接单

更新时间：2026-06-20

## 当前阶段

研发稳定架构和真实云端联调已经完成，现在进入 MVP 适老化 UI/UX 优化阶段。

功能基线已跑通，UI 部应在现有页面和交互结构上优化，不重构业务架构。

## 开始前必须读取

1. `docs/handoff/CURRENT_HANDOFF.md`
2. `docs/handoff/UI_HANDOFF.md`
3. `docs/operations/AI部门运行与上下文隔离规则.md`
4. `docs/departments/03_UI部指令.md`
5. `docs/departments/04_MVP验收清单.md`

## 已验证功能基线

- 首页可进入教程和课程
- 教程列表、教程详情正常
- 课程列表、课程详情正常
- 预约表单提交正常
- 我的预约可显示当前用户预约
- 新预约默认状态为 `未确认`
- 管理端更新后，用户端可刷新为 `已确认`
- 管理员 OpenID 白名单授权正常
- 管理端教程新增、编辑、删除正常
- 管理端课程新增、编辑、删除正常
- `userApi`、`adminApi` 已真实部署并验证

正式云函数版本：

```text
2026-06-18-stable-v1
```

## 本轮 UI 部唯一目标

在不改变业务逻辑和稳定架构的前提下，完成用户端 MVP 页面的适老化视觉统一、信息层级优化和交互状态检查，并对管理端做必要的可用性整理。

优先处理用户端，管理端以清晰可操作为准，不做后台系统式重设计。

## 页面范围

用户端：

- `miniprogram/pages/index/`
- `miniprogram/pages/guides/list/`
- `miniprogram/pages/guides/detail/`
- `miniprogram/pages/courses/list/`
- `miniprogram/pages/courses/detail/`
- `miniprogram/pages/orders/create/`
- `miniprogram/pages/mine/index/`

管理端：

- `miniprogram/admin/pages/index/`

可统一调整：

- `miniprogram/app.wxss`
- 现有公共样式或纯展示组件

## 文件修改权限

UI 部可直接修改：

- 页面 `.wxml`
- 页面 `.wxss`
- `app.wxss`
- 纯视觉图片与图标资源
- 不影响字段和接口的展示文案

修改以下内容前必须通知研发部：

- 页面 `.js`
- `services/`
- `utils/`
- `app.js`
- `app.json`
- `cloudfunctions/`
- `database/`
- 页面跳转路径、表单字段、状态值和接口参数

## 绝对禁止

- 不修改 `userApi`、`adminApi` 调用关系
- 不恢复旧 `guide`、`course`、`order`、`admin` 云函数入口
- 不修改既定字段名
- 不改变 `{ code, message, data }` 响应结构
- 不把管理端移回用户主包
- 不新增 Web 管理后台
- 不增加社交、聊天、AI、数字人或推荐功能
- 不删除加载、空状态、错误状态和提交反馈
- 不因视觉改造破坏已经跑通的业务链路

## 适老化硬指标

- 正文字号不低于 `32rpx`
- 辅助文字也应保持清晰，避免过浅灰色
- 主要按钮高度不低于 `88rpx`，推荐 `96rpx`
- 点击区域足够大，避免相邻按钮误触
- 正文行高建议不低于 `1.5`
- 卡片、输入框、按钮保持明显边界
- 同一层级颜色、圆角、阴影和间距统一
- 页面一次突出一个主要任务
- 不依赖纯颜色表达预约状态
- 文案使用短句，避免技术词

## 页面优化优先级

### P0：用户主链路

1. 首页
   - 第一屏明确展示“银发纪”
   - “看教程”“约课程”作为两个最醒目的入口
   - 避免营销式长页面和无意义装饰

2. 教程与课程列表
   - 强化标题、分类、时间、地点的信息层级
   - 整张卡片应容易识别为可点击区域
   - 空状态、加载状态和错误状态样式统一

3. 详情与预约
   - 教程正文优先保证阅读舒适
   - 课程时间、地点、人数上限清晰分组
   - “我要报名”必须是页面主按钮
   - 姓名、电话输入框和提交反馈清楚

4. 我的预约
   - 状态使用文字和视觉标签共同表达
   - `未确认`、`已确认`、`完成`三种状态需易于区分
   - 保持预约卡片之间有足够留白

### P1：管理端可用性

- 当前“教程管理”白色卡片实际是资源选择器，但可点击特征不明显
- 应增加下拉箭头、切换提示或更明确的选择器样式
- 教程、课程、预约三个管理模块必须容易发现
- 保存、删除、状态更新需有清晰的主次和危险操作区分
- 不做复杂侧边栏、仪表盘或 Web 后台式改造

## 已观察到但不能由 UI 部单独修改的问题

### 我的预约突出课程编号

当前预约卡片主要展示 `courseId`，老年用户更容易理解课程名称。

这可能涉及课程数据关联或 JS 展示逻辑。UI 部可以提供版式方案，但修改前必须交研发部评估，不能自行调整字段或接口。

### 管理入口发布策略

当前 `miniprogram/utils/config.js` 中：

```js
enableAdminEntry: true
```

这是联调状态。UI 阶段可保留入口方便验收，正式发布前由研发部改为 `false`。

## 每页必须检查的状态

- 正常数据
- 加载中
- 空数据
- 加载失败
- 表单校验失败
- 提交中
- 提交成功
- 提交失败
- 无管理员权限

不能只设计有数据时的理想页面。

## UI 完成后的回归链路

1. 打开首页
2. 进入教程列表
3. 打开教程详情
4. 进入课程列表
5. 打开课程详情
6. 点击报名
7. 填写姓名和电话
8. 提交预约
9. 在“我的预约”看到 `未确认`
10. 进入管理端并切换三个管理模块
11. 更新预约状态
12. 用户端刷新后看到 `已确认`

通过标准：

- 无白屏、错位和文字截断
- 页面跳转与返回正常
- 表单仍可输入和提交
- 管理选择器、编辑、删除和状态更新仍可操作
- 云函数调用和字段没有变化

## UI 部交付格式

```text
已优化页面：
修改文件：
适老化指标检查：
加载/空/错误状态检查：
用户主链路回归结果：
管理端操作回归结果：
涉及 JS 或业务逻辑的建议：
未完成事项：
风险：
下一窗口第一步：
```

## UI 部新窗口启动指令

```text
你是「银发纪」UI 部，本窗口只负责已跑通 MVP 的适老化 UI/UX 优化。

开始前只读取：
1. docs/handoff/CURRENT_HANDOFF.md
2. docs/handoff/UI_HANDOFF.md
3. docs/operations/AI部门运行与上下文隔离规则.md
4. docs/departments/03_UI部指令.md
5. docs/departments/04_MVP验收清单.md

先扫描当前页面 WXML/WXSS，并用不超过 10 行复述现状。
本轮优先优化用户端主链路，管理端只做必要的可用性整理。
以 WXML/WXSS 修改为主；任何 JS、service、云函数、字段或跳转逻辑修改，必须先通知研发部。
不要改变 userApi/adminApi 稳定架构，不新增功能，不新增 Web 管理后台。
每完成一组页面就编译并回归对应业务链路，完成后按 UI_HANDOFF.md 的格式交付。
```

## 2026-06-20 UI 部阶段交付

```text
已优化页面：
- 用户端：首页、教程列表、教程详情、课程列表、课程详情、预约表单、我的预约
- 管理端：首页选择器与操作按钮层级

修改文件：
- miniprogram/app.wxss
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss
- miniprogram/pages/guides/list/index.wxml
- miniprogram/pages/guides/list/index.wxss
- miniprogram/pages/guides/detail/index.wxml
- miniprogram/pages/guides/detail/index.wxss
- miniprogram/pages/courses/list/index.wxml
- miniprogram/pages/courses/list/index.wxss
- miniprogram/pages/courses/detail/index.wxml
- miniprogram/pages/courses/detail/index.wxss
- miniprogram/pages/orders/create/index.wxml
- miniprogram/pages/orders/create/index.wxss
- miniprogram/pages/mine/index/index.wxml
- miniprogram/pages/mine/index/index.wxss
- miniprogram/admin/pages/index/index.wxml
- miniprogram/admin/pages/index/index.wxss

适老化指标检查：
- 全局正文字号保持 32rpx 及以上，少量标签/提示为 30rpx
- 用户端主按钮保持 96rpx；管理端主要操作按钮提升到 88rpx
- 首页双入口改为纵向大触区；列表卡片补充可进入提示
- 教程正文与课程介绍提升到 34rpx，并保持 1.8 行高
- 表单增加可见字段标签，输入框保持 96rpx
- 预约状态使用文字、边框和底色共同表达，不只依赖颜色

加载/空/错误状态检查：
- 保留现有加载、错误和空数据分支
- 统一全局 state/error 的边界、对比度、留白与居中样式
- 教程、课程和预约空状态文案已改为更易理解的短句
- WXML 标签配对检查通过；git diff --check 通过

用户主链路回归结果：
- 静态检查确认原页面跳转、字段绑定、表单事件和状态字段未改
- 微信开发者工具 engine build 连续两次超时，未取得真实编译结果
- 尚未在模拟器/真机执行首页→教程→课程→报名→我的预约完整回归

管理端操作回归结果：
- 静态检查确认资源选择器、编辑、删除、状态更新绑定未改
- 管理端已有图片/视频上传相关未提交改动被完整保留
- 尚未在模拟器/真机验证三个管理模块切换和 CRUD 操作

涉及 JS 或业务逻辑的建议：
- “我的预约”仍只能展示 courseId；如需显示课程名称，需研发部评估数据关联或展示逻辑
- 本轮未修改任何 JS、service、云函数、字段、状态值或跳转逻辑
- 工作区原有 guides/admin 页面 JS 改动不属于本轮 UI 修改

未完成事项：
- 修复或重启微信开发者工具 engine build 服务后重新编译
- 按 UI_HANDOFF 的 12 步链路完成模拟器与真机回归
- 正式发布前由研发部将 enableAdminEntry 改为 false

风险：
- 当前结论仅覆盖静态结构与样式检查，不能替代微信开发者工具编译和真机视觉验收
- 状态标签使用 statusText 做展示类判断，需在编译后确认 WXML 表达式兼容
- 工作区存在本轮开始前已有的 JS/WXML/WXSS 未提交改动，提交时需按归属拆分核对

下一窗口第一步：
- 重启微信开发者工具并打开 D:\作业素材\银发纪，先执行编译；编译通过后从首页开始跑完整用户主链路，再验证管理端三个模块。
```

## 2026-06-20 首页参考版式调整

```text
已优化页面：
- 用户端首页

修改文件：
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 参考“顶部横幅 + 三项快捷入口 + 双列内容卡片 + 原生底部导航”的版式重排
- 保留 30rpx 以上文字与大触区，不照搬参考图的小字号
- 横幅与内容插画全部使用纯 WXML/WXSS，不新增图片依赖

加载/空/错误状态检查：
- 首页不依赖异步数据，无新增状态分支
- WXML 标签配对、字号下限与 git diff --check 检查通过

用户主链路回归结果：
- 看教程、约课程、我的预约仍使用原有 switchTab 路径
- 未修改 JS、字段、接口、云函数或 app.json
- 微信开发者工具 engine build 服务仍处于此前连续超时状态，本轮未重复试错

管理端操作回归结果：
- 本轮未涉及管理端

涉及 JS 或业务逻辑的建议：
- 若后续希望横幅使用真实人物照片或动态推荐内容，需先由研发部评估资源来源和数据逻辑

未完成事项：
- 开发者工具恢复后编译并检查窄屏设备的双列卡片

风险：
- 当前为静态版式验证，仍需模拟器或真机确认顶部插画和双列卡片的实际渲染

下一窗口第一步：
- 在微信开发者工具中编译首页，重点检查 320px 等效窄屏下的横幅文字、三项快捷入口和双列卡片。
```

## 2026-06-20 品牌 Logo 接入

```text
已优化页面：
- 用户端首页横幅

修改文件：
- miniprogram/assets/images/silver-years-logo-full.jpg
- miniprogram/assets/images/silver-years-logo-mark.png
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 首页横幅使用真实品牌图形标志，品牌识别更直接
- 横幅调整为与 Logo 一致的浅蓝、米白配色，文字保持深色高对比

加载/空/错误状态检查：
- 本地图片资源不依赖网络加载

用户主链路回归结果：
- 仅替换横幅视觉资源，原有教程、课程、预约跳转未变

管理端操作回归结果：
- 本轮未涉及管理端

涉及 JS 或业务逻辑的建议：
- 无

未完成事项：
- 开发者工具恢复后确认 Logo 在不同设备下无裁切和模糊

风险：
- 源 Logo 为有背景的 JPG；当前图形版通过高保真图像编辑与色键清除生成透明 PNG，不是可无限缩放的矢量文件

下一窗口第一步：
- 编译首页并检查 Logo 清晰度；如品牌方后续提供透明 PNG 或 SVG，应替换当前裁切图。
```

## 2026-06-20 教程推荐与全局品牌 UI

```text
已优化页面：
- 用户端首页
- 教程列表、教程详情
- 课程列表、课程详情
- 预约创建、我的预约
- 管理端首页（仅必要可用性与品牌色整理）

修改文件：
- specs/global-brand-ui/requirements.md
- specs/global-brand-ui/design.md
- specs/global-brand-ui/tasks.md
- miniprogram/app.wxss
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss
- miniprogram/pages/guides/list/index.wxss
- miniprogram/pages/guides/detail/index.wxss
- miniprogram/pages/courses/list/index.wxss
- miniprogram/pages/courses/detail/index.wxss
- miniprogram/pages/orders/create/index.wxss
- miniprogram/pages/mine/index/index.wxss
- miniprogram/admin/pages/index/index.wxss

适老化指标检查：
- “常用服务”已替换为“教程推荐”，说明文案明确从简单内容开始
- 首页顶部使用原生 swiper 作为课程新闻轮播预留，当前仅展示静态品牌横幅
- 快捷入口继续保留看教程、约课程、我的预约
- 正文保持 32rpx 基线，主按钮保持 96rpx，管理端小按钮保持 88rpx
- 全局统一雾蓝、品牌蓝、深青、暖米白视觉体系，减少页面间认知切换

加载/空/错误状态检查：
- 全局 state/error 样式保持文字说明与高对比
- 首页当前静态轮播不依赖网络数据，不新增加载失败分支
- Logo 本地资源存在，WXML 标签配对、git diff --check 与禁用色/字体审计通过

用户主链路回归结果：
- 首页教程推荐的单条入口进入现有教程列表
- 看教程、约课程、我的预约仍使用原有 switchTab 路径
- 教程、课程、预约页面仅调整样式，现有绑定、字段和导航目标未改
- 未修改 userApi、adminApi、JS、service、云函数、字段或 app.json

管理端操作回归结果：
- 仅统一选择器、输入区、上传按钮、保存按钮的品牌色与边框
- 编辑、删除、状态更新等事件绑定未改
- 工作区已有管理端 JS 改动不属于本轮 UI 修改

涉及 JS 或业务逻辑的建议：
- 顶部真实课程新闻轮播需要研发部接入首页 JS 与 userApi 数据
- 真实教程标题、封面或个性化推荐需要研发部定义推荐数据来源
- UI 建议后续数据结构至少提供标题、摘要、封面和跳转目标，但本轮未新增任何字段

未完成事项：
- 微信开发者工具 CLI 构建失败，报 EEXIST：C:\Users\yjt\AppData\Local\微信开发者工具
- 需修复开发者工具本机目录/CLI 后重新编译，并在模拟器或真机回归完整链路

风险：
- 当前轮播只有一张静态品牌内容；接入动态新闻前不应开启自动轮播和指示点
- 静态检查不能替代微信开发者工具编译与真机视觉验收
- 当前工作区存在本轮开始前已有的 JS 与页面改动，提交时需按归属拆分

下一窗口第一步：
- 先修复或重装微信开发者工具 CLI，再编译首页；随后依次回归教程列表→详情、课程列表→详情→预约、我的预约和管理端三个模块。
```

## 2026-06-20 单条教程推荐与课程编号优化

```text
已优化页面：
- 用户端首页
- 教程列表、教程详情
- 课程列表、课程详情
- 预约创建、我的预约
- 管理端预约列表

修改文件：
- specs/global-brand-ui/requirements.md
- specs/global-brand-ui/design.md
- miniprogram/app.wxss
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss
- miniprogram/pages/guides/list/index.wxss
- miniprogram/pages/guides/detail/index.wxss
- miniprogram/pages/courses/list/index.wxss
- miniprogram/pages/courses/detail/index.wxss
- miniprogram/pages/orders/create/index.wxss
- miniprogram/pages/mine/index/index.wxml
- miniprogram/pages/mine/index/index.wxss
- miniprogram/admin/pages/index/index.wxml
- miniprogram/admin/pages/index/index.wxss

适老化指标检查：
- 首页教程推荐由两个合集入口改为一篇具体教程
- 当前使用演示数据中已有的“如何使用微信付款码”，分类为“微信基础”
- 单条推荐使用横向大卡片，标题 40rpx，正文 30rpx，操作入口清楚
- 所有用户页的页头统一使用品牌雾蓝底板和圆形装饰
- 教程卡使用品牌蓝顶边，课程卡使用提示金顶边，详情与表单保持相同层级
- 课程编号改为独立标签和高对比编号块，长编号可以完整换行

加载/空/错误状态检查：
- 未改变现有加载、空状态和错误状态结构
- WXML 标签配对、资源、绑定、跳转与 git diff --check 静态检查通过

用户主链路回归结果：
- 首页只保留一个教程推荐卡
- 推荐内容点击进入现有教程列表，不使用未知或硬编码教程 ID
- 教程、课程、报名、我的预约的现有事件和导航目标未改
- 我的预约仍绑定 item.courseId，仅改变显示结构

管理端操作回归结果：
- 管理端课程编号同步改为可换行的独立信息块
- 预约状态更新绑定未改

涉及 JS 或业务逻辑的建议：
- 后续算法推荐需要研发部在首页 JS 中调用 userApi，提供推荐教程的 title、category、coverImage 和 _id
- 接入动态推荐后，推荐卡应使用教程 _id 直接进入详情页
- 本轮已提前通知研发边界，未修改任何 JS、service、API、字段或云函数

未完成事项：
- 微信开发者工具 CLI 的 EEXIST 本机异常仍未修复，本轮未重复构建
- 修复工具后需重点检查首页横向推荐卡在窄屏设备上的文字与插画比例

风险：
- 当前推荐教程是静态演示数据；如果运营删除该教程，首页文案不会自动同步
- 点击当前推荐卡先进入教程列表，尚不能直接定位该教程

下一窗口第一步：
- 研发部确认算法推荐数据方案后，再接首页 JS 与 userApi；UI 部随后补动态封面、加载态和直达详情回归。
```

## 2026-06-20 多篇教程直达推荐修正

```text
已优化页面：
- 用户端首页教程推荐区

修改文件：
- specs/global-brand-ui/requirements.md
- specs/global-brand-ui/design.md
- miniprogram/pages/index/index.js
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 推荐区展示最多 3 篇独立教程，不再使用“新手合集”“更多教程”等二次入口
- 每张推荐卡突出分类、标题和“直接学习这篇教程”
- 卡片保持大字号、整卡触控和明确序号

加载/空/错误状态检查：
- 新增首页推荐加载、失败和无教程状态
- 失败时不影响顶部轮播和三个快捷入口

用户主链路回归结果：
- 首页复用 services/guide.listGuides()，未新增接口
- 当前按接口返回顺序取前 3 篇教程
- 每张卡通过 item._id 直接跳转 /pages/guides/detail/index
- “全部教程”仍作为独立辅助入口保留

管理端操作回归结果：
- 本组未修改管理端

涉及 JS 或业务逻辑的建议：
- 已在修改前通知研发边界
- 后续算法只需替换 recommendedGuides 的选取规则，不需改变 WXML 卡片结构
- 未修改 userApi、service、云函数、字段或接口参数

未完成事项：
- 微信开发者工具 CLI 仍有既有 EEXIST 异常，未重复执行失败构建
- 修复工具后需回归：首页加载推荐→点击第 1/2/3 张卡→分别打开对应详情

风险：
- 当前“前 3 篇”是临时规则，不代表个性化或热度排序
- 推荐区内容数量取决于现有教程数据，少于 3 篇时按实际数量展示

下一窗口第一步：
- 研发部接入算法推荐时，仅替换首页推荐选取逻辑，并保留直接详情跳转。
```

## 2026-06-20 推荐教程双列版式

```text
已优化页面：
- 用户端首页教程推荐区

修改文件：
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 推荐教程改为参考图的左右双列卡片
- 第二列下移 28rpx，形成清楚的错层浏览节奏
- 每卡上方为步骤插画，下方展示分类、34rpx 标题和 30rpx 操作提示
- 整张卡片保持可点击，触控区域未缩小

加载/空/错误状态检查：
- 沿用上一组推荐加载、失败与空状态
- WXML 标签配对和双列样式静态检查通过

用户主链路回归结果：
- 每张推荐卡仍通过 item._id 直接进入对应教程详情
- 未改推荐数量、数据读取或“全部教程”辅助入口

管理端操作回归结果：
- 本组未涉及管理端

涉及 JS 或业务逻辑的建议：
- 无；本组仅修改 WXML/WXSS

未完成事项：
- 微信开发者工具 CLI 异常未修复，需恢复后检查窄屏双列标题换行

风险：
- 三篇推荐时最后一张位于左列，属于正常双列流式排列

下一窗口第一步：
- 编译首页，重点检查 320px 等效窄屏下双列卡片宽度、标题两行高度和右列错层。
```

## 2026-06-20 首页推荐封面显示

```text
已优化页面：
- 用户端首页教程推荐区

修改文件：
- miniprogram/pages/index/index.js
- miniprogram/pages/index/index.wxml
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 推荐卡优先展示教程 images 字段中的第一张图片
- 封面使用 aspectFill 填充双列卡片上半区
- 无图片时继续显示清晰的步骤插画，不出现空白区域

加载/空/错误状态检查：
- 云存储封面通过 getTempFileURL 转换
- 转换失败时保留原地址并继续展示推荐内容
- JS 语法、WXML 标签、封面绑定和详情跳转静态检查通过

用户主链路回归结果：
- 推荐数量与详情直达逻辑未变
- 首页仍复用现有 listGuides 和 images 字段

管理端操作回归结果：
- 本组未涉及管理端

涉及 JS 或业务逻辑的建议：
- 已在修改前通知研发边界
- 未修改 service、userApi、字段、云函数或接口参数

未完成事项：
- 开发者工具恢复后检查不同尺寸封面的实际裁切效果

风险：
- 横图与竖图统一使用 aspectFill，图片边缘可能被适度裁切

下一窗口第一步：
- 编译首页并确认有图教程显示真实封面、无图教程显示步骤插画。
```

## 2026-06-20 首页封面条件渲染编译修复

```text
修复页面：
- 用户端首页

修改文件：
- miniprogram/pages/index/index.wxml

问题与修复：
- 原 wx:if 图片和 wx:else 占位插画之间夹有教程序号节点，导致微信编译器报 wx:if not found
- 已将序号节点移到条件渲染之前，使 wx:else 紧邻对应的 wx:if
- __route__ is not defined 为 WXML 编译失败引起的连带错误，页面重新编译后应一并消失

检查结果：
- wx:if / wx:else 相邻检查通过
- WXML 标签配对检查通过
- 推荐卡详情直达绑定未改变
```

## 2026-06-20 用户端预约课程信息可读化

```text
已优化页面：
- 用户端我的预约

修改文件：
- miniprogram/pages/mine/index/index.js
- miniprogram/pages/mine/index/index.wxml
- miniprogram/pages/mine/index/index.wxss

适老化指标检查：
- 不再向用户展示数据库课程编号
- 预约卡标题直接显示课程名称
- 信息区展示预约人、上课时间和上课地点
- 课程无法关联时使用“课程信息待确认”和“请等待工作人员通知”

加载/空/错误状态检查：
- 课程列表读取失败时仍展示预约记录和友好兜底文案
- JS 语法、WXML 标签和字段绑定静态检查通过

用户主链路回归结果：
- 复用现有 listOrders 与 listCourses
- 按订单 courseId 在页面内关联课程 _id
- 未改变预约字段、状态、创建流程或 userApi 接口

管理端操作回归结果：
- 管理端仍保留内部课程编号，便于运营排查

涉及 JS 或业务逻辑的建议：
- 已在修改前通知研发边界
- 长期建议订单快照保存课程名称、时间和地点，以避免课程删除后无法关联；该建议涉及字段设计，本轮未实施

风险：
- 当前依赖课程仍存在于课程列表；课程删除后只能显示兜底文案
```

## 2026-06-20 底部导航字号与全部教程对齐

```text
已优化页面：
- 全局底部导航
- 用户端首页教程推荐标题区

修改文件：
- miniprogram/app.json
- miniprogram/app.wxss
- miniprogram/custom-tab-bar/index.json
- miniprogram/custom-tab-bar/index.js
- miniprogram/custom-tab-bar/index.wxml
- miniprogram/custom-tab-bar/index.wxss
- miniprogram/pages/index/index.wxss

适老化指标检查：
- 原生 tabBar 改为纯文字自定义 tabBar，导航文字提升到 34rpx
- 每项触控高度 82rpx，选中项使用品牌雾蓝胶囊底
- 保留首页、教程、课程、我的四个原路径，不新增入口
- 页面底部预留 176rpx，避免内容被导航栏遮挡
- “全部教程”按钮提升到 76rpx，并与标题区垂直居中

加载/空/错误状态检查：
- 导航组件不依赖网络数据
- JS 语法、app.json、组件 JSON、WXML 标签和路径数量静态检查通过

用户主链路回归结果：
- 自定义导航仍使用 wx.switchTab 切换原有四个 tab 页面
- 组件根据当前 route 同步选中项

管理端操作回归结果：
- 管理端为分包普通页面，不显示 tabBar，未改变其操作逻辑

涉及 JS 或业务逻辑的建议：
- 已在修改前明确通知 app.json 与组件 JS 边界
- 未修改 userApi、adminApi、字段、云函数或页面路径

未完成事项：
- 需在微信开发者工具重新编译，逐项点击四个导航并检查安全区高度

风险：
- 自定义 tabBar 替代原生 tabBar，正式发布前需在 iPhone 与 Android 真机检查底部安全区
```
