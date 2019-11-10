const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/users");
const Question = require('../models/questions');
const Answer = require('../models/answers');
const { secret } = require("../config");

const db = [{ name: "李浩" }];
class UserCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(Number(ctx.query.page), 1) - 1;
    const perPage = Math.max(Number(per_page), 1);
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(page * perPage);
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
    const populateStr = fields
      ? fields
          .split(";")
          .filter(f => f)
          .map(v => {
            if (v === "employments") {
              return "employments.compnay employments.job";
            }
            if (v === "educations") {
              return "educations.school educations.major";
            }
            return v;
          })
          .join(" ")
      : "";
    const user = await User.findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr);
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
    const repeatedName = await User.findOne({ name: ctx.request.body.name });
    if (repeatedName) {
      ctx.throw(409, "用户名已被占用");
    }
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
  async checkTopicExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "话题不存在");
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
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+following")
      .populate("following");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.following;
  }
  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+followingTopics")
      .populate("followingTopics");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.followingTopics;
  }
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    const { id } = ctx.params;
    // 需要把mongoose的数据类型转换为字符串
    if (!me.followingTopics.map(v => v.toString()).includes(id)) {
      me.followingTopics.push(id);
      me.save();
    }
    ctx.status = 204;
  }
  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    const { id } = ctx.params;
    const index = me.followingTopics.map(v => v.toString()).indexOf(id);
    // 需要把mongoose的数据类型转换为字符串
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  async listQuestions(ctx) {
    const questions = await Question.find({questioner: ctx.params.id});
    ctx.body = questions;
  }
  // like
  async listLikedAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+likedAnswers")
      .populate("likedAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.likedAnswers;
  }
  async likeAnswer(ctx, next) {
    console.log(ctx.state, 22);
    const me = await User.findById(ctx.state.user._id).select(
      "+likedAnswers"
    );
    const { id } = ctx.params;
    // 需要把mongoose的数据类型转换为字符串
    if (!me.likedAnswers.map(v => v.toString()).includes(id)) {
      me.likedAnswers.push(id);
      me.save();
      // $inc means increment
      await Answer.findByIdAndUpdate(id, {$inc: {voteCount: 1}});
    }
    ctx.status = 204;
    await next();
  }
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+likedAnswers"
    );
    const { id } = ctx.params;
    const index = me.likedAnswers.map(v => v.toString()).indexOf(id);
    // 需要把mongoose的数据类型转换为字符串
    if (index > -1) {
      me.likedAnswers.splice(index, 1);
      me.save();
      await Answer.findByIdAndUpdate(id, {$inc: {voteCount: -1}});

    }
    ctx.status = 204;
  }
  // dislike
  async listDislikedAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+dislikedAnswers")
      .populate("dislikedAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.dislikedAnswers;
  }
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select(
      "+dislikedAnswers"
    );
    const { id } = ctx.params;
    // 需要把mongoose的数据类型转换为字符串
    if (!me.dislikedAnswers.map(v => v.toString()).includes(id)) {
      me.dislikedAnswers.push(id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+dislikedAnswers"
    );
    const { id } = ctx.params;
    const index = me.dislikedAnswers.map(v => v.toString()).indexOf(id);
    // 需要把mongoose的数据类型转换为字符串
    if (index > -1) {
      me.dislikedAnswers.splice(index, 1);
      me.save();

    }
    ctx.status = 204;
  }
  // collect
  async listCollectedAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+collectedAnswers")
      .populate("collectedAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.collectedAnswers;
  }
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select(
      "+collectedAnswers"
    );
    const { id } = ctx.params;
    // 需要把mongoose的数据类型转换为字符串
    if (!me.collectedAnswers.map(v => v.toString()).includes(id)) {
      me.collectedAnswers.push(id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }
  async uncollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+collectedAnswers"
    );
    const { id } = ctx.params;
    const index = me.collectedAnswers.map(v => v.toString()).indexOf(id);
    // 需要把mongoose的数据类型转换为字符串
    if (index > -1) {
      me.collectedAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
}

module.exports = new UserCtl();
