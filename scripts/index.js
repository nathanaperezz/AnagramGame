//Nathan Perez

document.addEventListener('DOMContentLoaded', function() {
    // Game state variables
    let time = 15;
    let timerStarted = false;
    let gameOver = false;
    let dictionary = [];
    let usedWords = [];
    let score = 0;
    let numWords = 0;
    let countdownInterval;
    let letters = [];
    let isDictionaryLoaded = false;
    let originalWord = '';

    // Get DOM elements
    const countdownElement = document.getElementById('countdown');
    const startButton = document.getElementById('startButton');
    const userInput = document.getElementById('userInput');
    const availableLetters = document.getElementById('availableLetters');

    if (!countdownElement) {
        console.error('Countdown element not found!');
    }

    // Initialize the game
    async function initializeGame() {
        try {
            // Load dictionary first
            await loadDictionary();
            
            // Generate letters only after dictionary is loaded
            letters = await generateScrambledAnagram('anagramWords.txt');
            
            // Enable start button
            startButton.disabled = false;
            
            console.log("Game initialized successfully");
        } catch (error) {
            console.error("Failed to initialize game:", error);
            alert("Failed to initialize game. Please refresh the page.");
        }
    }

    // Start game function
    function startGame() {
        // Reset timer display
        if (countdownElement) {
            countdownElement.textContent = time;
            countdownElement.style.color = '#2c3e50';
        }

        // Hide start button and show game elements
        startButton.classList.add('hidden');
        userInput.classList.remove('hidden');
        availableLetters.classList.remove('hidden');
        
        // Show letters
        availableLetters.innerHTML = getAvailableLetters(letters);
        
        // Start timer
        countdownInterval = setInterval(updateCountdown, 1000);
        timerStarted = true;
        
        // Enable input field
        userInput.disabled = false;
        userInput.focus();
    }

    // Add global keyboard event listener for Enter key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            // If game hasn't started and start button is visible
            if (!timerStarted && !startButton.classList.contains('hidden')) {
                startGame();
            }
            // If game is over and popup is visible
            else if (gameOver && document.getElementById("gameOverPopup").style.display === 'flex') {
                const playAgainBtn = document.getElementById("playAgainBtn");
                if (playAgainBtn) {
                    restartGame();
                }
            }
        }
    });

    // Add start button click handler
    startButton.addEventListener('click', startGame);

    async function loadDictionary() {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '' 
                : '/AnagramGame';
            console.log('Attempting to load dictionary from:', `${baseUrl}/data/enable.txt`);
            const response = await fetch(`${baseUrl}/data/enable.txt`);
            if (!response.ok) {
                console.error('Dictionary fetch failed:', response.status, response.statusText);
                throw new Error(`Failed to load dictionary: ${response.statusText}`);
            }
            const data = await response.text();
            dictionary = data.split("\n").filter(word => word.trim().length > 0);
            isDictionaryLoaded = true;
            console.log("Dictionary loaded successfully with", dictionary.length, "words");
        } catch (error) {
            console.error('Error loading dictionary:', error);
            throw error;
        }
    }

    async function generateScrambledAnagram(filePath) {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? '' 
                : '/AnagramGame';
            console.log('Attempting to load anagram words from:', `${baseUrl}/data/anagramWords.txt`);
            const response = await fetch(`${baseUrl}/data/anagramWords.txt`);
            if (!response.ok) {
                console.error('Anagram words fetch failed:', response.status, response.statusText);
                throw new Error(`Failed to load file: ${response.statusText}`);
            }

            const text = await response.text();
            if (!text.trim()) {
                throw new Error("File is empty");
            }

            // Split the content into an array of words and filter for valid 8-letter words
            const words = text.split(/\r?\n/)
                .map(word => word.trim().toLowerCase())
                .filter(word => word.length === 8 && /^[a-z]+$/.test(word));

            if (words.length === 0) {
                throw new Error("No valid 8-letter words found in the file");
            }

            // Select a random word from the list
            const randomWord = words[Math.floor(Math.random() * words.length)];
            if (!randomWord) {
                throw new Error("Failed to select a random word");
            }

            originalWord = randomWord;
            // Scramble the letters using Fisher-Yates shuffle
            function shuffle(array) {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            }

            const scrambledLetters = shuffle(randomWord.split(''));
            console.log("Selected word:", randomWord);
            console.log("Scrambled letters:", scrambledLetters);

            return scrambledLetters;
        } catch (error) {
            console.error("Error in generateScrambledAnagram:", error);
            // Provide a fallback set of letters if the file loading fails
            return ["c", "t", "o", "l", "f", "i", "n", "c"];
        }
    }

    function getAvailableLetters(letters) {
        if (!letters || letters.length === 0) return "";
        return letters.map(letter => `<span>${letter}</span>`).join("");
    }

    function showMessage(message, isError = false) {
        const messageElement = document.getElementById("message");
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.color = isError ? '#ff4444' : '#008000';
            messageElement.style.display = 'block';
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }

    function updateUI() {
        document.getElementById("score").textContent = `Score: ${score}`;
        if (countdownElement) {
            countdownElement.textContent = time;
        }
        
        // Update used words list
        const usedWordsList = document.getElementById("usedWordsList");
        if (usedWordsList) {
            usedWordsList.innerHTML = '';
            usedWords.forEach(word => {
                const li = document.createElement('li');
                li.textContent = word;
                usedWordsList.appendChild(li);
            });
        }
    }

    async function restartGame() {
        // Hide popup
        document.getElementById("gameOverPopup").style.display = 'none';
        
        // Reset game state
        time = 15;
        timerStarted = false;
        gameOver = false;
        usedWords = [];
        score = 0;
        numWords = 0;
        
        // Clear input box
        userInput.value = '';
        
        // Update UI immediately
        updateUI();
        
        // Generate new letters
        letters = await generateScrambledAnagram('anagramWords.txt');
        
        // Start game immediately
        startGame();
    }

    function handleGameOver() {
        gameOver = true;
        clearInterval(countdownInterval);
        userInput.disabled = true;
        
        // Show game over popup
        const popup = document.getElementById("gameOverPopup");
        const finalScore = document.getElementById("finalScore");
        const finalWords = document.getElementById("finalWords");
        const finalWordsList = document.getElementById("finalWordsList");
        
        if (popup && finalScore && finalWords && finalWordsList) {
            finalScore.textContent = score;
            finalWords.textContent = numWords;
            document.getElementById("unscrambledWord").textContent = originalWord;
            
            // Sort words by length (descending) and then alphabetically
            const sortedWords = [...usedWords].sort((a, b) => {
                if (b.length !== a.length) {
                    return b.length - a.length; // Sort by length descending
                }
                return a.localeCompare(b); // Sort alphabetically for same length
            });
            
            // Clear and populate words list
            finalWordsList.innerHTML = '';
            sortedWords.forEach(word => {
                const li = document.createElement('li');
                li.textContent = word;
                finalWordsList.appendChild(li);
            });
            
            // Show popup
            popup.style.display = 'flex';
            
            // Add play again button handler
            const playAgainBtn = document.getElementById("playAgainBtn");
            if (playAgainBtn) {
                playAgainBtn.onclick = restartGame;
            }
        }
    }

    function updateCountdown() {
        if (time > 0) {
            time--;
            if (countdownElement) {
                countdownElement.textContent = time;
                // Change color to red when time is low (3 seconds or less)
                if (time <= 3) {
                    countdownElement.style.color = '#ff4444';
                } else {
                    countdownElement.style.color = '#2c3e50';
                }
            }
        } else {
            handleGameOver();
        }
    }

    function IsAnagram(word, letters) {
        if (word.length > letters.length) return false;
        
        const letterCount = new Map();
        for (const letter of letters) {
            letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
        }
        
        for (const letter of word) {
            const count = letterCount.get(letter);
            if (!count) return false;
            letterCount.set(letter, count - 1);
        }
        
        return true;
    }

    function IsWordInArray(arr, target, left, right) {
        if (!arr || arr.length === 0) return false;
        if (left > right) return false;

        let mid = Math.floor((left + right) / 2);
        let compare = arr[mid].localeCompare(target);

        if (compare === 0) return true;
        else if (compare > 0) {
            return IsWordInArray(arr, target, left, mid - 1);
        }
        else {
            return IsWordInArray(arr, target, mid + 1, right);
        }
    }

    function IsValid(word, letters, dictionary) {
        if (!word || word.trim().length === 0) return false;
        if (!dictionary || dictionary.length === 0) return false;
        if (usedWords.includes(word)) {
            // Find and highlight the duplicate word in the list
            const usedWordsList = document.getElementById("usedWordsList");
            if (usedWordsList) {
                const wordElements = usedWordsList.getElementsByTagName('li');
                for (let element of wordElements) {
                    if (element.textContent === word) {
                        element.style.color = '#ff4444';
                        setTimeout(() => {
                            element.style.color = '#2c3e50';
                        }, 1000);
                        break;
                    }
                }
            }
            return false;
        }
        if (!IsAnagram(word, letters)) return false;
        if (!IsWordInArray(dictionary, word, 0, dictionary.length - 1)) return false;
        return true;
    }

    // Event Listeners
    userInput.addEventListener('input', function(event) {
        const input = event.target.value.toLowerCase();
        const letterSpans = document.querySelectorAll('#availableLetters span');
        
        // Reset all letters to unused state
        letterSpans.forEach(span => {
            span.classList.remove('used');
        });
        
        // Mark used letters
        for (let char of input) {
            for (let span of letterSpans) {
                if (span.textContent === char && !span.classList.contains('used')) {
                    span.classList.add('used');
                    break;
                }
            }
        }
    });

    userInput.addEventListener('keydown', async function(event) {
        if (event.key === "Enter") {
            if (!isDictionaryLoaded) {
                alert("Please wait for the dictionary to load.");
                return;
            }

            let input = userInput.value.trim().toLowerCase();
            if (input === "") {
                userInput.style.border = '2px solid red';
                userInput.classList.add('shake');
                setTimeout(() => {
                    userInput.style.border = '1px solid #ccc';
                    userInput.classList.remove('shake');
                }, 1000);
                return;
            }

            if (IsValid(input, letters, dictionary)) {
                userInput.style.border = '2px solid green';
                usedWords.push(input);
                numWords++;

                // scoring logic
                let length = input.length;
                let points = length * length;
                score += points;
                time += length;
                updateUI();

                // Make timer green when time is added
                if (countdownElement) {
                    countdownElement.style.color = '#008000';
                    setTimeout(() => {
                        countdownElement.style.color = '#2c3e50';
                    }, 1000);
                }
            } else {
                userInput.style.border = '2px solid red';
                userInput.classList.add('shake');
                setTimeout(() => {
                    userInput.style.border = '1px solid #ccc';
                    userInput.classList.remove('shake');
                }, 1000);
            }

            // Reset all letter boxes to unused state
            const letterSpans = document.querySelectorAll('#availableLetters span');
            letterSpans.forEach(span => {
                span.classList.remove('used');
            });

            userInput.value = '';
        }
    });

    // Initialize the game
    initializeGame();
}); 