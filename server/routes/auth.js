const router = require("express").Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/User");

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please enter a valid password."),
    body("username")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter a valid username."),
  ],
  authController.register
);
router.post("/register", authController.register);

module.exports = router;
