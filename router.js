const Authentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");

// setup auth middleware with passport - tell it to use the jwt strategy and tell it not to create a cookie-based session
const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function(app) {
  app.post("/signup", Authentication.signup);

  app.post("/signin", requireSignin, Authentication.signin);

  app.get("/protected", requireAuth, (req, res, next) => {
    res.send("Hi there");
  });
}
