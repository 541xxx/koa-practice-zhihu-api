const Topic = require("../models/topics");
const User = require("../models/users");
const Question = require("../models/questions");

class TopicsCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(Number(ctx.query.page), 1) - 1;
    const perPage = Math.max(Number(per_page), 1);
    ctx.body = await Topic.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(page * perPage);
  }
  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectFields = fields
      ? fields
          .split(";")
          .filter(v => v)
          .map(v => ` +${v}`)
          .join("")
      : "";
    const topic = await Topic.findById(ctx.params.id).select(selectFields);
    if (!topic) {
      ctx.throw(404, '话题不存在');
    } else {
      ctx.body = topic;
    }
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const { name } = ctx.request.body;
    const repeatedTopic = await Topic.findOne({ name });
    if (repeatedTopic) {
      ctx.throw(409, "用户名已被占用");
    }
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = topic;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (!topic) {
      ctx.throw(404, "话题不存在");
    }
    ctx.body = topic;
  }
  async checkTopicExist(ctx, next) {
    const tipoc = await Topic.findById(ctx.params.id);
    if (!tipoc) {
      ctx.throw(404, "话题不存在");
    }
    await next();
  }
  /**
   * @description 获取某个话题的粉丝列表
   * @param {*} ctx
   * @memberof UserCtl
   */
  async listFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
  async listQuestions(ctx) {
    const questions = await Question.find({topics: ctx.params.id});
    ctx.body = questions;
  }
}

module.exports = new TopicsCtl();
