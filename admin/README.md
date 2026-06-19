# 管理端说明

管理端服务于助教和运营人员，页面位于小程序独立分包：

```text
miniprogram/admin/pages/index/index
```

管理端只调用 `adminApi` 云函数，不调用旧的 `admin`、`guide`、`course`、`order`
云函数。

## MVP 管理范围

- 教程管理：查看、新增、编辑、删除 `guide` 内容。
- 课程管理：查看、新增、编辑、删除 `course` 内容。
- 预约管理：查看 `order`，并将状态更新为 `未确认`、`已确认`、`完成`。

## 管理员授权

管理员身份统一通过云数据库 `admin_user` 集合校验，不使用环境变量白名单。

1. 部署 `adminApi`，使用云端安装依赖。
2. 云端测试传入：

```json
{
  "action": "whoami"
}
```

3. 从返回的 `data.openid` 取得当前用户 OpenID。
4. 在 `admin_user` 集合新增：

```json
{
  "openid": "管理员 OpenID",
  "enabled": true,
  "role": "admin",
  "name": "管理员"
}
```

5. 再次调用 `whoami`，确认 `data.isAdmin` 为 `true`。

`enabled` 必须是布尔值 `true`，不能填写成字符串 `"true"`。

## 发布设置

联调期间可在 `miniprogram/utils/config.js` 中临时启用管理入口。发布普通用户版本前，
将 `enableAdminEntry` 设置为 `false`。即使入口隐藏，`adminApi` 仍会在云端校验管理员
身份。
