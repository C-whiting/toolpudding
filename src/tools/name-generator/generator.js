export const namingOptions = {
  subject: ['Website', 'App', 'Business', 'Project', 'Other'],
  vibe: ['Clean', 'Playful', 'Weird', 'Professional', 'Techy', 'Minimal', 'Surprise Me'],
  style: ['Real Words', 'Two-Word Combination', 'Mashup', 'Made-Up Word', 'Surprise Me'],
  length: ['Short', 'Medium', 'Any'],
}

const split = (text) => text.split(' ')
const banks = {
  Clean: {
    modifiers: split('clear bright fresh open gentle tidy simple steady lucid crisp easy honest calm pure light'),
    nouns: split('grove haven meadow beam field bloom ridge nest shore pebble willow breeze garden glade path canvas daylight foothold orchard lantern'),
    roots: split('clar lumi vera novi sola luma pri mira clari ori'),
    endings: split('a io o en ora ello ia'),
  },
  Playful: {
    modifiers: split('happy sunny nimble merry little bouncy clever lucky jolly zippy nifty tiny curious spry cheery'),
    nouns: split('pickle pocket doodle sprout confetti jelly bubble button otter noodle pebble wiggle giggle scooter acorn sparkle puddle mango mitten muffin'),
    roots: split('pip boba zippi doodli moki nibbi popi tinki jolli wiggi'),
    endings: split('o lo ly roo pop a do'),
  },
  Weird: {
    modifiers: split('cosmic lunar velvet wobbly neon odd upside sideways fuzzy peculiar quiet secret electric sleepy wonky'),
    nouns: split('turnip comet cactus orbit waffle mushroom cloud goblin moonbeam teapot jellyfish echo noodle marmalade nebula prism pickle moth pebble stardust'),
    roots: split('zumi wobbi vexo quori plumi zogo nubi yondo zelli floop'),
    endings: split('zo onk oo um bo ix a'),
  },
  Professional: {
    modifiers: split('prime trusted sterling steady clear summit proven united refined bright noble wise enduring focused solid'),
    nouns: split('anchor compass pillar venture summit ledger beacon cornerstone meridian accord bridge outlook harbor insight avenue vantage standard cadence charter counsel keystone'),
    roots: split('veri valora credi forti meridi avora certa priori alti nova'),
    endings: split('a en on ia ora is o'),
  },
  Techy: {
    modifiers: split('agile rapid quantum neural lucid digital clever signal modular atomic vector kinetic next nova open'),
    nouns: split('pixel vector circuit matrix signal node relay orbit prism kernel lattice nexus pulse byte stack loop spark vertex syntax flux'),
    roots: split('nex syn vect pix axio circu moduli nov neur kivo'),
    endings: split('io ix on ai ex a ly'),
  },
  Minimal: {
    modifiers: split('one bare still plain mono soft neat true pure small lean quiet low even calm'),
    nouns: split('form line dot mark space note fold grain arc slate leaf core tone frame point shape edge stem base room'),
    roots: split('noa ori ela uni ona nea lino maro sela nori'),
    endings: split('a o en io e la'),
  },
}

const subjectNouns = {
  Website: split('page nook hub corner atlas journal porch shelf index portal'),
  App: split('flow tap pocket dash relay pulse loop swipe rhythm glide'),
  Business: split('studio works craft collective bureau house guild venture company atelier'),
  Project: split('seed spark blueprint canvas trail chapter launch draft quest sketch'),
  Other: split('nest grove field space pocket spark haven echo compass bloom'),
}

