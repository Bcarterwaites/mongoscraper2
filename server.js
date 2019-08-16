// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser")
var mongoose = require("mongoose")

// Port setup
var PORT = process.env.PORT || 8080;

// Initialize express app
var app = express();

var router = express.Router();

// Require our routes file pass our router object
require("./config/routes")(router);

// Public folder setup
app.use(express.static("public"));

// Connect handlebars to Express app
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars")

// User bodParser in our app
app.use(bodyParser.urlencoded({
    extended: false
}))

// Have every request go through our router middleware
app.use(router);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var db = process.env.MONGODB_URI || "mongodb://localhost/scraper";

// Connect mongoose to our database
mongoose.connect(db, function(error) {
    // Log any errors connecting with mongoose
    if (error) {
        console.log(error);
    }
    // Or log a success message
    else {
        console.log("mongoose connection is sucessful");
    }
});

// Listen on the port
app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
})
