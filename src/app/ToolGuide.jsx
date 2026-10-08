import { Link } from './router'

export default function ToolGuide({ path }) {
  if (path === '/image-resizer') return <section className="tool-guide" aria-labelledby="image-guide-title">
    <h2 id="image-guide-title">Resize an image online, by pixels</h2>
    <p>Use this image resizer to change image dimensions for a website, profile picture, or email. Open a JPG, PNG, or WebP, enter the width and height in pixels, then download the preview when it fits.</p>
    <p>Keep the aspect ratio locked to preserve the original proportions. Unlock it to set width and height independently; this can stretch the image. You can resize JPG, resize PNG, or resize WebP files and export in any of those three formats, where your browser supports the output.</p>
    <h2>Image resizer FAQ</h2>
    <h3>Can I compress an image or adjust its quality?</h3>
    <p>JPG and WebP exports have a quality slider. Lower quality can reduce file size at the cost of detail; compare the preview and file size before downloading. PNG has no quality slider. Smaller pixel dimensions can also help reduce file size.</p>
    <h3>What happens to transparency and animation?</h3>
    <p>PNG and WebP preserve transparency. JPG turns transparent areas white. Animated images export as a single still image.</p>
    <h3>Are my images uploaded?</h3>
    <p>No. Opening, resizing, and exporting happen in your browser. Images stay on your device.</p>
    <p>Building something new? Find a name with the <Link href="/name-generator">website and project name generator</Link>.</p>
  </section>

  if (path === '/name-generator') return <section className="tool-guide" aria-labelledby="name-guide-title">
    <h2 id="name-guide-title">Name ideas with a little direction</h2>
    <p>Use the website name generator for a new site, explore business name ideas, or switch to the app name generator or project name generator. The Other option works for ideas that do not fit those categories. Add optional keywords to guide the suggestions, or leave them blank for random name ideas.</p>
    <p>Choose a Clean, Playful, Weird, Professional, Techy, or Minimal vibe. Styles include Real Words, Two-Word Combination, Mashup, and Made-Up Word. Surprise Me mixes things up. Pick Short, Medium, or Any length, generate a batch, and star the names you want to keep.</p>
    <h2>Name generator FAQ</h2>
    <h3>Do I need an account, and where are saved names kept?</h3>
    <p>No account needed. Names are generated locally from curated words and combinations. Favorites are saved in this browser on this device when browser storage is available. Clearing site data removes them, so copy any names you want to keep elsewhere.</p>
    <h3>Does the generator check domain availability?</h3>
    <p>No. Website and Business suggestions offer an optional Search domain link that opens an external registrar. A suggested domain is not an availability check. Check existing names and trademarks before settling on a name.</p>
    <p>Have a shortlist? Let <Link href="/spin-the-wheel">Spin the Wheel</Link> pick a name to try. Preparing images for your new site? Use the <Link href="/image-resizer">image resizer</Link> to make them fit.</p>
  </section>

  return <section className="tool-guide" aria-labelledby="wheel-guide-title">
    <h2 id="wheel-guide-title">A random wheel spinner for everyday choices</h2>
    <p>Spin the wheel when a few good options need a tie-breaker. Add one choice per line and spin to use it as a random choice picker for what to eat, what to do, or which game to play.</p>
    <p>Use it as a random name picker for a group, a classroom wheel for activities or turns, or a giveaway winner picker for a drawing. Every entry has an equal chance. Your list stays in your browser, with no account required.</p>
    <h2>Spin the Wheel FAQ</h2>
    <h3>How do I draw several winners without replacement?</h3>
    <p>After each spin, choose Remove winner to take that entry off the wheel before spinning again. For each person to win only once, enter each name once. If a name appears on multiple lines, removing one winning entry leaves the others in the list.</p>
    <h3>How many choices can I add?</h3>
    <p>The decision wheel accepts 2 to 100 non-empty entries. Blank lines are ignored. Each line is a separate entry, so repeated choices get more chances.</p>
    <p>Need ideas before you choose? Make a shortlist with the <Link href="/name-generator">name generator</Link>, then bring your favorites to the wheel.</p>
  </section>
}
