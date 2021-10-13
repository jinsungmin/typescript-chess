var express = require("express");
var router = express.Router();

// routers
const authRouter = require("./auth");
const userRouter = require("./user");

router.use("/auth", authRouter);
router.use("/user", userRouter);

module.exports = router;