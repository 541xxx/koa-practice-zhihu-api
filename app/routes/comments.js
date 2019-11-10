const Router = require("koa-router");
const router = new Router({ prefix: "/questions/:questionId/answers/:answerId/comments" });
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  checkCommentExist,
  checkCommentator,
  del
} = require("../controllers/comments");

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
router.get("/:id", checkCommentExist, findById);
router.patch("/:id", auth, checkCommentExist, checkCommentator, update);
router.delete("/:id", auth, checkCommentExist, checkCommentator, del);

module.exports = router;
