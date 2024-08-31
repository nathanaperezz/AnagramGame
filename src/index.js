//Nathan Perez


let time = 10;
let timerStarted = false;
let gameOver = false;
let dictionary = new Array(70000);
let usedWords = new Array(1000);
let score = 0;
let numWords = 0;
let letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
let countdownInterval;
document.getElementById("availableLetters").textContent = getAvailableLetters(letters);

function getAvailableLetters(letters) {
    let availableLetters = "";
    let spacing = "     ";

    for (let i = 0; i < letters.length; i++) {
        availableLetters = availableLetters.concat(letters[i]);
        availableLetters = availableLetters.concat(spacing);
    }
    return availableLetters;
}

function getUsedWords(usedWords, numWords) {

    const spacing = ", ";

    let wordList = usedWords[0];

    for (let i = 1; i < numWords; i++) {
        wordList = wordList.concat(spacing);
        wordList = wordList.concat(usedWords[i]);
    }

    return wordList;
}

// IsAnagram returns true if word is valid anagram of letters
function IsAnagram(word, letters) {

    let tempLetters = [...letters];

    let j = 0;
    for (let i = 0, l = word.length; i < l; i++) {
        for (j = 0; j < tempLetters.length; j++) {
            if(word[i] === tempLetters[j]) {
                tempLetters[j] = "0";
                break;
            }
        }
        if(j === tempLetters.length) {
            console.log("failed");
            return false
        }

    }

    console.log("passed");
    return true;
}


// IsWord returns true if word is in dictionary. Uses binary search
function IsWordInArray(arr, target, left, right) {
    if (left > right) return false;

    let mid = Math.floor((left + right) / 2);
    console.log("mid = ", mid);

    let compare = arr[mid].localeCompare(target)
    console.log("comparing " + arr[mid] + " and " + target);

    if (compare === 0) return true;

    else if (compare === 1) {
        console.log("searching left")
        return IsWordInArray(arr, target, left, mid - 1);
    }
    else {
        console.log("searching right");
        return IsWordInArray(arr, target, mid + 1, right);
    }
}


//returns true if word is an unused real word anagram
function IsValid(word, letters, dictionary) {
    //check if word has already been used
    if(IsWordInArray(usedWords, word, 0, numWords - 1))
        return false;

    //check if word is a valid anagram using set letters
    if(!IsAnagram(word, letters))
        return false;

    //check if word is in dictionary
    if(!IsWordInArray(dictionary, word, 0, dictionary.length - 1))
        return false;

    console.log("word is valid");
    return true;
}



// Fetch the dictionary.txt file
fetch('dictionary.txt')
    .then(response => response.text())
    .then(data => {
        dictionary = data.split("\n");
        console.log("dictionary added");
    })
    .catch(error => console.error('Error fetching the file:', error));




// Add an event listener to the input element
document.getElementById("userInput").addEventListener("keydown", function(event) {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {

        if(!timerStarted) {
            countdownInterval = setInterval(updateCountdown, 1000);
            timerStarted = true;
        }


        let input = document.getElementById("userInput").value;
        console.log(input);


        if(IsValid(input, letters, dictionary)) {

            let points = input.length

            usedWords[numWords] = input;
            numWords++;

            score += points;

            time += points * points;
            countdownElement.innerHTML = time;
        }

        document.getElementById("score").textContent = "Your score: " + score;
        if(numWords)
            document.getElementById("usedWords").textContent = "Your words: " + getUsedWords(usedWords, numWords);

        // Clear the input field after submission
        document.getElementById("userInput").value = '';
    }
});



// Get the countdown element from the DOM
let countdownElement = document.getElementById('countdown');

// Function to update the countdown
function updateCountdown() {

    countdownElement.innerHTML = time;

    time--;

    if (time <= 3) {
        countdownElement.style.color = '#ff4444'; // Red text
    } else {
        countdownElement.style.color = '#008000'; //  green text
    }


    // If countdown reaches zero, stop the timer
    if (time < 0) {
        clearInterval(countdownInterval);
        countdownElement.innerHTML = "Time's up!";
        gameOver = true;

        let userInput = document.getElementById('userInput');
        userInput.style.display = 'none';

        if(numWords === 0) {
            document.getElementById("endScore").value = "Womp womp. You didn't even get 1.";
        }
        else if(numwords === 1) {
            document.getElementById("endScore").value = "You got 1 word and a score of " + score + ". Better luck next time.";
        }
        else {
            document.getElementById("endScore").value = "Good job! You got " + numWords + " words and a score of " + score + "!";
        }
    }
}



