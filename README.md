# Michal Erez — Portfolio 2026

A static website: plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## Publish on GitHub Pages
1. Create a new repository on GitHub (for example `portfolio`).
2. Upload the **contents** of this folder (not the folder itself), so that `index.html` is at the top level of the repository.
   On github.com: **Add file → Upload files**, drag everything in, then **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/<repository-name>/`.
5. Optional: to use your own domain, enter it under **Settings → Pages → Custom domain**, then point your domain's DNS to GitHub Pages.

To update the site later, upload the changed files again in the same way (they replace the old ones).

## What's inside
| File | What it is |
|---|---|
| `index.html` | Home page |
| `onezero.html`, `lili.html`, `meitav.html`, `voia.html` | Case studies |
| `styles.css` | All styling |
| `main.js` | Interactions: reveals, videos, copy email, back to top |
| `confetti.js` | Meitav Trade confetti and rocket |
| `lottie-slots.js` | Lili animations (Lottie) |
| `assets/` | Images, videos, logos, Lottie files, favicon |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

Fonts (Bricolage Grotesque, DM Sans, Space Mono) load from Google Fonts. The Lottie player loads from cdnjs.

## Connecting a new case study
Home tiles without a case point to `href="#"` and show a "coming soon" message.
When a case is ready, duplicate a case page (for example `onezero.html`), replace its texts and images,
and change that tile's `href` in `index.html` to the new file (for example `href="arena.html"`).

## Contact details
The email, phone and LinkedIn link appear in the footer of every page. Search for `michalerez5@gmail.com`,
`054-451-8816` or `linkedin.com` to update them.
