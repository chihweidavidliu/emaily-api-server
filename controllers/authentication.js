const User = require("../models/user");

exports.signup = (req, res, next) => {
  console.log(req.body);
  const email = req.body.email;
  if(!req.body.password || req.body.password === "") { return res.status(400).send({ message: "Password is required" })};
  const password = req.body.password;

  // see if user with a given email exists
  User.findOne({ email: email }).then((existingUser) => {
    // if a user with email does exist, return error
    if(existingUser) {
      return res.status(400).send({ message: "Email is in use" });
    }
    // if a user with email does not exist, create and save user record, passing in object of user detail
    const user = new User({
      email: email,
      password: password
    });

    user.save().then((err) => {
      // send back a JWT token on successful signup
      const token = user.generateAuthToken();
      res.json({ token: token });

    }).catch((err) => {
      return res.status(400).send(err);
    });

  }).catch((err) => res.status(400).send(err));

};

exports.signin = (req, res, next) => {
  const user = req.user;
  const token = user.generateAuthToken();
  res.send({ token: token });
}
