const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require('mongoose');
const cors = require("cors");
const helmet = require("helmet");

require('./config/config.js'); // set up environment variables and ports/databases
const router = require("./router"); // import router with routes


// App setup / middlewares
const app = express();
// app.use(morgan("combined")); // logging framework
app.use(cors());
app.use(helmet()); // protects against various attacks
app.use(bodyParser.json({ type: "*/*" })); // use bodyParser to parse request as JSON
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // parse req body middleware for form submission
app.use(express.static("public")); // middleware that sets up static directory in a folder of your choice - for your pages which don't need to be loaded dynamically
router(app); // call our router with app


// Database setup
mongoose.Promise = global.Promise; // tell mongoose to use native promise functionality
mongoose.connect(process.env.MONGODB_URI).catch((err) => {console.log('There was an error', err)}); // don't need to pass in a callback for async connect - mongoose takes care of that - can simply start typing new code below

// Server setup
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});


module.exports = {
  app: app
}
