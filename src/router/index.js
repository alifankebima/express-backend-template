const express = require("express");
const router = express.Router();

const exampleRouter = require("./example");

router.use("/v1/example", exampleRouter);

module.exports = router;