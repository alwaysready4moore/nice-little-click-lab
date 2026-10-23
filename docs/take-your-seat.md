# Take Your Seat: Click 008

Free browser-only seating chart builder for weddings and classrooms. Route: `/clicks/take-your-seat`. Listed in the product catalog and sitemap, with homepage promotion and indexing enabled for launch.

## Delivered

- Wedding starter with six eight-seat round tables; classroom starter with twenty desks and a front-of-room label; blank room.
- Add, name, remove, and drag round tables, rectangular tables, desks, and labels. Keyboard arrow keys and position sliders provide alternatives to dragging.
- Tables support 2–12 seats. Desks support one. Room items are kept inside the canvas. Overlap warnings flag intersecting furniture; this is a diagram, not a measured or accessibility-validated venue plan.
- Paste up to 240 names, one per line. Duplicate names receive visible numbering. Choose a name and tap a seat, or use the assignment menu.
- Assigned people swap seats. Placing an unassigned person into an occupied seat returns the occupant to the unassigned list. Reducing capacity or removing furniture releases affected assignments.
- Undo up to 50 changes. Save/reopen versioned JSON projects with validation and size limits. No accounts, API calls, localStorage, or automatic retention of names.
- SVG room image export, full assignment list, landscape print / browser Save PDF layout. Export and print remove editing selection highlights.
- Mobile controls stack above the room, which can scroll horizontally. No new packages or paid services.
- Person and seat selectors beside the canvas let users continue assigning without returning to the roster. Next unseated cycles through people who still need a seat. Controls have at least 44px hit areas; the nearby selectors provide an alternative to the smaller diagram seats.
- Full assignment lists explicitly show seat numbering, including in print; long names can wrap instead of being clipped.

## Validation

`node --experimental-strip-types --test scripts/test-seating.mjs` passes eight tests covering swaps, replacement behavior, invalid seats, removal/capacity changes, template bounds, overlap reporting, Unicode/duplicate-name round trips, and malformed imports. The command uses Node 22+; production runtime remains the repository's configured Node version because Next compiles the TypeScript.

`npm run build` and `npm run lint` pass. On the deployed preview, browser checks confirmed opening the People panel, adding four names including Alexandra Montgomery-Santiago and Unicode text, assigning people to seats, and swapping occupied seats. The room shortens long names while the full list retains them.

Deployed browser checks also confirmed undo, the canvas-adjacent seat selector, Next unseated moving to the remaining guest, and the completed state disabling Next unseated. Explicit list numbers and full long names were present.

The owner reported the remaining phone-touch and printed-PDF tests complete and passing on October 23, 2026: “Tests complete, all good.” These are owner-reported passes, not agent-observed device/PDF checks. The available test browser did not support those final checks directly.

## Release scope

Keep it free for the first trial. Paid themes, automatic seating rules, persistent links, and collaborative editing are outside this version. The owner-reported final tests complete the remaining phone/print release checks. Follow up on real-user feedback before expanding scope.
