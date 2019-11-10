const Answer = require("../models/answers");
const User = require("../models/users");

class answersCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(Number(ctx.query.page), 1) - 1;
    const perPage = Math.max(Number(per_page), 1);
    const q = new RegExp(ctx.query.q);
    ctx.body = await Answer.find({
      content: q,
      questionId: ctx.params.questionId
    })
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
    console.log(ctx.params);
    const answer = await Answer.findById(ctx.params.id)
      .select(selectFields)
      .populate("answerer");
    // if (!answer) {
    //   ctx.throw(404, "答案不存在");
    // }
    // if (answer.questionId !== ctx.params.questionId) {
    //   ctx.throw(404, "该问题下没有此答案");
    // }
    ctx.body = answer;
  }
  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById(ctx.params.id).select("+answerer");
    if (!answer) {
      ctx.throw(404, "答案不存在");
    }
    // The statement only for get, delete and update a question.
    // when the middleware is used in like or unlike the statement will be skipped
    if (ctx.params.questionId && ctx.params.questionId !== answer.questionId) {
      ctx.throw(404, "该问题下没有此答案");
    }
    ctx.state.answer = answer;
    await next();
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
    });
    const answerer = ctx.state.user._id;
    const questionId = ctx.params.questionId;
    const answer = await new Answer({
      ...ctx.request.body,
      answerer,
      questionId
    }).save();
    ctx.body = answer;
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: false },
    });
    await ctx.state.answer.update(ctx.request.body);
    ctx.body = ctx.state.answer;
  }
  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state;
    if (answer.answerer.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  async del(ctx) {
    await Answer.findByIdAndRemove(ctx.params.id);
    ctx.status = 204;
  }
  /**
   * @description 获取某个话题的粉丝列表
   * @param {*} ctx
   * @memberof UserCtl
   */
  async listFollowers(ctx) {
    const users = await User.find({ followinganswers: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new answersCtl();
