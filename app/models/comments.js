const { Schema, model } = require("mongoose");

const CommentSchema = new Schema(
  {
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    commentator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false
    },
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    rootCommentId: { type: String },
    replyTo: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = model("Comment", CommentSchema);
