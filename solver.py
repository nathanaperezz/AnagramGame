import itertools

# Load the dictionary
with open('data/enable.txt') as f:
    dictionary = set(word.strip().lower() for word in f)

print(f"Loaded dictionary with {len(dictionary)} words.")

with open('data/anagramWords.txt') as f:
    game_words = [word.strip().lower() for word in f]

print(f"Loaded {len(game_words)} game words.")

for game_word in game_words:
    print(f"\nProcessing: {game_word}")  # Debug line
    valid_anagrams = set()
    # Generate all permutations from length 2 to 8
    for length in range(2, len(game_word) + 1):
        perms = set(''.join(p) for p in itertools.permutations(game_word, length))
        valid_anagrams |= perms & dictionary

    # Skip if no anagrams found
    if not valid_anagrams:
        print(f"No valid anagrams for {game_word}")
        continue

    total_score = sum(len(word) ** 2 for word in valid_anagrams)
    print(f"{game_word}: Max score = {total_score} (from {len(valid_anagrams)} words)")
