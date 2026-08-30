# Appraise.ai capture extension

This optional Chromium extension captures the active page and uploads it to a local Swiftly appraisal. It uses React 18 and Vite.

Run `npm install && npm run build`, then load the generated `dist/` directory as an unpacked extension. It targets the local API at `http://localhost:8000` by default; set `VITE_API_BASE_URL` before building to use another local API port.
