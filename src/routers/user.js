const express = require('express');
const router = express.Router();

const userInfoController = require('../controllers/userInfoController');

// Express 是通过 next(error) 来表达出错的，无法识别 async 函数抛出的错误
// wrap 函数的作用在于将 async 函数抛出的错误转换为 next(error)
function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

// 组装路由
router.get('/name', wrap(userInfoController.getUser));
router.post('/signup', wrap(userInfoController.create));
router.post('/login', wrap(userInfoController.login));
// router.put('/:id/done', wrap(userInfoController.done));
// router.put('/:id/undone', wrap(userInfoController.undone));
// router.delete('/id/:id', wrap(userInfoController.delete));
// router.delete('/', wrap(userInfoController.deleteAll));

module.exports = router;
