const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const encryption = require("../util/encryption");

function validateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: "Validation failed, entered data is incorrect!",
      errors: errors.array(),
    });
    return false;
  }

  return true;
}

module.exports = {
  register: (req, res, next) => {
    const { username, password, email, repeatPassword } = req.body;
    if (validateUser(req, res)) {
      if (password !== repeatPassword) {
        const error = new Error("Passwords should match!");
        error.statusCode = 401;
        throw error;
      }
      const salt = encryption.generateSalt();
      const hashedPassword = encryption.generateHashedPassword(salt, password);
      User.create({
        email,
        hashedPassword,
        username,
        salt,
      })
        .then((user) => {
          const token = jwt.sign(
            {
              username: user.username,
              userId: user._id.toString(),
            },
            "somesupersecret",
            { expiresIn: "1h" }
          );

          res.status(201).json({
            message: "User created!",
            token,
            userId: user._id,
            username: user.username,
            isAdmin: user.roles.indexOf("Admin"),
          });
        })
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }

          next(error);
        });
    }
  },
  login: (req, res, next) => {
    const { username, password } = req.body;

    User.findOne({ username })
      .then((user) => {
        if (!user) {
          const error = new Error("Incorrect username / password!");
          error.statusCode = 401;
          throw error;
        }
        if (!password) {
          const error = new Error("You must enter a password!");
          error.statusCode = 401;
          throw error;
        }

        if (!user.authenticate(password)) {
          const error = new Error("Incorrect username / password!");
          error.statusCode = 401;
          throw error;
        }

        const token = jwt.sign(
          {
            username: user.username,
            userId: user._id.toString(),
          },
          "somesupersecret",
          { expiresIn: "1h" }
        );

        res.status(200).json({
          message: "User successfully logged in!",
          token,
          userId: user._id.toString(),
          username: user.username,
          isAdmin: user.roles.indexOf("Admin"),
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }

        next(error);
      });
  },
};
