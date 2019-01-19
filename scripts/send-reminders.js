// Twilio
const accountSID = process.env.ACCOUNT_SID || require('../config/twilio').accountSID;
const authToken = process.env.AUTH_TOKEN || require('../config/twilio').authToken;
const senderNumber = process.env.SENDER_NUMBER || require('../config/twilio').senderNumber;
const client = require('twilio')(accountSID, authToken);

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URI || require('../config/mongodb').MONGO_URI;
const dbName = 'foodhub';

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
  
    const db = client.db(dbName);
    const collection = db.collection('reminders');

    collection.find().sort({}).toArray((err, result) => {
        if (err) return console.log(err);

        result.forEach(document => {
            const message = constructMessage(document.user, document.reminders);
            const recipient = document.number;

            sendSMS(message, recipient, () => {
                console.log('Send SMS to: ' + document.user);
            });
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

const constructMessage = (user, reminders) => {
    let message = user + "\n";

    reminders.forEach((reminder, index) => {
        message += (index + 1) + ". " + reminder + "\n";
    });

    return message;
};