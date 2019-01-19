const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URI || require('../config/mongodb').MONGO_URI;
const dbName = 'foodhub';

MongoClient.connect(url, (err, client) => {
  if (err) return console.log(err);

  const db = client.db(dbName);
  const collection = db.collection('reminders');

  router.get('/', function(req, res, next) {
    collection.find().sort({}).toArray((err, result) => {
      if (err) return console.log(err);

      res.render('index', {items: result});
    });
  });

  router.post('/', function(req, res, next) {
    collection.updateOne(
      { 'user': req.body.user },
      { $push: {'reminders': req.body.reminder} },
      (err) => {
        if (err) return console.log(err);
        res.redirect('/');
    });
  });

  router.post('/reminder/remove', function(req, res, next) {
    collection.updateOne(
      { 'user': req.body.user },
      { $pull: {'reminders': req.body.reminder} },
      (err) => {
        if (err) return console.log(err);
        res.redirect('/');
    });
  });
});

module.exports = router;
