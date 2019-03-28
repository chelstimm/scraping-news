var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var express = require("express");

// var router = express.Router();
var app = express();

var db = require("../models");
// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

  // A GET route for scraping the ksl website
 app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.theonion.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("header")
          .children("h1")
          .text();
        result.summary = $(this)
        .children(".item__content")
          .children(".excerpt")
          .children("p")
          .text();
        result.link = $(this)
          .children("header")
          .children("h1")
          .children("a")
          .attr("href");

        console.log(result);

        // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function(dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
            })
            .catch(function(err) {
              // If an error occurred, log it
              console.log(err);
            });
      });

      res.redirect("/");
      // Send a message to the client
      res.send("Scrape Complete");
      // res.redirect("/");
      // res.redirect("/articles");
    });
    
  });

  // Route for getting all Articles from the db
  app.get("/", function (req, res) {
    // Grab every document in the Articles collection
    console.log("dbArticle")
    db.Article.find({})
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        console.log(dbArticle)
        res.render('index', {
          articles: dbArticle
        })
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
      });
      
  });

  // Route for grabbing a specific Article by id, populate it with it's note
 app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({
        _id: req.params.id
      })
      // ..and populate all of the notes associated with it
      .populate("comments")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    console.log(req.body);
    // Create a new note and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function (dbComment) {
        return db.Article.findOneAndUpdate({
          _id: req.params.id
        }, {
          $push: { comments: dbComment._id }
        }, {
          new: true
        });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });

      app.delete("/deleteComment/:id", function (req, res) {
        console.log(req.params.id);
        db.Comment.deleteOne({
            _id: req.params.id
        })
            .then(function (dbComment) {
                res.json(dbComment);
                console.log("delete complete");
            })
            .catch(function (err) {
                console.log(err);
            });
    });
  });
module.exports = app;