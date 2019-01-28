const Authentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");

// setup auth middleware with passport - tell it to use the jwt strategy and tell it not to create a cookie-based session
const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });
const requireGoogleSignin = passport.authenticate("google", { scope: ["profile", "email"], session: false });

module.exports = function(app) {
  app.get("/", (req, res, next) => {
    res.send({ hi: "there" });
  })

  app.post("/signup", Authentication.signup);

  // when user clicks signin with google, launches Oauth flow
  app.get("/auth/google", requireGoogleSignin);

  // when permision is given by user to access google details, code is sent to this server at this address - passport will
  // send the code back to google for confirmation and receive the accessToken and profile details, which are then
  // passed on to signin process
  app.get("/auth/google/callback", requireGoogleSignin, Authentication.signin);

  app.post("/signin", requireSignin, Authentication.signin);

  app.get("/protected", requireAuth, (req, res, next) => {
    res.send("Hi there");
  });
}
