NICE LITTLE CLICK LAB — PLEASE ADVISE SESSION + WHIMSY PATCH

This patch:
- lets the player choose a 10-email or 20-email session before starting
- shows the live count as “Email 3/10” or “Email 12/20” so the finish line is visible
- ends the round when the selected inbox is complete, while preserving the three-mistake early ending
- keeps the full 124-email master pool and randomly draws a fresh session each time
- brings some warmth and odd little office humor back into the feedback
- changes the feedback headings from “Correct / Inbox incident” to “Good call / Oh, dear”
- keeps feedback specific enough to teach why Reply, Reply All, or Spam / Ignore was right
- contains no uses of the site-wide prohibited terms

Copy these folders into:
E:\Dev\nice-little-click-lab

- components
- data

Choose “Replace the files in the destination.”

Then run:

npm run dev

Test both session lengths:
1. Choose 10 emails and confirm the HUD counts from 1/10.
2. Complete the tenth email and confirm the report appears.
3. Choose 20 emails and confirm the HUD counts from 1/20.
4. Make three mistakes and confirm the early HR ending still works.
5. Play several scenarios and check that the feedback feels playful, specific, and human rather than dry or overly polished.

Validation completed:
- 124 unique email scenarios remain in the master pool
- TypeScript passed with: npx tsc --noEmit
