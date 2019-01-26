// Twilio
const accountSID = process.env.ACCOUNT_SID || require('../config/twilio').accountSID;
const authToken = process.env.AUTH_TOKEN || require('../config/twilio').authToken;
const senderNumber = process.env.SENDER_NUMBER || require('../config/twilio').senderNumber;
const client = require('twilio')(accountSID, authToken);

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URI || require('../config/mongodb').MONGO_URI;
const dbName = 'daily-sms';

const day = new Date().getDay();

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
  
    const db = client.db(dbName);
    const collection = db.collection('reminders');

    collection.find().sort({}).toArray((err, result) => {
        if (err) return console.log(err);

        result.forEach(document => {
            if(document.reminders.daily.length > 0) {
                const message = constructMessage(document.user, document.reminders.daily, 'Daily Reminders');
                const recipient = document.number;
    
                sendSMS(message, recipient, () => {
                    console.log('Send SMS to: ' + document.user);
                });
            }

            if(document.reminders.weekly.length > 0 && day == 6) {
                const message = constructMessage(document.user, document.reminders.weekly, 'Weekly Reminders');
                const recipient = document.number;
    
                sendSMS(message, recipient, () => {
                    console.log('Send SMS to: ' + document.user);
                });
            }
        });
    });
    
    client.close();
});
  
const sendSMS = (message, recipient, callback) => {
    client.messages
        .create({
            body: message,
            from: senderNumber,
            to: recipient
        })
        .then(message => console.log(message.sid))
        .done();

    callback();
};

const constructMessage = (user, reminders, type) => {
    let message = user + '\n' + type + '\n';

    reminders.forEach((reminder, index) => {
        message += (index + 1) + ". " + reminder + '\n';
    });

    return message;
};