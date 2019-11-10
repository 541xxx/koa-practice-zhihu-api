const { Schema, model } = require("mongoose");

const TopicSchema = new Schema(
  {
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    avatar_url: { type: String },
    introduction: { type: String }
  },
  { timestamps: true }
);

module.exports = model("Topic", TopicSchema);
