const Router = require("koa-router");
const router = new Router({ prefix: "/users" });
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  deleteUser,
  login,
  listFollowing,
  listFollowers,
  follow,
  unfollow,
  followTopic,
  unfollowTopic,
  checkUserExist,
  listFollowingTopics,
  listQuestions,
  listLikedAnswers,
  likeAnswer,
  unlikeAnswer,
  listDislikedAnswers,
  dislikeAnswer,
  undislikeAnswer,
  listCollectedAnswers,
  collectAnswer,
  uncollectAnswer
} = require("../controllers/users");
const { checkTopicExist } = require("../controllers/topics");
const { checkAnswerExist } = require("../controllers/answers");

const { secret } = require("../config");
const auth = jwt({ secret });

const checkOwner = async (ctx, next) => {
  if (ctx.state.user._id !== ctx.params.id) {
    ctx.throw(403, "没有权限");
  }
  await next();
};

router.get("/", find);
router.post("/", create);
router.get("/:id", findById);
router.patch("/:id", auth, checkOwner, update);
router.delete("/:id", auth, checkOwner, deleteUser);
router.post("/login", login);
router.get("/:id/following", listFollowing);
router.get("/:id/followers", listFollowers);
router.put("/following/:id", auth, checkUserExist, follow);
router.delete("/following/:id", auth, checkUserExist, unfollow);
router.put("/followingTopics/:id", auth, checkTopicExist, followTopic);
router.put("/followingTopics/:id", auth, checkTopicExist, unfollowTopic);
router.delete("/followingTopics/:id", auth, checkTopicExist, unfollowTopic);
router.get("/:id/followingTopics", listFollowingTopics);
router.get("/:id/questions", listQuestions);

router.get("/:id/likedAnswers", listLikedAnswers);
// 赞的时候取消踩
router.put("/likeAnswer/:id", auth, likeAnswer, undislikeAnswer);
router.delete("/unlikeAnswer/:id", auth, unlikeAnswer);
router.get("/:id/dislikedAnswers", listDislikedAnswers);
// 踩的时候取消赞
router.put("/dislikeAnswer/:id", checkAnswerExist, auth, dislikeAnswer, unlikeAnswer);
router.delete("/undislikeAnswer/:id", checkAnswerExist, auth, undislikeAnswer);
router.get("/:id/collectedAnswers", listCollectedAnswers);
router.put("/collectAnswer/:id", checkAnswerExist, auth, collectAnswer);
router.delete("/uncollectAnswer/:id", checkAnswerExist, auth, uncollectAnswer);


module.exports = router;
