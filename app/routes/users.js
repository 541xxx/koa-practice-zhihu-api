const Router = require("koa-router");
const router = new Router();
const jwt = require("koa-jwt");
const {
  find,
  create,
  findById,
  update,
  deleteUser,
  login
} = require("../controllers/users");

const { secret } = require("../config");
const auth = jwt({ secret });

const checkOwner = async (ctx, next) => {
  if (ctx.state.user._id !== ctx.params.id) {
    ctx.throw(403, "没有权限");
  }
  await next();
};

router.get("/users", find);
router.post("/users", create);
router.get("/users/:id", findById);
router.patch("/users/:id", auth, checkOwner, update);
router.delete("/users/:id", auth, checkOwner, deleteUser);
router.post("/login", login);

module.exports = router;
