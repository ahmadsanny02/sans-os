export const SPECIAL_WORDS: Record<string, string> = {
  // Pronouns (Subject, Object, Possessive, Reflexive, Indefinite, Demonstrative)
  "i": "pronoun",
  "me": "pronoun",
  "my": "pronoun",
  "mine": "pronoun",
  "myself": "pronoun",
  "you": "pronoun",
  "your": "pronoun",
  "yours": "pronoun",
  "yourself": "pronoun",
  "yourselves": "pronoun",
  "he": "pronoun",
  "him": "pronoun",
  "his": "pronoun",
  "himself": "pronoun",
  "she": "pronoun",
  "her": "pronoun",
  "hers": "pronoun",
  "herself": "pronoun",
  "it": "pronoun",
  "its": "pronoun",
  "itself": "pronoun",
  "we": "pronoun",
  "us": "pronoun",
  "our": "pronoun",
  "ours": "pronoun",
  "ourselves": "pronoun",
  "they": "pronoun",
  "them": "pronoun",
  "their": "pronoun",
  "theirs": "pronoun",
  "themselves": "pronoun",
  "who": "pronoun",
  "whom": "pronoun",
  "whose": "pronoun",
  "which": "pronoun",
  "that": "pronoun",
  "this": "pronoun",
  "these": "pronoun",
  "those": "pronoun",
  "everyone": "pronoun",
  "everybody": "pronoun",
  "everything": "pronoun",
  "someone": "pronoun",
  "somebody": "pronoun",
  "something": "pronoun",
  "anyone": "pronoun",
  "anybody": "pronoun",
  "anything": "pronoun",
  "no one": "pronoun",
  "nobody": "pronoun",
  "nothing": "pronoun",
  "each": "pronoun",
  "both": "pronoun",
  "some": "pronoun",
  "any": "pronoun",
  "few": "pronoun",
  "many": "pronoun",
  "several": "pronoun",
  "all": "pronoun",
  "none": "pronoun",

  // Prepositions
  "at": "preposition",
  "in": "preposition",
  "on": "preposition",
  "of": "preposition",
  "to": "preposition",
  "by": "preposition",
  "for": "preposition",
  "with": "preposition",
  "about": "preposition",
  "against": "preposition",
  "between": "preposition",
  "into": "preposition",
  "through": "preposition",
  "during": "preposition",
  "before": "preposition",
  "after": "preposition",
  "above": "preposition",
  "below": "preposition",
  "from": "preposition",
  "up": "preposition",
  "down": "preposition",
  "out": "preposition",
  "over": "preposition",
  "under": "preposition",
  "off": "preposition",
  "across": "preposition",
  "along": "preposition",
  "among": "preposition",
  "around": "preposition",
  "behind": "preposition",
  "beneath": "preposition",
  "beside": "preposition",
  "beyond": "preposition",
  "despite": "preposition",
  "except": "preposition",
  "inside": "preposition",
  "like": "preposition",
  "near": "preposition",
  "onto": "preposition",
  "outside": "preposition",
  "past": "preposition",
  "throughout": "preposition",
  "toward": "preposition",
  "towards": "preposition",
  "underneath": "preposition",
  "upon": "preposition",
  "within": "preposition",
  "without": "preposition",

  // Conjunctions
  "and": "conjunction",
  "but": "conjunction",
  "or": "conjunction",
  "so": "conjunction",
  "because": "conjunction",
  "although": "conjunction",
  "though": "conjunction",
  "even though": "conjunction",
  "while": "conjunction",
  "whereas": "conjunction",
  "if": "conjunction",
  "unless": "conjunction",
  "until": "conjunction",
  "since": "conjunction",
  "than": "conjunction",
  "yet": "conjunction",

  // Determiners / Articles
  "the": "determiner",
  "a": "determiner",
  "an": "determiner"
}

export async function detectPartOfSpeech(englishWord: string): Promise<string> {
  const cleanWord = englishWord.split(/[,;]/)[0].trim().toLowerCase()
  if (!cleanWord) return "noun"

  if (SPECIAL_WORDS[cleanWord]) {
    return SPECIAL_WORDS[cleanWord]
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const partsSet = new Set<string>()
        for (const entry of data) {
          if (entry.meanings) {
            for (const m of entry.meanings) {
              if (m.partOfSpeech) {
                partsSet.add(m.partOfSpeech.toLowerCase())
              }
            }
          }
        }
        if (partsSet.size > 0) {
          return Array.from(partsSet).join(", ")
        }
      }
    }
  } catch (error) {
    console.error("Error auto-detecting part of speech:", error)
  }
  return "noun" // default fallback
}
