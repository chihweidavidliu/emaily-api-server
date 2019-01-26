const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const Schema = mongoose.Schema;
const jwt = require("jwt-simple");

// Define model
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,

  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
})



function generateUserToken(user) {

}

userSchema.methods.generateAuthToken = function() { // schema.methods defines instance methods (methods applied to instances of the model)
  const user = this;

  const timestamp = new Date().getTime();
  const token = jwt.encode({ sub: user._id, iat: timestamp }, process.env.JWT_SECRET);
  return token;

}

userSchema.statics.findByCredentials = function(email, password, done) {
  let User = this;
  return User.findOne({ email: email }).then((user) => {
    if(!user) { return done(null, false) }; // this will trigger done in passport local strategy

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res == true) {
          resolve(user)
        } else {
          reject();
        }
      })
    })
  })
}

//mongoose middleware (use the .pre() method on schema to set middleware)
userSchema.pre("save", function(next) { // this will hash all passwords every time a password is set or modified
  const user = this;

  if(user.isModified("password")) {
    // generate a salt
    bcrypt.genSalt(10, (err, salt) => { //genSalt(number of rounds of encryption, callback with err and salt parameters)
      // hash the password with the salt
      bcrypt.hash(user.password, salt, (err, hash) => { //hash takes 3 arguments, thing to be hashed, the salt to be used and a callback
        // set the user password as the hash
        user.password = hash;
        // need to call next for middleware to move on
        next();
      })
    })
  } else {
    // if password has not been modified, just move on
    next();
  }
})

// Create model class
const User = mongoose.model("user", userSchema);

// Export the model
module.exports = User;
