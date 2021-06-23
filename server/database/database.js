const mongoose = require("mongoose");
const User = require("../models/User");
mongoose.Promise = global.Promise;
module.exports = () => {
  const dbConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };
  mongoose.connect(
    "mongodb://localhost:27017/movie-react-app",
    dbConnectionOptions
  );
  const db = mongoose.connection;
  db.once("open", (err) => {
    if (err) throw err;
    User.seedAdminUser()
      .then(() => {
        console.log("Database ready");
      })
      .catch((reason) => {
        console.log("Something went wrong");
        console.log(reason);
      });
  });

  db.on("error", (reason) => {
    console.log(reason);
  });
};
