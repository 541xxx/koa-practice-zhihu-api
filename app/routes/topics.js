const Router = require("koa-router");
const router = new Router({ prefix: "/topics" });
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  listFollowers,
  checkTopicExist,
  listQuestions
} = require("../controllers/topics");

const { secret } = require("../config");
const auth = jwt({ secret });

const checkOwner = async (ctx, next) => {
  if (ctx.state.user._id !== ctx.params.id) {
    ctx.throw(403, "没有权限");
  }
  await next();
};

router.get("/", find);
router.post("/", auth, create);
router.get("/:id", checkTopicExist, findById);
router.patch("/:id", auth, checkTopicExist, update);
router.get("/:id/followers", checkTopicExist, listFollowers);
router.get("/:id/questions", checkTopicExist, listQuestions);

module.exports = router;
