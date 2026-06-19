# 云函数部署说明

## 当前正式入口

MVP 只需要部署两个云函数：

- `userApi`：用户端读取教程/课程、创建和查询自己的预约
- `adminApi`：管理端教程/课程 CRUD、预约状态管理、管理员校验

`guide`、`course`、`order`、`admin` 是早期拆分方案，暂时保留用于兼容，新代码不再调用。联调时不要同时维护两套接口。

## 统一响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `0`：成功
- `400`：参数或操作不合法
- `403`：没有管理员权限
- `500`：云函数或数据库异常

## 部署顺序

1. 确认开发者工具的云环境与 `miniprogram/utils/config.js` 的 `envId` 一致。
2. 右键 `userApi`，选择上传并部署，使用云端安装依赖。
3. 右键 `adminApi`，选择上传并部署，使用云端安装依赖。
4. 每次修改云函数后必须重新上传部署。

## 版本确认

在云端测试 `userApi`：

```json
{
  "action": "health"
}
```

正确结果应包含：

```json
{
  "service": "userApi",
  "version": "2026-06-18-stable-v1"
}
```

`adminApi` 使用 `{ "action": "whoami" }` 测试，返回的 `data.version` 应相同。
