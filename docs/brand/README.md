# Click brand assets v2

Approved October 22, 2026. The approved model is `click-reference-v2.png`.

Click is a golden retriever puppy with teal goggles resting on his forehead, a teal collar, and a white computer mouse cursor tag attached with a gold ring. Keep compact natural canine anatomy, gentle expressions, bold charcoal contours, lighter interior lines, matte color, and restrained shading. No standard clothing. A lab coat may cover his back as a blanket while he naps.

## Canon and assets

`click-style-guide-v2.txt` mirrors the updated Click Style Guide in Google Drive. `palette.json` and `brand-tokens.css` provide exact brand colors. Functional dark teal #315F5B supports readable text on cream; decorative brand teal is #6FA7A3.

Production illustrations are generated with imagegen from the approved model sheet. Four PNG masters are supplied: seated, avatar, sleeping under the coat, and resting beside a clipboard. Website exports live in `public/images/click`. Existing filenames remain compatible with the homepage, product tools, contact/about pages, canvas receipts, and structured metadata. The former meeting-room image is now the same sleeping pose. The legacy writing filename now depicts a puppy beside a clipboard; descriptive alt text reflects this.

The avatar, circle mark, full logo, cursor detail, palette graphic, favicon, and social preview use the same model. The wordmark retains the site's Favorite Child typeface. `scripts/build-brand-assets.mjs` assembles exports from the masters, including transparent padding and correct social dimensions. Run `node scripts/build-brand-assets.mjs` after `npm ci`.

Older brand sheets with round sparkle tags and worn lab coats are superseded; previous versions remain available in Git history and Drive version history. Other listed poses in the guide remain planned, not delivered illustrations.

## Reusable image prompt

Use the approved Click v2 model sheet as the identity reference. Preserve the golden retriever puppy's rounded face, floppy ears, small oval black eyes, teal goggles on forehead, teal collar, white mouse cursor pendant and gold attachment. Use natural quadruped anatomy, bold tapered charcoal outer contours, finer interior marks, matte gold and cream coloring, and restrained cel shadows. Keep expression gentle and pose readable at small sizes. No human hands, giant anime eyes, worn clothing, dense fur rendering, glossy 3D, speech bubbles, or round sparkle tags. For isolated production assets request a genuinely transparent background with padding. Specify only the required pose and props.

## Website use

Use Click sparingly, retaining each product's visual personality. Decorative images have empty alt text; informative portraits have descriptive alt text. Keep names and controls clear in the future seating editor. No product behavior, checkout logic, or launch roadmap changed as part of this update.