const longerWords = {
  Clean: 'clarity feather sunrise balance cascade harmony welcome openness verdant blossom hillside driftwood evergreen sunlight flowline waterline seaglass refresh polished tranquil unified simplify renewal current pasture natural radiance kindred thoughtful nurture gardenia clearing morning gracious pristine shelter shoreline',
  Playful: 'pancake twinkle freckles sunshine pinwheel daydream hopscotch gumdrop trinket firefly daisychain cupcake popover whirligig marshmallow carousel duckling doodler flapjack cheerful tickler honeybee snowball popcorn campfire rainbow lemonade goldfish mooncake sprinkles playtime marigold bluebird treasure playhouse jellyroll moonwalk whistler pudding',
  Weird: 'moonrise oddball whimsical starling dustbunny thunder strange daydream moonmilk sideways jellybean cloudlet peculiar tumbleweed dreamboat labyrinth paradox riddler cryptic whimsical nocturne phantom alchemy chimera anomaly spectral twilight illusion auroral moonstone fireball thunderclap kaleidoscope curiosity moonlight dreamscape oddities mischief enchantment',
  Professional: 'partners alliance progress foresight endeavor prestige counsel purpose goodwill alliance waypoint mission legacy resolve foundation',
  Techy: 'protocol runtime quantum digital gateway network gearbox compute automata artifact waveform terminal datapoint pipeline bytecode interface register operator debugger adapter compiler segment cluster modular lattice chipset foundry bitstream firmware pointer function scalar octave oscillator viewport iterator emulator circuitry',
  Minimal: 'balance outline element silence contour essence measure clarity purpose interval minimal stillness whitespace baseline details silhouette simplicity unfolding spectrum dimension geometry negative neutral tactile centered reserve restraint uniform marginless seamless parallel blankness midpoint offwhite singular subtlety monotone entirety weightless',
}
for (const [vibe, words] of Object.entries(longerWords)) banks[vibe].nouns.push(...split(words))
const longerEndings = {
  Clean: 'alia aria ella enna ivo ina',
  Playful: 'aroo ella oodle ello etta ino',
  Weird: 'aroo ooni onzo ette ulo ivo',
  Professional: 'oria ella enna aria ance iana',
  Techy: 'oria onic idio ium etra anio',
  Minimal: 'ella enna alia anio aria enio',
}
for (const [vibe, endings] of Object.entries(longerEndings)) banks[vibe].endings.push(...split(endings))
const mashupTails = {
  Clean: split('leaf grove bloom ridge light nest haven beam shore garden'),
  Playful: split('pop pocket doodle sprout jelly bubble otter giggle mango noodle'),
  Weird: split('moon comet orbit cloud moth echo nebula pickle waffle prism'),
  Professional: split('works compass anchor ledger merit bridge beacon craft wise prime'),
  Techy: split('byte node pixel pulse loop relay stack flux circuit signal'),
  Minimal: split('form line dot mark note fold grain arc tone core'),
}

const concepts = [
  { keys: split('tool tools useful utility helpful handy'), words: split('handy kit craft bench helper knack nifty apt'), roots: split('handi kit craft apti') },
  { keys: split('simple clean easy minimal plain boring'), words: split('clear ease neat plain calm tidy lucid light'), roots: split('clar easi lumi soli') },
  { keys: split('quick fast swift speed time'), words: split('swift zip dash nimble rapid spark spry blink'), roots: split('zippi velo dash nimbi') },
  { keys: split('nature garden green plant eco earth'), words: split('grove leaf moss fern bloom sprout meadow wild'), roots: split('flora silva verdi terra') },
  { keys: split('art creative design photo image draw'), words: split('canvas hue frame prism sketch palette vivid muse'), roots: split('musa chroma arti pixa') },
  { keys: split('tech code software data digital ai'), words: split('pixel node signal nexus vector logic relay circuit'), roots: split('nex syn axio digi') },
  { keys: split('food coffee cafe cook kitchen'), words: split('brew bean zest spice oven basil crumb table'), roots: split('basi zesta crema moka') },
  { keys: split('money finance business work professional'), words: split('ledger anchor prime steady compass pillar merit wise'), roots: split('credi forti vera meri') },
  { keys: split('learn school education book study'), words: split('chapter wise atlas spark curious page scholar beacon'), roots: split('luma studia nova lexi') },
  { keys: split('health wellness fitness calm care'), words: split('balance bloom calm vital steady haven pace glow'), roots: split('vita sana aura sola') },
  { keys: split('travel adventure explore map outdoors'), words: split('trail roam compass ridge horizon atlas wander way'), roots: split('rova terra via alti') },
  { keys: split('music sound audio song'), words: split('rhythm note echo chord cadence tone melody pulse'), roots: split('sona ritmo harmo melo') },
]

