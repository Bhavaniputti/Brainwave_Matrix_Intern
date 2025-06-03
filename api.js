const TelegramBot = require('node-telegram-bot-api');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const request = require('request'); // Ensure request module is imported

const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const token = '7081213657:AAHF6ylKZtwwK1gPrfusWOjcZB7MCdVr2qc';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async function (msg) {
    const messageText = msg.text.toLowerCase().split(" ");
    const command = messageText[0];
    const pokemonName = messageText[1];

    if (command === 'insert' && pokemonName) {
        // Fetch data from API
        request(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, function (error, response, body) {
            if (error) {
                bot.sendMessage(msg.chat.id, "Error fetching Pokémon data.");
                return;
            }

            const data = JSON.parse(body);
            if (data.detail) {
                bot.sendMessage(msg.chat.id, "Please enter a valid Pokémon name.");
                return;
            }

            const pokeDetails = {
                name: data.name,
                height: data.height,
                weight: data.weight,
                abilities: data.abilities.map(a => a.ability.name).join(", "),
                types: data.types.map(t => t.type.name).join(", ")
            };

            db.collection('pokemons').add(pokeDetails)
                .then(() => bot.sendMessage(msg.chat.id, `Pokémon ${data.name} saved successfully.`))
                .catch(err => console.log(err));
        });
    } else if (command === 'get' && pokemonName) {
        // Check if Pokémon exists in Firestore
        db.collection('pokemons').where("name", "==", pokemonName).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const pokeData = snapshot.docs[0].data();
                    bot.sendMessage(msg.chat.id, `Name: ${pokeData.name}`);
                    bot.sendMessage(msg.chat.id, `Height: ${pokeData.height}`);
                    bot.sendMessage(msg.chat.id, `Weight: ${pokeData.weight}`);
                    bot.sendMessage(msg.chat.id, `Abilities: ${pokeData.abilities}`);
                    bot.sendMessage(msg.chat.id, `Types: ${pokeData.types}`);
                } else {
                    bot.sendMessage(msg.chat.id, "Pokémon not found in the database. Use 'insert <pokemon>' to add it.");
                }
            })
            .catch(err => console.log(err));
    } else {
        bot.sendMessage(msg.chat.id, "Invalid command. Use 'insert <pokemon>' to store and 'get <pokemon>' to retrieve.");
    }
});
