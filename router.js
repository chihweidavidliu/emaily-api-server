const Authentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

// middlewares
const requireGoogleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
const requireLogin = require("./middlewares/requireLogin");

module.exports = function(app) {
  // when user clicks signin with google, launches Oauth flow
  app.get("/auth/google", requireGoogleAuth);

  // when permision is given by user to access google details, code is sent to this server at this address - passport will
  // send the code back to google for confirmation and receive the accessToken and profile details, which are then
  // passed on to signin process
  app.get("/auth/google/callback", requireGoogleAuth, (req, res) => {
    res.redirect("/surveys");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.post("/api/stripe", requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: "gbp",
      source: req.body.id, // token obtained with Stripe.js
      description: `Charge for ${req.body.email}`
    });
    // update user's credits
    req.user.credits += 5;
    const updatedUser = await req.user.save();
    // send the updated user to the client
    res.send(updatedUser);
  });
};
