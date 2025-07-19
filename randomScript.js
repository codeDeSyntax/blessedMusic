// randomScript.js
// This is a randomly generated JS file for testing purposes.

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomGreeting() {
  const greetings = [
    "Hello!",
    "Hi there!",
    "Greetings!",
    "Welcome!",
    "Good day!",
    "Hey!",
    "Howdy!",
    "Yo!",
    "What's up?",
    "Salutations!",
  ];
  return greetings[getRandomInt(greetings.length)];
}

console.log(randomGreeting());
