const Question = require("../models/questions");
const User = require("../models/users");

class questionsCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(Number(ctx.query.page), 1) - 1;
    const perPage = Math.max(Number(per_page), 1);
    const q = new RegExp(ctx.query.q);
    // $or 多个条件匹配, 可以嵌套
    ctx.body = await Question.find({ $or: [{ title: q }, { description: q }] })
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
    const question = await Question.findById(ctx.params.id)
      .select(selectFields)
      .populate("questioner topics");
    if (!question) {
      ctx.throw(404, "问题不存在");
    } else {
      ctx.body = question;
    }
  }
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id).select(
      "+questioner"
    );
    if (!question) {
      ctx.throw(404, "问题不存在");
    }
    ctx.state.question = question;
    await next();
  }
  async create(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      description: { type: "string", required: false }
    });
    const { title } = ctx.request.body;
    const repeatedTitle = await Question.findOne({ title });
    if (repeatedTitle) {
      ctx.throw(409, "问题已存在");
    }
    console.log(ctx);
    const topic = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id
    }).save();
    ctx.body = topic;
  }
  async update(ctx) {
    console.log(ctx.request.body, 21312322);
    ctx.verifyParams({
      title: { type: "string", required: false },
      description: { type: "string", required: false }
    });
    await ctx.state.question.update(ctx.request.body);
    ctx.body = ctx.state.question;
  }
  async checkQuestioner(ctx, next) {
    const { question } = ctx.state;
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  async del(ctx) {
    await Question.findByIdAndRemove(ctx.params.id);
    ctx.status = 204;
  }
  /**
   * @description 获取某个话题的粉丝列表
   * @param {*} ctx
   * @memberof UserCtl
   */
  async listFollowers(ctx) {
    const users = await User.find({ followingquestions: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new questionsCtl();
