# Nice Little Click Lab

Starter shell for the Nice Little Click Lab website.

## Start locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Netlify

1. Push this folder to GitHub.
2. Import the repository into Netlify.
3. Netlify should detect the Next.js project automatically.
4. Add secrets in Netlify environment variables when Stripe or email is introduced.

## Project structure

- `app/` routes and pages
- `components/site/` permanent Lab shell
- `components/clicks/` shared Click components
- `data/clicks.ts` product registry
- `public/brand/` logo and mascot assets
- `public/fonts/` licensed font files, which must be added locally and not committed if licensing forbids distribution

## Next steps

- Replace placeholder typography with the purchased brand fonts
- Add final logo and Click artwork
- Design the homepage
- Build `/clicks/meeting-cost-ticker`
- Add Stripe only when the first paid Click is ready

## Brand fonts

Add your licensed font files locally at:

- `public/fonts/FavoriteChild-Regular.woff2`
- `public/fonts/Mimosa.otf`

The styles are already wired up in `app/globals.css`. The font binaries are intentionally not included in this starter archive.
