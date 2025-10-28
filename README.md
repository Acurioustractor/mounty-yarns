# Mounty Yarns Web Experience

This repository contains a static site version of the **Mounty Yarns** report, built from the PDF so it can be explored online. It includes:

- Responsive landing page with video embed and PDF download.
- Interactive story highlights powered by JSON data.
- Full report viewer with page images and searchable text.
- “Pathways for change” section linking directly into the relevant report pages.

## Project structure

```
.
├── index.html           # Entry point
├── styles/
│   └── main.css         # Global styling
├── scripts/
│   └── app.js           # Client-side interactivity
├── data/                # Structured content derived from the PDF
│   ├── mounty-yarns.txt
│   ├── sections.json
│   ├── stories.json
│   └── updates.json
├── assets/
│   ├── page-01.png …    # Page images generated from the PDF
│   └── images/          # Artwork extracted from the PDF
└── Mounty+Yarns.pdf     # Original source document
```

Everything is self-contained — no build step or external dependencies are required.

## Local preview

Any static file server will work. A quick option with Python 3:

```bash
cd "/path/to/Mounty Yarns"
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.  
Ensure the `assets/` folder stays alongside `index.html` so image paths resolve correctly.

## GitHub hosting

1. Create a new GitHub repository (public or private).
2. Copy the project files into that repository.
3. Commit and push (`git add . && git commit -m "Add Mounty Yarns site" && git push`).
4. Enable **GitHub Pages** for the repository:
   - In *Settings → Pages*, choose the `main` branch and the root (`/`) folder.
   - Save; GitHub will publish the site (the URL is shown on the Pages settings screen).

Because the project is static, no additional configuration is needed.

## Deploying to Vercel

You can deploy directly from the GitHub repository or upload the folder manually.

### Deploy via GitHub (recommended)

1. Push the repo to GitHub (as outlined above).
2. In the Vercel dashboard, click **New Project → Import Git Repository**.
3. Authorise Vercel to access the repo, then select it.
4. Accept the defaults:
   - **Framework Preset:** `Other`
   - **Root Directory:** `/`
   - **Build Command / Output Directory:** leave blank (Vercel treats it as a static export).
5. Deploy. Vercel will serve `index.html` from the project root.

### Deploy via Vercel CLI (optional)

```bash
npm i -g vercel
vercel login
vercel --prod
```

When prompted for “Framework” choose `Other`, and for “Output directory” press enter (empty). The CLI will upload the directory contents as-is.

## Future updates

- Replace or extend the JSON content in `data/` as new stories, quotes, or pathways emerge.
- If you connect the “Submit a new story or update” form to a CMS or API, adjust `handleUpdateSubmit` in `scripts/app.js`.
- Regenerate `assets/page-*.png` by running `pdftoppm Mounty+Yarns.pdf assets/page -png` if a new PDF version is released.

---

Built to help Mount Druitt’s young people share their yarns with the world. Let’s keep it growing. 
