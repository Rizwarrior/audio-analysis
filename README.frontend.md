# Frontend deploy (Vercel)

1. Set API URL (skip if using vercel.json env):
   - Windows PowerShell: `$env:VITE_API_URL="https://work-rizwanhussain--perc-analysis-backend-fastapi-app.modal.run"`
2. Build locally: `npm i && npm run build` (outputs to `dist/`).
3. Push only frontend source to GitHub; heavy folders are ignored by `.gitignore`.
4. On Vercel: New Project → Import the repo → Framework: Vite → Output: `dist`.

Environment variables:
- `VITE_API_URL`: your Modal backend base URL.

Project layout used by Vercel:
- `src/`, `index.html`, `vite.config.js`, `package.json`, `package-lock.json`.
- `dist/` is generated on build and not committed.


