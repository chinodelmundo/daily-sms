const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URI || require('../config/mongodb').MONGO_URI;
const dbName = 'daily-sms';

MongoClient.connect(url, (err, client) => {
  if (err) return console.log(err);

  const db = client.db(dbName);
  const collection = db.collection('reminders');

  router.get('/', function(req, res, next) {
    collection.find().sort({}).toArray((err, result) => {
      if (err) return console.log(err);

      const formattedResult = formatReminders(result);
      res.render('index', {items: formattedResult});
    });
  });

  router.post('/', function(req, res, next) {
    const reminderType = req.body.type;

    if(reminderType == 'daily') {
      collection.updateOne(
        { 'user': req.body.user },
        { $push: {'reminders.daily': req.body.reminder} },
        (err) => {
          if (err) return console.log(err);
          res.redirect('/');
      });
    } else if(reminderType == 'weekly') {
      collection.updateOne(
        { 'user': req.body.user },
        { $push: {'reminders.weekly': req.body.reminder} },
        (err) => {
          if (err) return console.log(err);
          res.redirect('/');
      });
    }
  });

  router.post('/reminder/daily/remove', function(req, res, next) {
    collection.updateOne(
      { 'user': req.body.user },
      { $pull: { 'reminders.daily' : req.body.reminder.replace(/_/g, " ") } },
      (err) => {
        if (err) return console.log(err);
        res.redirect('/');
    });
  });

  router.post('/reminder/weekly/remove', function(req, res, next) {
    collection.updateOne(
      { 'user': req.body.user },
      { $pull: { 'reminders.weekly' : req.body.reminder.replace(/_/g, " ") } },
      (err) => {
        if (err) return console.log(err);
        res.redirect('/');
    });
  });
});


const formatReminders = (result) => {
  result = result.map(reminderDoc => {
    reminderDoc.reminders.daily = reminderDoc.reminders.daily.map(reminder => {
      return {
        real: reminder,
        formatted: reminder.replace(/ /g, "_")
      };
    });

    reminderDoc.reminders.weekly = reminderDoc.reminders.weekly.map(reminder => {
      return {
        real: reminder,
        formatted: reminder.replace(/ /g, "_")
      };
    });

    return reminderDoc;
  });
  
  return result;
};

module.exports = router;
