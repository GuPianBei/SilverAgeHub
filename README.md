# 银发纪小程序

银发纪是面向老年群体的数字技能学习与课程预约小程序，MVP 聚焦「教程学习 + 课程预约 + 内容管理」闭环，帮助长者反复学习手机使用、生活服务、防诈骗等高频数字技能。

## 目录说明

```text
.
├── miniprogram/          # 微信小程序前端
├── cloudfunctions/       # userApi / adminApi 云函数
├── database/             # 云数据库集合设计与初始化数据
├── admin/                # 管理端后台说明与后续实现入口
└── docs/                 # 产品规格、部门指令、投喂包和归档资料
```

## 产品定位

本项目定位为「老年数字助学服务平台」。第一阶段不做社交、聊天、AI 生成内容或复杂推荐算法，只做可落地、可演示、可继续扩展的基础业务闭环。

## MVP 模块

- 用户端：首页、教程列表、教程详情、课程列表、课程详情、课程预约、我的预约
- 管理端：教程新增/编辑/删除、课程创建/发布、预约查看/状态处理
- 云函数：用户端 `userApi`、管理端 `adminApi`
- 数据集合：`guide`、`course`、`order`、`admin_user`

## 核心字段

- `guide`：`title`、`category`、`content`、`images`、`video`、`createTime`
- `course`：`title`、`description`、`time`、`location`、`limitCount`、`createTime`
- `order`：`userName`、`phone`、`courseId`、`status`、`createTime`

预约状态统一使用：`未确认`、`已确认`、`完成`。

## 开发入口

1. 使用微信开发者工具打开本目录。
2. 在 `project.config.json` 中填写自己的 `appid`。
3. 在 `miniprogram/utils/config.js` 中填写云环境 ID。
4. 创建 `guide`、`course`、`order`、`admin_user` 集合。
5. 只部署 `userApi` 和 `adminApi` 两个正式云函数。
6. 在 `admin_user` 中录入管理员 OpenID。
7. 产品与开发规格文档统一存放在 `docs/product`。

## 资料归档

- `docs/product/银发纪_Codex开发详细版Spec.docx`：当前开发口径主文档
- `docs/product/银发纪小程序_给老师版Spec.docx`：面向汇报/教学场景的产品说明
- `docs/departments/`：产品部、研发部、UI 部协作指令
- `docs/codex-feed/`：拆分后的 Codex 投喂材料
- `docs/archives/`：原始压缩包归档

## 三部门协作

本项目后续按三类 Codex 角色推进：

- 产品部：负责需求范围、页面流程、字段口径、验收标准
- 研发部：负责小程序页面、service 层、云函数、数据库落地
- UI 部：负责适老化体验、页面结构、视觉一致性和交互检查

协作总则见 `docs/departments/00_协作总则.md`。

MVP 验收清单见 `docs/departments/04_MVP验收清单.md`。

稳定架构与首次联调步骤见 `docs/architecture/稳定架构与联调流程.md`。

新窗口开始工作前必须阅读：

- `docs/handoff/CURRENT_HANDOFF.md`
- `docs/operations/AI部门运行与上下文隔离规则.md`

产品、研发、运营和上架的唯一规模化主路线图：

- `docs/retrospective/MVP阶段复盘与规模化路线图.md`

原测试版计划和企业化清单已并入主路线图，仅保留兼容入口。
