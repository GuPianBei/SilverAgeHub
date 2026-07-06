var assert = require('assert');
var booking = require('../cloudfunctions/userApi/booking');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFakeDb(seed) {
  var state = clone(seed);
  var queue = Promise.resolve();

  function collection(name) {
    return {
      doc: function (id) {
        return {
          get: async function () {
            return { data: state[name][id] ? clone(state[name][id]) : null };
          },
          set: async function (options) {
            assert.ok(options && options.data);
            state[name][id] = Object.assign({ _id: id }, clone(options.data));
            return { id: id };
          },
          update: async function (options) {
            assert.ok(options && options.data);
            state[name][id] = Object.assign({}, state[name][id], clone(options.data));
            return { updated: 1 };
          }
        };
      },
      where: function (query) {
        var rows = Object.keys(state[name])
          .map(function (id) { return state[name][id]; })
          .filter(function (row) {
            return Object.keys(query).every(function (key) {
              return row[key] === query[key];
            });
          });
        var chain = {
          field: function () { return chain; },
          limit: function (limit) {
            rows = rows.slice(0, limit);
            return chain;
          },
          get: async function () {
            return { data: clone(rows) };
          }
        };
        return chain;
      }
    };
  }

  return {
    state: state,
    serverDate: function () { return 'SERVER_DATE'; },
    runTransaction: function (callback) {
      var result = queue.then(function () {
        return callback({ collection: collection });
      });
      queue = result.then(function () {}, function () {});
      return result;
    }
  };
}

function success(data, message) {
  return { code: 0, message: message || 'ok', data: data };
}

function fail(code, message) {
  return { code: code, message: message, data: null };
}

async function submit(db, openid, courseId) {
  return booking.createOrder({
    db: db,
    data: {
      userName: '测试用户',
      phone: '13800000000',
      courseId: courseId
    },
    openid: openid,
    success: success,
    fail: fail
  });
}

async function testRepeatedSubmitIsIdempotent() {
  var db = createFakeDb({
    course: {
      course1: { _id: 'course1', limitCount: 2, reservedCount: 0 }
    },
    order: {}
  });

  var results = await Promise.all([
    submit(db, 'user1', 'course1'),
    submit(db, 'user1', 'course1'),
    submit(db, 'user1', 'course1')
  ]);

  assert.strictEqual(Object.keys(db.state.order).length, 1);
  assert.strictEqual(db.state.course.course1.reservedCount, 1);
  assert.strictEqual(results.filter(function (item) {
    return item.data && item.data.duplicate;
  }).length, 2);
}

async function testLastSeatDoesNotOversell() {
  var db = createFakeDb({
    course: {
      course1: { _id: 'course1', limitCount: 1, reservedCount: 0 }
    },
    order: {}
  });

  var results = await Promise.all([
    submit(db, 'user1', 'course1'),
    submit(db, 'user2', 'course1')
  ]);

  assert.strictEqual(Object.keys(db.state.order).length, 1);
  assert.strictEqual(db.state.course.course1.reservedCount, 1);
  assert.strictEqual(results.filter(function (item) {
    return item.code === 409;
  }).length, 1);
}

async function testLegacyCountMigration() {
  var db = createFakeDb({
    course: {
      course1: { _id: 'course1', limitCount: 3 }
    },
    order: {
      legacy1: {
        _id: 'legacy1',
        _openid: 'old-user',
        courseId: 'course1',
        status: '未确认'
      }
    }
  });

  var result = await submit(db, 'user2', 'course1');

  assert.strictEqual(result.code, 0);
  assert.strictEqual(db.state.course.course1.reservedCount, 2);
  assert.strictEqual(Object.keys(db.state.order).length, 2);
}

async function testLegacyOrderIsIdempotent() {
  var db = createFakeDb({
    course: {
      course1: { _id: 'course1', limitCount: 3 }
    },
    order: {
      legacy1: {
        _id: 'legacy1',
        _openid: 'user1',
        courseId: 'course1',
        status: '未确认'
      }
    }
  });

  var result = await submit(db, 'user1', 'course1');

  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.data.id, 'legacy1');
  assert.strictEqual(result.data.duplicate, true);
  assert.strictEqual(Object.keys(db.state.order).length, 1);
}

async function run() {
  await testRepeatedSubmitIsIdempotent();
  await testLastSeatDoesNotOversell();
  await testLegacyCountMigration();
  await testLegacyOrderIsIdempotent();
  console.log('booking tests passed');
}

run().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
