# Click No. 004 installation

Copy the included `app`, `data`, and `lib` folders into the root of the full Nice Little Click Lab repository. Choose **Replace files in destination** when prompted.

No new npm dependencies or environment variables are required. The word search reuses the existing Stripe secret and `SITE_URL` settings used by the crossword.

Then run:

```powershell
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Check:

- http://localhost:3000/clicks
- http://localhost:3000/clicks/custom-word-search

Use Stripe test mode for the complete checkout and PDF-download test.

## Included behavior

- 10–30 unique words or short phrases
- Easy, medium, and hard placement directions
- Classic, celebration, and kids presentation modes
- Watermarked browser preview
- $3 Stripe Checkout
- Two-page printable PDF with answer key
- Session-storage handoff during checkout
- Server-side payload validation and deterministic puzzle rebuilding
- Product metadata, FAQ schema, catalog card, and sitemap entry
