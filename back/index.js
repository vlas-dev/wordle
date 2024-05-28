const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000;

let wordBank = ['apple', 'bread', 'chair', 'dream', 'eagle', 'flame', 'grape', 'house', 'inbox', 'joker', 
'knife', 'lemon', 'melon', 'night', 'ocean', 'piano', 'queen', 'raven', 'sheep', 'tiger', 'uncle', 
'voice', 'water', 'xenon', 'yacht', 'zebra'];

function getRandomWord(wordBank) {
    let index = Math.floor(Math.random() * wordBank.length);
    return wordBank[index];
}

// Use the cors middleware
app.use(cors());

// Serve static files from the "front" directory
app.use(express.static(path.join(__dirname, '../front')));

app.get('/word', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let random_word = getRandomWord(wordBank);
    res.send({ word: random_word });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});