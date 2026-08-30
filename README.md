# My Album Rating Mode

A single-file web app (just `index.html`) that turns your phone or PC into a Spotify remote for rating every song in the albums saved in your Spotify library, 1–5.

- **Rating mode** plays only unrated songs from your saved albums on any Spotify Connect device (phone, computer, speaker, car), one at a time. Tap 1–5 and it moves to the next one.
- **Already-rated songs never play again** in rating mode.
- **Ratings live in Spotify** as five private playlists: `My Ratings ★1` … `My Ratings ★5`. No database, nothing to back up, and they sync to every device instantly. You can even rate from the Spotify app by dragging a song into one of those playlists.
- **Combined playlists** (`My Albums ★4+`, `★3+`, `★5 Shuffle Mix`) are built/refreshed with one tap as your ratings grow.
- Songs tab: browse/search everything rated (or unrated) and change ratings.

Requires Spotify Premium (Spotify only allows playback control on Premium accounts).

---

## Deploy to GitHub Pages (one time, ~5 minutes)

You can do all of this with Claude Code on your Windows machine. Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

1. Put `index.html` and this `README.md` in a new folder called `album-rater`.

2. Create the repo and push:
   ```bash
   cd album-rater
   git init
   git add .
   git commit -m "My Album Rating Mode v1"
   gh repo create album-rater --public --source=. --push
   ```
   (If you don't have the GitHub CLI: create an empty public repo named `album-rater` on github.com, then `git remote add origin https://github.com/YOUR_GITHUB_USERNAME/album-rater.git` and `git push -u origin main`.)

3. Turn on GitHub Pages: on github.com open the repo → **Settings → Pages** → under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)** → Save. After a minute your app is live at:

   ```
   https://YOUR_GITHUB_USERNAME.github.io/album-rater/
   ```
   (Or with the CLI: `gh api -X POST repos/YOUR_GITHUB_USERNAME/album-rater/pages -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'`)

4. Register that URL with Spotify: go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → your app → **Settings** → **Redirect URIs** → add exactly (with the trailing slash):

   ```
   https://YOUR_GITHUB_USERNAME.github.io/album-rater/
   ```
   → **Add** → **Save**. The app shows the exact URI it needs under *Setup / advanced* on its login screen, so you can copy it from there.

5. Open the app URL on your phone, tap **Connect Spotify**, approve, and you're in. On iPhone, use Safari's *Share → Add to Home Screen* to get an app icon and full-screen mode.

The Client ID of your Spotify app is already baked in (`4866fd618022439bb34b3393fece1af5`). If you ever create a different Spotify app, change it under *Settings → Spotify app* inside the rater.

---

## Using it

1. Open Spotify on the device you want to hear music on (your phone is fine — the app and Spotify can be on the same phone) and press play on anything for a second so the device becomes "active".
2. In the rater, pick that device in the dropdown and tap **Start rating mode**.
3. Rate with the big 1–5 buttons. Use **Skip, rate later** to push a song back without rating it. **Undo** reverses your last rating.
4. Choose **Shuffle songs** or **Album by album** before starting.

Outside rating mode, the *Now playing* panel always shows whatever Spotify is currently playing, and you can rate that too.

### Playlists tab
Shows the five rating playlists with counts. The *Combined playlists* section builds `My Albums ★4+` etc. Tap **Sync** again anytime to update them with your latest ratings.

### Settings
- **Reload albums from Spotify** – run this after saving new albums to your library (the album list is cached for a week; ratings are re-read every time the app opens).
- **Treat the same song on different editions as one** – if you own both a regular and a deluxe/remastered edition, rating the song once covers both copies.

---

## Local testing (optional)

Serve the folder on the loopback address and add that URL as another Redirect URI in the Spotify dashboard:

```bash
npx serve -l 3000 .          # then open http://127.0.0.1:3000/
```
Redirect URI to add: `http://127.0.0.1:3000/`

---

## Technical notes

- Pure static HTML/JS, no build step, no server, no dependencies.
- Spotify OAuth **Authorization Code with PKCE** (no client secret needed). Tokens are kept in the browser's localStorage and refreshed automatically.
- Uses the Spotify Web API **as revised in February 2026** (`/me/library`, `/playlists/{id}/items`, `POST /me/playlists`), so it works with the current API, where older tutorials fail with 403s.
- Playback control is through **Spotify Connect** (`/me/player/*`): the page never plays audio itself, so it works from any browser, including iPhone Safari with the screen locked (music keeps playing in Spotify).
- Song source: every track of every album in *Your Library → Albums* (`GET /me/albums`).
- Rating write = add track to the `My Ratings ★N` playlist (and remove it from any other rating playlist). "Rated" = present in any of the five playlists.
- The rater keeps exactly one song queued ahead in Spotify, so moving to the next song is instant and gapless; if Spotify's autoplay or another device takes over, it re-issues playback of the expected song, and if you clearly took over manually it pauses rating mode.
