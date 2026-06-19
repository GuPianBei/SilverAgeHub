# 数据库设计

本项目使用微信云数据库，MVP 创建 4 个集合：

- `guide`：教程内容
- `course`：课程信息
- `order`：预约记录
- `admin_user`：管理端账号白名单

## 字段口径

### guide 教程表

- `title`：教程标题
- `category`：教程分类
- `content`：教程正文
- `images`：图片地址数组
- `video`：视频地址
- `createTime`：创建时间

### course 课程表

- `title`：课程名称
- `description`：课程介绍
- `time`：上课时间
- `location`：上课地点
- `limitCount`：人数上限
- `createTime`：创建时间

### order 预约表

- `userName`：预约人姓名
- `phone`：联系电话
- `courseId`：关联课程 ID
- `status`：预约状态，只能为 `未确认`、`已确认`、`完成`
- `createTime`：预约创建时间

### admin_user 管理员表

- `openid`：管理员微信 OpenID
- `enabled`：是否启用，必须为布尔值 `true`
- `role`：角色，MVP 使用 `admin` 或 `operator`
- `name`：管理员姓名或备注
- `createTime`：创建时间

首次进入管理端时，页面会显示当前账号的 OpenID。将该值写入 `admin_user` 后，下拉刷新即可完成授权。
