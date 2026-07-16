export interface VerbConjugation {
  v1: string
  v2: string
  v3: string
  vIng: string
}

const IRREGULAR_VERBS: Record<string, { v2: string; v3: string }> = {
  be: { v2: "was/were", v3: "been" },
  become: { v2: "became", v3: "become" },
  begin: { v2: "began", v3: "begun" },
  bend: { v2: "bent", v3: "bent" },
  bet: { v2: "bet", v3: "bet" },
  bite: { v2: "bit", v3: "bitten" },
  blow: { v2: "blew", v3: "blown" },
  break: { v2: "broke", v3: "broken" },
  bring: { v2: "brought", v3: "brought" },
  build: { v2: "built", v3: "built" },
  burn: { v2: "burnt", v3: "burnt" },
  buy: { v2: "bought", v3: "bought" },
  catch: { v2: "caught", v3: "caught" },
  choose: { v2: "chose", v3: "chosen" },
  come: { v2: "came", v3: "come" },
  cost: { v2: "cost", v3: "cost" },
  cut: { v2: "cut", v3: "cut" },
  deal: { v2: "dealt", v3: "dealt" },
  dig: { v2: "dug", v3: "dug" },
  do: { v2: "did", v3: "done" },
  draw: { v2: "drew", v3: "drawn" },
  drink: { v2: "drank", v3: "drunk" },
  drive: { v2: "drove", v3: "driven" },
  eat: { v2: "ate", v3: "eaten" },
  fall: { v2: "fell", v3: "fallen" },
  feed: { v2: "fed", v3: "fed" },
  feel: { v2: "felt", v3: "felt" },
  fight: { v2: "fought", v3: "fought" },
  find: { v2: "found", v3: "found" },
  fly: { v2: "flew", v3: "flown" },
  forget: { v2: "forgot", v3: "forgotten" },
  forgive: { v2: "forgave", v3: "forgiven" },
  freeze: { v2: "froze", v3: "frozen" },
  get: { v2: "got", v3: "gotten" },
  give: { v2: "gave", v3: "given" },
  go: { v2: "went", v3: "gone" },
  grow: { v2: "grew", v3: "grown" },
  hang: { v2: "hung", v3: "hung" },
  have: { v2: "had", v3: "had" },
  hear: { v2: "heard", v3: "heard" },
  hide: { v2: "hid", v3: "hidden" },
  hit: { v2: "hit", v3: "hit" },
  hold: { v2: "held", v3: "held" },
  hurt: { v2: "hurt", v3: "hurt" },
  keep: { v2: "kept", v3: "kept" },
  kneel: { v2: "knelt", v3: "knelt" },
  know: { v2: "knew", v3: "known" },
  lay: { v2: "laid", v3: "laid" },
  lead: { v2: "led", v3: "led" },
  lean: { v2: "leant", v3: "leant" },
  learn: { v2: "learnt", v3: "learnt" },
  leave: { v2: "left", v3: "left" },
  lend: { v2: "lent", v3: "lent" },
  let: { v2: "let", v3: "let" },
  lie: { v2: "lay", v3: "lain" },
  light: { v2: "lit", v3: "lit" },
  lose: { v2: "lost", v3: "lost" },
  make: { v2: "made", v3: "made" },
  mean: { v2: "meant", v3: "meant" },
  meet: { v2: "met", v3: "met" },
  pay: { v2: "paid", v3: "paid" },
  put: { v2: "put", v3: "put" },
  read: { v2: "read", v3: "read" },
  ride: { v2: "rode", v3: "ridden" },
  ring: { v2: "rang", v3: "rung" },
  rise: { v2: "rose", v3: "risen" },
  run: { v2: "ran", v3: "run" },
  say: { v2: "said", v3: "said" },
  see: { v2: "saw", v3: "seen" },
  sell: { v2: "sold", v3: "sold" },
  send: { v2: "sent", v3: "sent" },
  set: { v2: "set", v3: "set" },
  sew: { v2: "sewed", v3: "sewn" },
  shake: { v2: "shook", v3: "shaken" },
  shine: { v2: "shone", v3: "shone" },
  shoot: { v2: "shot", v3: "shot" },
  show: { v2: "showed", v3: "shown" },
  shrink: { v2: "shrank", v3: "shrunk" },
  shut: { v2: "shut", v3: "shut" },
  sing: { v2: "sang", v3: "sung" },
  sink: { v2: "sank", v3: "sunk" },
  sit: { v2: "sat", v3: "sat" },
  sleep: { v2: "slept", v3: "slept" },
  slide: { v2: "slid", v3: "slid" },
  smell: { v2: "smelt", v3: "smelt" },
  speak: { v2: "spoke", v3: "spoken" },
  spend: { v2: "spent", v3: "spent" },
  spill: { v2: "spilt", v3: "spilt" },
  spit: { v2: "spat", v3: "spat" },
  split: { v2: "split", v3: "split" },
  spoil: { v2: "spoilt", v3: "spoilt" },
  spread: { v2: "spread", v3: "spread" },
  spring: { v2: "sprang", v3: "sprung" },
  stand: { v2: "stood", v3: "stood" },
  steal: { v2: "stole", v3: "stolen" },
  stick: { v2: "stuck", v3: "stuck" },
  sting: { v2: "stung", v3: "stung" },
  strike: { v2: "struck", v3: "struck" },
  swear: { v2: "swore", v3: "sworn" },
  sweep: { v2: "swept", v3: "swept" },
  swim: { v2: "swam", v3: "swum" },
  swing: { v2: "swung", v3: "swung" },
  take: { v2: "took", v3: "taken" },
  teach: { v2: "taught", v3: "taught" },
  tear: { v2: "tore", v3: "torn" },
  tell: { v2: "told", v3: "told" },
  think: { v2: "thought", v3: "thought" },
  throw: { v2: "threw", v3: "thrown" },
  understand: { v2: "understood", v3: "understood" },
  wake: { v2: "woke", v3: "woken" },
  wear: { v2: "wore", v3: "worn" },
  win: { v2: "won", v3: "won" },
  write: { v2: "wrote", v3: "written" },
}

