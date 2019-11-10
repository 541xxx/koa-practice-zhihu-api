const Comment = require("../models/comments");
const User = require("../models/users");

class commentsCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(Number(ctx.query.page), 1) - 1;
    const perPage = Math.max(Number(per_page), 1);
    const q = new RegExp(ctx.query.q);
    const { questionId, answerId } = ctx.params;
    const { rootCommentId } = ctx.query;
    ctx.body = await Comment.find({
      content: q,
      questionId,
      answerId,
      rootCommentId
    })
      .limit(perPage)
      .skip(page * perPage)
      .populate("commentator replyTo");
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
    const comment = await Comment.findById(ctx.params.id)
      .select(selectFields)
      .populate("commentator");
    // if (!comment) {
    //   ctx.throw(404, "答案不存在");
    // }
    // if (comment.questionId !== ctx.params.questionId) {
    //   ctx.throw(404, "该问题下没有此答案");
    // }
    ctx.body = comment;
  }
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select(
      "+commentator"
    );
    if (!comment) {
      ctx.throw(404, "评论不存在");
    }
    // The statement only for get, delete and update a question.
    // when the middleware is used in like or unlike the statement will be skipped
    // console.log(ctx.params.id, comment.questionId);
    if (ctx.params.questionId && ctx.params.questionId !== comment.questionId) {
      ctx.throw(404, "该问题下没有此评论");
    }
    if (ctx.params.answerId && ctx.params.answerId !== comment.answerId) {
      ctx.throw(404, "该答案下没有此评论");
    }
    ctx.state.comment = comment;
    await next();
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
      rootCommentId: { type: "string", required: false },
      replyTo: { type: "string", required: false }
    });
    // 当创建的是二级评论的时候理论上需要先判断一下该评论是否存在
    const { rootCommentId } = ctx.request.body;
    if (ctx.request.body.rootCommentId) {
      const comment = await Comment.findById(rootCommentId).select(
        "+commentator"
      );
      if (!comment) {
        ctx.throw(404, "该评论不存在");
      }
    }
    const commentator = ctx.state.user._id;
    const { questionId, answerId } = ctx.params;
    const comment = await new Comment({
      ...ctx.request.body,
      commentator,
      questionId,
      answerId
    }).save();
    ctx.body = comment;
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: false }
    });
    const { content } = ctx.request.body;
    await ctx.state.comment.update({ content });
    ctx.body = ctx.state.comment;
  }
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state;
    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  async del(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id);
    ctx.status = 204;
  }
  /**
   * @description 获取某个话题的粉丝列表
   * @param {*} ctx
   * @memberof UserCtl
   */
  async listFollowers(ctx) {
    const users = await User.find({ followingcomments: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new commentsCtl();
