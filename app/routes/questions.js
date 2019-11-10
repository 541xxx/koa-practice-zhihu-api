const Router = require("koa-router");
const router = new Router({ prefix: "/questions" });
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  checkQuestionExist,
  checkQuestioner,
  del
} = require("../controllers/questions");

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
router.get("/:id", checkQuestionExist, findById);
router.patch("/:id", auth, checkQuestionExist, checkQuestioner, update);
router.delete("/:id", auth, checkQuestionExist, checkQuestioner, del);

module.exports = router;
