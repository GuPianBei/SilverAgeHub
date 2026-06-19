const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function checkJavaScriptSyntax(directory) {
  const absoluteDirectory = path.join(root, directory);

  fs.readdirSync(absoluteDirectory, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === 'node_modules') return;

    const absolutePath = path.join(absoluteDirectory, entry.name);
    const relativePath = path.relative(root, absolutePath);

    if (entry.isDirectory()) {
      checkJavaScriptSyntax(relativePath);
      return;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        new Function(read(relativePath));
      } catch (error) {
        failures.push(`${relativePath} 语法错误：${error.message}`);
      }
    }
  });
}

const projectConfig = readJson('project.config.json');
const appConfig = readJson('miniprogram/app.json');
const runtimeConfig = require(path.join(root, 'miniprogram/utils/config.js'));
const userApiSource = read('cloudfunctions/userApi/index.js');
const adminApiSource = read('cloudfunctions/adminApi/index.js');
const serviceSources = [
  read('miniprogram/services/guide.js'),
  read('miniprogram/services/course.js'),
  read('miniprogram/services/order.js'),
  read('miniprogram/services/admin.js')
].join('\n');

assert(projectConfig.appid === 'wx9f9b638a412469b0', 'AppID 不符合执行单');
assert(runtimeConfig.envId === 'cloud1-d0g5eg4kxeed0d74d', 'envId 不符合执行单');
assert(runtimeConfig.userFunctionName === 'userApi', '用户端正式函数必须为 userApi');
assert(runtimeConfig.adminFunctionName === 'adminApi', '管理端正式函数必须为 adminApi');

const adminPackage = (appConfig.subPackages || []).find((item) => item.root === 'admin');
assert(!!adminPackage, '缺少 admin 独立分包');
assert(
  !(appConfig.pages || []).some((page) => page.indexOf('admin') !== -1),
  '管理页面不能放在主包 pages 中'
);

assert(serviceSources.indexOf("name: 'guide'") === -1, '前端仍直接调用旧 guide 云函数');
assert(serviceSources.indexOf("name: 'course'") === -1, '前端仍直接调用旧 course 云函数');
assert(serviceSources.indexOf("name: 'order'") === -1, '前端仍直接调用旧 order 云函数');
assert(serviceSources.indexOf("name: 'admin'") === -1, '前端仍直接调用旧 admin 云函数');

assert(
  userApiSource.indexOf("2026-06-18-stable-v1") !== -1,
  'userApi 版本不是稳定版 v1'
);
assert(
  adminApiSource.indexOf("2026-06-18-stable-v1") !== -1,
  'adminApi 版本不是稳定版 v1'
);
assert(
  adminApiSource.indexOf("collection('admin_user')") !== -1,
  'adminApi 未通过 admin_user 集合校验管理员'
);
assert(adminApiSource.indexOf('ADMIN_OPENIDS') === -1, 'adminApi 仍使用 ADMIN_OPENIDS');
assert(adminApiSource.indexOf('updateTime') === -1, 'adminApi 写入了未约定的 updateTime');

const expectedSchemas = {
  guide: ['title', 'category', 'content', 'images', 'video', 'createTime'],
  course: ['title', 'description', 'time', 'location', 'limitCount', 'createTime'],
  order: ['userName', 'phone', 'courseId', 'status', 'createTime'],
  admin_user: ['openid', 'enabled', 'role', 'name', 'createTime']
};

Object.keys(expectedSchemas).forEach((collection) => {
  const schema = readJson(`database/${collection}.schema.json`);
  const fields = Object.keys(schema.fields || {});
  assert(schema.collection === collection, `${collection} schema 集合名错误`);
  assert(
    expectedSchemas[collection].every((field) => fields.indexOf(field) !== -1),
    `${collection} schema 缺少必需字段`
  );
});

assert(
  readJson('database/order.schema.json').fields.status === '未确认|已确认|完成',
  'order 状态枚举不符合要求'
);

const seed = readJson('database/seed.json');
assert(Array.isArray(seed.guide), '种子数据缺少 guide');
assert(Array.isArray(seed.course), '种子数据缺少 course');
assert(Array.isArray(seed.admin_user), '种子数据缺少 admin_user');

checkJavaScriptSyntax('miniprogram');
checkJavaScriptSyntax('cloudfunctions/userApi');
checkJavaScriptSyntax('cloudfunctions/adminApi');

if (failures.length) {
  console.error('稳定架构检查失败：');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('稳定架构本地检查通过');
console.log('- AppID/envId 与执行单一致');
console.log('- 用户端仅调用 userApi');
console.log('- 管理端仅调用 adminApi');
console.log('- admin 独立分包存在');
console.log('- 四个集合 schema 与状态枚举正确');
console.log('- 正式云函数版本为 2026-06-18-stable-v1');