// Screen both user keywords and fused output, including combinations across word boundaries.
const blocked = /fuck|shit|cunt|nigg|fagg|whore|slut|porn|rape|rapist|nazi|hitler|kkk|bitch|bastard|asshole|dick|cock|pussy|twat|wank|sex|cum|tit|anus|suicide|terror/
export function isSafeName(name) {
  return !blocked.test(name.toLowerCase().replace(/[^a-z]/g, ''))
}
export function parseKeywords(text) {
  return [...new Set(text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z]+/).filter(word => word.length >= 2 && word.length <= 24 && isSafeName(word)))].slice(0, 12)
}

const pick = (items) => items[Math.floor(Math.random() * items.length)]
const title = (word) => word.charAt(0).toUpperCase() + word.slice(1)
const fuse = (root, ending) => root.endsWith(ending[0]) ? root + ending.slice(1) : root + ending
const normalized = (name) => name.toLowerCase().replace(/\s/g, '')

export function generateNames(options, recent = [], count = 12) {
  const keywords = parseKeywords(options.keywords || '')
  const matches = concepts.filter(concept => concept.keys.some(key => keywords.includes(key)))
  const semanticWords = matches.flatMap(concept => concept.words)
  const semanticRoots = matches.flatMap(concept => concept.roots)
  const subject = subjectNouns[options.subject] || subjectNouns.Website
  const seen = new Set(recent.map(normalized))
  const batch = new Set()
  const results = []
  // Retry only from curated patterns; recycle older names only after the fresh pool is exhausted.
  for (let attempt = 0; results.length < count && attempt < 12000; attempt++) {
    const vibe = banks[options.vibe] ? options.vibe : pick(Object.keys(banks))
    const bank = banks[vibe]
    const style = options.style === 'Surprise Me' ? pick(namingOptions.style.slice(0, -1)) : options.style
    const theme = Math.random()
    const word = theme < .45 && semanticWords.length ? pick(semanticWords) : theme < .65 && keywords.length ? pick(keywords) : null
    const root = semanticRoots.length && Math.random() < .5 ? pick(semanticRoots) : word && Math.random() < .35 ? word.slice(0, 6) : pick(bank.roots)
    let name
    if (style === 'Real Words') {
      // Unrecognized keywords belong in combinations/mashups, not the real-word pool.
      name = title(pick([...bank.nouns, ...bank.modifiers, ...semanticWords, ...subject]))
    } else if (style === 'Two-Word Combination') {
      const modifier = word || pick(bank.modifiers)
      const noun = Math.random() < .3 ? pick(subject) : pick(bank.nouns)
      if (modifier === noun) continue
      name = `${title(modifier)} ${title(noun)}`
    } else if (style === 'Mashup') {
      const stem = (word || pick(bank.modifiers)).slice(0, 6)
      name = title(fuse(stem, pick(mashupTails[vibe])))
    } else {
      const bridge = pick(['', 'l', 'n', 'r', 'v'])
      name = title(fuse(root, bridge + pick(bank.endings)))
    }
    const size = normalized(name).length
    if (size < 3 || size > 24 || (options.length === 'Short' && size > 10) || (options.length === 'Medium' && (size < 7 || size > 16))) continue
    const id = normalized(name)
    if (!isSafeName(name) || batch.has(id) || (attempt < 9000 && seen.has(id))) continue
    batch.add(id)
    results.push({ name, style, vibe })
  }
  return results
}

export function domainFor(name) {
  return `${normalized(name).replace(/[^a-z0-9]/g, '')}.com`
}
