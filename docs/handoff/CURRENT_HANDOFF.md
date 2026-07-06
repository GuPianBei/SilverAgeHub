# 银发纪当前交接单

更新时间：2026-07-06

## 当前阶段

银发纪 MVP 已于 2026-06-20 阶段性完成。项目进入「测试版生产化」阶段，目标是补齐课程报名并发、幂等、分页、导出、权限和发布能力，再进行社区测试、公众号关联和正式上架。

## 已确认架构

```text
用户主包 miniprogram/pages
  └─ userApi

管理分包 miniprogram/admin
  └─ adminApi
```

共享集合：

- `guide`
- `course`
- `order`
- `admin_user`

正式云函数版本：

```text
userApi：2026-07-06-booking-v0.2.2
adminApi：2026-06-18-stable-v1
```

## 2026-07-06 v0.2 报名生产化联调

- `userApi` 新增报名事务：读取课程、检查同一用户重复报名、检查剩余名额、创建预约、更新已占名额在同一事务内完成。
- 幂等口径为 `openid + courseId`，新预约使用确定性文档 ID，并保存 `idempotencyKey`。
- `course` 新增 `reservedCount`；旧课程缺少该字段时，首次新报名会按历史有效预约自动初始化。
- 同一账号重复提交返回原预约和 `duplicate: true`，不重复创建、不重复占名额。
- 人数上限为 `1` 的课程已用两个真实微信账号验收：第一人成功，第二人返回 `409 / 课程名额已满`，没有超额创建。
- 报名页已将 `409` 映射为“课程名额已满”，重新进入真机调试后显示成功。
- 仅部署 `userApi`，云端状态为 `Active`；`adminApi` 和旧函数均未修改。

## 本轮完成

- 通过微信开发者工具端口 `55276` 核对 AppID 与目标云环境
- 仅重新部署正式入口 `userApi`、`adminApi`
- 为两个正式云函数显式补充 `@cloudbase/node-sdk@2.10.0`
- 修复 `userApi health` 同步返回在云端得到 `null` 的问题，入口改为异步函数
- `userApi health` 云端实测返回正式版本
- `adminApi whoami` 云端实测返回正式版本
- 在 `admin_user` 录入真实管理员 OpenID，并通过小程序管理端确认授权成功
- 管理端教程新增、编辑、删除通过
- 管理端课程新增、编辑、删除通过
- 用户端教程列表与详情读取通过
- 用户端课程列表与详情读取通过
- 用户预约创建后默认显示 `未确认`
- 管理端更新预约为 `已确认` 后，用户端刷新同步显示 `已确认`
- 最终 JS 语法、JSON 解析和 CloudBase 规则人工审查通过
- 报名幂等、旧数据计数初始化、最后名额控制的本地自动化测试通过
- 两个真实微信账号完成新报名与满员拦截联调

## 修改文件

- `cloudfunctions/userApi/index.js`
- `cloudfunctions/userApi/booking.js`
- `cloudfunctions/userApi/package.json`
- `cloudfunctions/adminApi/package.json`
- `miniprogram/pages/orders/create/index.js`
- `database/course.schema.json`
- `database/order.schema.json`
- `database/README.md`
- `tests/userApi.booking.test.js`
- `.agents/skills/cloudbase/`（项目级 CloudBase Skills）
- `skills-lock.json`
- `docs/handoff/CURRENT_HANDOFF.md`

## 验证结果

```text
userApi 版本：2026-07-06-booking-v0.2.2
adminApi 版本：2026-06-18-stable-v1
四个集合是否存在：是，guide/course/order/admin_user 均已真实读写
whoami 是否 isAdmin=true：是，小程序真实 OpenID 授权后进入管理 CRUD 页面
用户端三页是否正常：是，教程、课程、我的预约均正常
管理端 CRUD 是否正常：是，教程和课程新增/编辑/删除、预约状态更新均通过
预约闭环是否正常：是，未确认 → 已确认已在用户端刷新验证
失败步骤及云函数日志：
1. adminApi 初次调用缺少 @cloudbase/node-sdk，Request ID 252bce4b-6442-47ce-8bc2-806b13d73b4a；已修复。
2. adminApi 部署时短暂处于 Updating，FailedOperation.UpdateFunctionCode，Request ID ad74fdc5-7624-4bc7-86a2-96ecbeebd44f；等待 Active 后单次重试成功。
3. userApi health 曾返回 null，Request ID 025b48ee-997f-4729-8ba1-44ef8a07a580；入口改为 async 后修复。
4. userApi health 修复后成功，Request ID 394a643a-c8c2-4b69-a180-b899520b66f6。
5. v0.2 首次新报名调用了事务文档引用不支持的 create()，Request ID 37f2d7c0-c1a7-4ba0-a119-e3788e56fab4；改为 set({ data }) 后修复。
6. v0.2.1 课程计数 update() 缺少 data 包装，Request ID 1909eace-c674-4dfb-bb29-69aa909e33af；改为 update({ data }) 后修复。
7. v0.2.2 新账号真实报名成功；满员课程拦截成功，Request ID 02450d6a-247f-423c-b0b7-10bccf796e59，返回 code=409、message=课程名额已满。
```

## 已知风险

- 云端仍保留旧 `guide`、`course`、`order` 函数，但前端未调用，禁止恢复为正式入口。
- `wx-server-sdk@3.0.4` 的上游依赖审计存在历史安全告警；本轮为保持兼容未做破坏性升级。
- 当前 `enableAdminEntry: true` 用于联调；正式发布前必须改为 `false`。
- 云数据库中保留了联调课程、预约和管理员记录，发布演示前应确认是否保留。
- `reservedCount` 目前由新报名事务维护；后续实现取消报名时必须在同一事务内释放名额。

## 未完成事项

- 发布前关闭普通用户界面的管理入口。
- 按演示需要清理或保留联调测试数据。
- 完成真机与隐私合规检查。
- 尚未执行微信小程序正式上传或发布。
- v0.2 后续仍需完成取消释放名额、课程/报名状态机、课程快照、分页筛选、CSV 导出、手机号脱敏和操作日志。

## 下一窗口第一步

继续按 `docs/retrospective/MVP阶段复盘与规模化路线图.md` 实现取消释放名额和课程/报名状态机；所有名额变更必须复用事务边界。

## 禁止变更

- 不恢复旧四函数为正式入口
- 不把管理端移回用户主包
- 不修改既定字段名
- 不新增 Web 管理后台
- 不做 UI 大改
- 不增加社交、聊天、AI、数字人和复杂推荐等概念功能
- 允许增加课程报名生产化和真实运营必需能力
- 当前课程统一免费，不接支付、不收保证金、不创建支付相关数据结构

## 统一主路线图

MVP 正式复盘和规模化路线见：

后续产品、研发、运营和上架规划只以此文件为准：

`docs/retrospective/MVP阶段复盘与规模化路线图.md`
