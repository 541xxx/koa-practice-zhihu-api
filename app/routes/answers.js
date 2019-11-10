const Router = require("koa-router");
const router = new Router({ prefix: "/questions/:questionId/answers" });
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  checkAnswerExist,
  checkAnswerer,
  del
} = require("../controllers/answers");

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
router.get("/:id", checkAnswerExist, findById);
router.patch("/:id", auth, checkAnswerExist, checkAnswerer, update);
router.delete("/:id", auth, checkAnswerExist, checkAnswerer, del);

module.exports = router;
