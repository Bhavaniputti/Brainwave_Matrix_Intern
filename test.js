const TelegramBot = require('node-telegram-bot-api');
const isPrime = require('is-prime');

const token = '7081213657:AAHF6ylKZtwwK1gPrfusWOjcZB7MCdVr2qc';

 
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.on('message',function(msg){
     bot.sendMessage(msg.chat.id,"hii");
});
const isPrime = require('is-prime');
const factorial = require('factorial');bot.on('message', (msg) => {
    const input = msg.text;
  
    const Split = input.split('-');
  
    
    if (Split.length !== 2) {
      bot.sendMessage(msg.chat.id, "Invalid format. Please use 'method-number', e.g., 'prime-5', 'fact-5', or 'even-odd-5'.");
      return;
    }
  
    const choice = Split[0];
    const num = parseInt(Split[1]);
  
    if (isNaN(num)) {
      bot.sendMessage(msg.chat.id, "Please enter a valid number.");
      return;
    }
  
    switch (choice) {
      case 'prime':
        if (isPrime(num)) {
          bot.sendMessage(msg.chat.id, "The number is Prime");
        } else {
          bot.sendMessage(msg.chat.id, "The number is not a prime");
        }
        break;
        
      case 'fact':
        if (num < 0) {
          bot.sendMessage(msg.chat.id, "undefined");
        } else {
          bot.sendMessage(msg.chat.id, `The factorial of ${num} is ${factorial(num)}.`);
        }
        break;
        
      case 'even-odd':
        if (num % 2 === 0) {
          bot.sendMessage(msg.chat.id, "The number is a even");
        } else {
          bot.sendMessage(msg.chat.id, "The number is odd");
        }
        break;
  
      default:
        bot.sendMessage(msg.chat.id, "Please use 'prime', 'fact', or 'even-odd'.");
    }
  });
  
  