const express = require("express");
const {
  create,
  update,
  destroy,
  get,
  getAll,
  getOutput
} = require("../controllers/productController");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.route("/product").post(isAuthenticatedUser, create).get(isAuthenticatedUser, getAll);

router.route("/product/:id").get(isAuthenticatedUser, get).put(isAuthenticatedUser, update).delete(isAuthenticatedUser, destroy)

router.route("/getOutput").get(getOutput);

module.exports = router;
