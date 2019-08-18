const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/users");
const { secret } = require("../config");

const db = [{ name: "李浩" }];
class UserCtl {
  async find(ctx) {
    ctx.body = await User.find();
  }
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields = fields
      ? fields
          .split(";")
          .filter(v => v)
          .map(v => ` +${v}`)
          .join("")
      : "";
    const user = await User.findById(ctx.params.id).select(selectFields);
    if (!user) {
      ctx.throw(404, "用户不存在");
    } else {
      ctx.body = user;
    }
  }
  async create(ctx) {
    ctx.verifyParams({
      name: {
        type: "string",
        required: true
      },
      password: {
        type: "string",
        required: true
      }
    });
    const body = ctx.request.body;
    const { name } = body;
    const repeatedName = await User.findOne({ name });
    if (repeatedName) {
      ctx.throw(409, "用户名已被占用");
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: {
        type: "string",
        required: false
      },
      password: {
        type: "string",
        required: false
      },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      business: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false }
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!user) {
      ctx.throw(404, "用户不存在");
    } else {
      ctx.body = user;
    }
  }
  async deleteUser(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    } else {
      ctx.status = 204;
    }
  }
  async login(ctx) {
    ctx.verifyParams({
      name: {
        type: "string",
        required: true
      },
      password: {
        type: "string",
        required: true
      }
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码不正确");
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });
    ctx.body = { token };
  }
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+following")
      .populate("following");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.following;
  }
  /**
   * @description 获取某个用户的粉丝列表
   * @param {*} ctx
   * @memberof UserCtl
   */
  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = users;
  }

  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    await next();
  }
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    await next();
  }

  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const { id } = ctx.params;
    // 需要把mongoose的数据类型转换为字符串
    if (!me.following.map(v => v.toString()).includes(id)) {
      me.following.push(id);
      me.save();
    }
    ctx.status = 204;
  }
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const { id } = ctx.params;
    const index = me.following.map(v => v.toString()).indexOf(id);
    // 需要把mongoose的数据类型转换为字符串
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
}

module.exports = new UserCtl();
