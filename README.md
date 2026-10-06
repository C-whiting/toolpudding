# ToolPudding

The proof is in the pudding. Free little tools for everyday annoyances, with no account required.

## Development and validation

- npm install
- npm run dev
- npm run lint
- npm run build
- npm run preview

## Deployment

Publish the entire dist directory at the domain root. The build creates index.html documents for /image-resizer, /name-generator, /spin-the-wheel, and /privacy, each with its own title, description, and social metadata. Directory-based static hosts can serve these routes directly without an SPA rewrite. Do not publish only dist/index.html or omit the route directories.

Configure unknown requests to serve dist/404.html with HTTP status 404, preserving the requested URL. The included _redirects file supplies that behavior on hosts supporting Netlify-style redirects. On other hosts, use their custom error-document setting. If a host requires explicit mappings for extensionless routes, map each known route to its corresponding directory index document. Vite development/preview uses an SPA fallback and does not verify production 404 status.

Before launch on the selected host, visit and refresh /, /image-resizer, /name-generator, /spin-the-wheel, and /privacy. Verify an unknown URL displays the branded page with HTTP status 404 and assets load correctly. The deployment provider and public domain have not been selected in this workspace, so no provider-specific deployment or canonical URL is claimed as verified.

## Tools and privacy

Image Resizer opens JPG, PNG, and WebP locally using browser image decoding and Canvas. It makes no uploads. PNG/WebP preserve transparency; JPG uses white. Animated inputs export a still frame. Inputs are limited to 50 MB, 40 million pixels, and 16,384 pixels per side; headers are checked before decoding. Output is limited to 8,192 pixels per side and 24 million pixels. Browser memory and encoder support can impose additional limits.

Name Generator creates batches of 12 names locally from curated words and patterns, with optional keywords. Saved names use the legacy localStorage key boring-tools.saved-names.v1 so existing favorites survive the brand change. Up to 200 favorites are retained. Blocked storage leaves an in-memory list with a visible warning when saving. Clipboard failures offer selectable text. Domain search links pass the suggested domain to an external registrar only when clicked; availability is not checked.

Spin the Wheel supports 2?100 equal-chance entries. Blank lines are ignored; duplicates remain separate entries until explicitly removed. Remove Winner deletes exactly the selected source line. Lists persist under toolpudding.wheel-choices.v1, including an empty list. Random selection uses crypto.getRandomValues with rejection sampling. Reduced motion skips the spin animation, sound is off by default, and the winner uses a native keyboard-accessible dialog.

No analytics, advertising, external fonts, or tracking cookies are included. The Privacy page explains local storage, external registrar links, and possible hosting access logs.

## Structure

src/App.jsx owns the shared navigation, directory, footer, Privacy, and not-found views. src/app/metadata.js supplies route metadata to the UI and scripts/build-pages.mjs. src/app/tools.js connects the three tools to their components and cards. Processing helpers and tool-specific styling live in src/tools.
