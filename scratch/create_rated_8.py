import json

rated_data = {
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-1": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses string iteration, conditional checks, and set membership to classify characters as vowels or consonants."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-2": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses string slicing with length integer division to extract the first half of a string."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-3": {
    "technical_score": 2,
    "logical_score": 1,
    "reason": "Mechanically wraps the previous string slicing logic into a function definition with an argument."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-4": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses string search or iteration to locate a target character and handle its absence."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-5": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Counts occurrences of a character using a basic loop or built-in count method."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-6": {
    "technical_score": 2,
    "logical_score": 1,
    "reason": "Requires adding a lower() conversion call to make character counting case-insensitive."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-7": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Parameterizes string searching and slicing to stop before a given delimiter character."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-8": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Manually iterates through a string with an accumulator to count character occurrences."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-9": {
    "technical_score": 2,
    "logical_score": 3,
    "reason": "Requires index slicing or window comparison to match multi-character substrings manually."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-10": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses split(), list reversal, and join() to reverse the order of words in a sentence."
  },
  "vyuka_downloaded/priklady/python/typy.retezce.html:task-11": {
    "technical_score": 2,
    "logical_score": 3,
    "reason": "Manually shifts character ASCII codes using ord() and chr() based on ASCII range checks."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-1": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses a basic loop and accumulator variable to sum list elements without sum()."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-2": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Reverses a list using slice indexing or backward loop iteration."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-3": {
    "technical_score": 2,
    "logical_score": 3,
    "reason": "Requires avoiding list mutation during iteration footgun or using a while loop to safely remove elements."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-4": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses a basic loop or list comprehension to filter elements greater than a threshold."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-5": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Maintains unique elements using an output list with membership checks or set conversion."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-6": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Uses enumerate() or index loop to collect all indices where a target element appears."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-7": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Compares adjacent elements in a list loop to find the first identical neighbor."
  },
  "vyuka_downloaded/priklady/python/typy.seznamy.html:task-8": {
    "technical_score": 2,
    "logical_score": 2,
    "reason": "Extends adjacent neighbor comparison to collect all elements equal to their immediate successor."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-1": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Uses file I/O, dictionaries, and pprint to build and display character frequency counts."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-2": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Extends character frequency dictionary values to store counts and relative percentages."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-3": {
    "technical_score": 3,
    "logical_score": 1,
    "reason": "Applies lower() to input characters before recording frequency statistics in the dictionary."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-4": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Parses file text into words, strips punctuation using string.punctuation, and counts word occurrences in a dictionary."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-5": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Updates word frequency dictionary to include count and percentage tuple values."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-6": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Merges two dictionary objects into a single combined dictionary."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-7": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Inverts dictionary key-value pairs assuming distinct values."
  },
  "vyuka_downloaded/priklady/python/typy.slovniky.html:task-8": {
    "technical_score": 3,
    "logical_score": 2,
    "reason": "Inverts a dictionary with non-unique values by grouping original keys into value lists."
  }
}

for k, v in rated_data.items():
    words = v["reason"].split()
    assert len(words) < 25, f"Reason for {k} has {len(words)} words, max is 24."
    assert 1 <= v["technical_score"] <= 5
    assert 1 <= v["logical_score"] <= 5

with open("w:/_solved/python_overview/scratch/rated_chunk_8.json", "w", encoding="utf-8") as f:
    json.dump(rated_data, f, indent=2, ensure_ascii=False)

print(f"Successfully rated {len(rated_data)} tasks.")
