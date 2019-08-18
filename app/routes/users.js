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
  checkUserExist
} = require("../controllers/users");

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

module.exports = router;
