const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const token = '7081213657:AAHF6ylKZtwwK1gPrfusWOjcZB7MCdVr2qc';

 
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.on('message',function(msg){
    const request=require('request');
    request('https://pokeapi.co/api/v2/pokemon/'+msg.text+'/',function(error,response,body){
        if(JSON.parse(body).error){
            bot.sendMessage(msg.chat.id,"Please enter a valid name");
            return;
            
        }
        else{
            bot.sendMessage(msg.chat.id,"Name:"+JSON.parse(body).name);
            bot.sendMessage(msg.chat.id,"Id:"+JSON.parse(body).id);
            bot.sendMessage(msg.chat.id,"Height:"+JSON.parse(body).height);
            bot.sendMessage(msg.chat.id,"Weight:"+JSON.parse(body).weight);
        }
        db.collection('botReplies').add({
    chatId: chatId,
    userMessage: msg.text,
    botReply: reply,
    timestamp: new Date()
  })
    .then(() => {
      console.log("Reply stored successfully!");
    })
    .catch((error) => {
      console.error("Error storing reply: ", error);
    });
    })
})
