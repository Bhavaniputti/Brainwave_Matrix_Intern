const TelegramBot = require('node-telegram-bot-api');
const isPrime = require('is-prime');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const token = '7081213657:AAHF6ylKZtwwK1gPrfusWOjcZB7MCdVr2qc';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', function (msg) {
  const chatId = msg.chat.id;
  const text = parseInt(msg.text);
  let reply;

  if (isPrime(text)) {
    reply = `${text} is a prime number`;
  } else {
    reply = `${text} is not a prime number`;
  }

  // Send the reply to the user
  bot.sendMessage(chatId, reply);

  // Store the reply in Firestore
  db.collection('POKEDATA').add({
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
});
