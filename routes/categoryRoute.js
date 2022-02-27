const express = require("express");
const {
  create,
  update,
  destroy,
  get,
  getAll
} = require("../controllers/categoryController");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.route("/category").post(isAuthenticatedUser, create).get(isAuthenticatedUser, getAll);

router.route("/category/:id").get(isAuthenticatedUser, get).put(isAuthenticatedUser, update).delete(isAuthenticatedUser, destroy)



module.exports = router;