const isVowel = (c: string): boolean => typeof c === "string" && c.length === 1 && /[aeiou]/i.test(c)
const isConsonant = (c: string): boolean => typeof c === "string" && c.length === 1 && /[bcdfghjklmnpqrstvwxyz]/i.test(c)

function matchCase(base: string, target: string): string {
  if (base === base.toUpperCase()) return target.toUpperCase()
  if (base[0] === base[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1)
  }
  return target
}

function shouldDoubleConsonant(word: string): boolean {
  const len = word.length
  if (len < 3) return false
  if (len === 3) {
    const last = word[len - 1]
    const prev = word[len - 2]
    const prev2 = word[len - 3]
    return (
      isConsonant(last) &&
      !/[wxy]/i.test(last) &&
      isVowel(prev) &&
      isConsonant(prev2)
    )
  }

  // Common verbs with stressed final syllable ending in CVC that should double
  if (word.endsWith("gret")) return true // regret -> regretted
  if (word.endsWith("pel")) return true  // compel, propel, dispel -> compelled
  if (word.endsWith("fer") && !word.endsWith("offer") && !word.endsWith("suffer") && !word.endsWith("differ")) return true // refer, prefer -> referred
  if (word.endsWith("mit") && !word.endsWith("limit") && !word.endsWith("vomit")) return true // commit, permit -> committed

  // Common unstressed CVC suffixes where the final consonant should NOT double
  const UNSTRESSED_SUFFIXES = [
    "en",      // listen, open, happen
    "er",      // remember, whisper, offer, suffer
    "el",      // travel, cancel
    "et",      // target, budget
    "it",      // visit, edit, limit, vomit, orbit, inherit, exhibit
    "develop",
    "focus",
    "benefit"
  ]

  for (const suffix of UNSTRESSED_SUFFIXES) {
    if (word.endsWith(suffix)) return false
  }

  const last = word[len - 1]
  const prev = word[len - 2]
  const prev2 = word[len - 3]

  return (
    isConsonant(last) &&
    !/[wxy]/i.test(last) &&
    isVowel(prev) &&
    isConsonant(prev2)
  )
}

function getRegularV2V3(word: string): string {
  if (word.endsWith("e")) {
    return word + "d"
  }
  if (word.length > 2 && isConsonant(word[word.length - 2]) && word.endsWith("y")) {
    return word.slice(0, -1) + "ied"
  }
  if (shouldDoubleConsonant(word)) {
    const last = word[word.length - 1]
    return word + last + "ed"
  }
  return word + "ed"
}

function getVIng(word: string): string {
  if (word.endsWith("ie")) {
    return word.slice(0, -2) + "ying"
  }
  if (word.endsWith("e") && !word.endsWith("ee") && !word.endsWith("oe") && !word.endsWith("ye")) {
    return word.slice(0, -1) + "ing"
  }
  if (shouldDoubleConsonant(word)) {
    const last = word[word.length - 1]
    return word + last + "ing"
  }
  return word + "ing"
}

export function conjugateVerb(base: string): VerbConjugation {
  const word = base.trim().toLowerCase()
  const irregular = IRREGULAR_VERBS[word]
  if (irregular) {
    return {
      v1: base,
      v2: matchCase(base, irregular.v2),
      v3: matchCase(base, irregular.v3),
      vIng: matchCase(base, getVIng(word)),
    }
  }
  return {
    v1: base,
    v2: matchCase(base, getRegularV2V3(word)),
    v3: matchCase(base, getRegularV2V3(word)),
    vIng: matchCase(base, getVIng(word)),
  }
}
