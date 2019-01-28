const passport = require("passport");
const User = require("../models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");
const GoogleStrategy = require('passport-google-oauth20').Strategy;



// Google OAuth strategy

const googleOptions = {
  clientID: process.env.GOOGLE_OAUTH_ID,
  clientSecret: process.env.GOOGLE_OAUTH_SECRET,
  callbackURL: "/auth/google/callback"
}

const googleLogin = new GoogleStrategy(googleOptions, (accessToken, refreshToken, profile, done) => {
  const googleID = profile.id;
  const email = profile.emails[0]["value"];
  User
    .findOne({ googleID: googleID })
    .then(user => {
      if(user) {
        console.log("Found user")
        done(null, user); // if user is found, call done with no error and the user data
      } else {
        console.log("Creating new user")
        const user = new User({ email: email, googleID: googleID });
        user
          .save()
          .then(() => done(null, user));
      }
    })
    .catch(err => done(err, false)); // return error and false if search failed to occur
});

// Create JwtStrategy
// Set up options for JwtStrategy to tell it where to extract the jwt from the req etc. and the secret needed to decode it
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => { // the payload is the decoded jwt token with the sub and iat properties
  // see if the userid in the payload exists in our db, if so, call done with that userid
  User
    .findById(payload.sub)
    .then(user => {
      if(user) {
        done(null, user) // if user is found, call done with no error and the user data
      } else {
        done(null, false) // otherwise call done without a user object
      }
    })
    .catch(err => done(err, false)); // return error and false if search failed to occur

});

// create local strategy
const localOptions = {
  usernameField: "email", // tell local strategy to use email value as the 'username' instead of 'username' - password is handled automatically
}

const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // verify username and password, call done with user if validated
  User
    .findByCredentials(email, password, done) // pass done to the User method for error handling
    .then(user => done(null, user)) // if a user is returned, tell passport to continue to next step of the route, passing on the user
    .catch(err => done(err, false)) // return error and false if search failed to occur
});

// tell passport to use these strategies
passport.use(jwtLogin);
passport.use(localLogin);
passport.use(googleLogin);
