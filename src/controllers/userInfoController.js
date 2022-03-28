const userInfoService = require("../services/userInfoService");
const bcrypt = require("bcrypt");
// 引入 jwt
const jwt = require("jsonwebtoken");
// 解析 token 用的密钥
const SECRET = "token_secret";

//密码加密
const hashPassword = (pwd) => {
  return new Promise((resolve) => {
    bcrypt.hash(pwd, 10, (err, hash) => {
      resolve(hash);
    });
  });
};

/**
 * userInfoController
 * Controller 是业务入口，由 HTTP 路由解析后调用
 * 包含待办事项的增删改查功能
 */
class userInfoController {
  /**
   * 获取用户信息
   * 响应格式
   * {
   *   list: [todo1, todo2]
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async getUser(req, res) {
    // 调用 Service 层对应的业务处理方法
    console.log(req.query);
    const list = await userInfoService.getUser({username: req.query.username});
    res.send({ list });
  }

  /**
   * 创建一条待办事项
   * 响应格式
   * {
   *   result: newTodo
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async create(req, res) {
    const { username, password, email } = req.body;
    const list = await userInfoService.getUser({username});
    if (list.length) {
      res.send({ code: 1002, message: "用户名已存在" });
    } else {
      const passwordHash = await hashPassword(password);
      // 调用 Service 层对应的业务处理方法
      const result = await userInfoService.create({
        username,
        password: passwordHash,
        email,
      });
      res.send({ code: 1001, data: result });
    }
  }

  /**
   * 获取用户信息
   * 响应格式
   * {
   *   list: [todo1, todo2]
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async login(req, res) {
    const list = await userInfoService.getUser({username: req.body.username});
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      list[0].password
    );
    if (!isPasswordValid) {
      return res.send({
        code: 1002,
        message: "账号或密码错误",
      });
    }
    /* 
    生成 token
    jwt.sign() 接受两个参数，一个是传入的对象，一个是自定义的密钥
    */
    const token = jwt.sign({ id: String(list[0]._id) }, SECRET);

    res.send({
      code: 1001,
      message: "登录成功",
      token,
    });
  }

  //解密token
  async profile(req, res) {
    const raw = String(req.headers.authorization.split(" ").pop()); // 解密 token 获取对应的 id
    const { id } = jwt.verify(raw, SECRET);
    req.user = await User.findById(id);
    res.send(req.user);
  }

  /**
   * 列出所有待办事项
   * 响应格式
   * {
   *   list: [todo1, todo2]
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async listAll(req, res) {
    // 调用 Service 层对应的业务处理方法
    const list = await userInfoService.listAll();
    res.send({ list });
  }

  /**
   * 删除一条待办事项
   * 响应格式
   * {
   *   ok: true
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async delete(req, res) {
    // 调用 Service 层对应的业务处理方法
    await userInfoService.delete(req.params.id);
    res.send({ ok: true });
  }

  /**
   * 删除所有待办事项
   * 响应格式
   * {
   *   ok: true
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async deleteAll(req, res) {
    // 调用 Service 层对应的业务处理方法
    await userInfoService.deleteAll();
    res.send({ ok: true });
  }

  /**
   * 将一条待办事项状态设为 done
   * 响应格式
   * {
   *   ok: true
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async done(req, res) {
    // 调用 Service 层对应的业务处理方法
    await userInfoService.update(req.params.id, { done: true });
    res.send({ ok: true });
  }

  /**
   * 将一条待办事项状态设为 undone
   * 响应格式
   * {
   *   ok: true
   * }
   * @param req Express 的请求参数
   * @param res Express 的响应参数
   */
  async undone(req, res) {
    // 调用 Service 层对应的业务处理方法
    await userInfoService.update(req.params.id, { done: false });
    res.send({ ok: true });
  }
}

// 导出 Controller 的实例
module.exports = new userInfoController();
