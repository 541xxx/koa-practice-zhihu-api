const { Schema, model } = require("mongoose");

const QuestionSchema = new Schema(
  {
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    description: { type: String },
    questioner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false
    },
    topics: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Topic"
        }
      ],
      select: false
    }
  },
  { timestamps: true }
);

module.exports = model("Question", QuestionSchema);
