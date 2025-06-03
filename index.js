const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const token = '7081213657:AAHF6ylKZtwwK1gPrfusWOjcZB7MCdVr2qc';
const bot = new TelegramBot(token, {polling: true});
bot.on('message', function(mg){


  const msg = mg.text;

  const newMsg = msg.split(" ")
  if(newMsg[0]=='INSERT'){
    //Insert the data to database with key
    db.collection('StudentData').add({
      key:newMsg[1],
      dataValue:newMsg[2],
      userID:mg.from.id
  }).then(()=>{
    bot.sendMessage(mg.chat.id, newMsg[1] + " stored sucessfully ")
  })

  }
  else if(newMsg[0]=='GET'){
    //Get the data to database with key
    db.collection('StudentData').where('userID', '==', mg.from.id).get().then((docs)=>{
      docs.forEach((doc) => {
            bot.sendMessage(mg.chat.id, doc.data().key + " " + doc.data().dataValue)
          });
    })
  }
  else{
    bot.sendMessage(mg.chat.id, "Please make sure you keeping GET or INSERT in your message to insert the data or GET the data")
  }
 
})
