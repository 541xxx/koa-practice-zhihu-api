const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  gender: { type: String, enum: ["male", "female"], default: "male" },
  headline: { type: String },
  business: { type: String },
  locations: { type: [{ type: String }], select: false},
  employments: {
    type: [
      {
        company: { type: String },
        job: { type: String }
      }
		],
		select: false
  },
  educations: {
    type: [
      {
        school: { type: String },
        major: { type: String },
        diploma: { type: String },
        entrance_year: { type: String },
        graducation_year: { type: String }
      }
		],
		select: false
	},
	following: {
		type: [
			{type: Schema.Types.ObjectId, ref: 'User'}
		],
		select: false
	}
});

module.exports = model("User", userSchema);
