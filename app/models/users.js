const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    headline: { type: String },
    business: { type: Schema.Types.ObjectId, ref: "Topic", select: false },
    locations: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      select: false
    },
    employments: {
      type: [
        {
          company: { type: Schema.Types.ObjectId },
          job: { type: Schema.Types.ObjectId }
        }
      ],
      select: false
    },
    educations: {
      type: [
        {
          school: { type: Schema.Types.ObjectId },
          major: { type: Schema.Types.ObjectId },
          diploma: { type: String },
          entrance_year: { type: String },
          graducation_year: { type: String }
        }
      ],
      select: false
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      select: false
    },
    followingTopics: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      select: false
    },
    likedAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false
    },
    dislikedAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false
    },
    collectedAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
      select: false
    }
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
