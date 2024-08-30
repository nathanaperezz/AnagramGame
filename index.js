//Nathan Perez


const fs = require("fs");
let bufferDictionary = fs.readFileSync("./dictionary.txt");
const words = bufferDictionary.toString().split("\n");

// for (let i = 0; i < words.length; i++) {
//     console.log(words[i]);
// }



