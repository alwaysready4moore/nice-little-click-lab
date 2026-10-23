# Take Your Seat: first working editor

Free browser-only seating chart builder for weddings and classrooms. Preview route: `/clicks/take-your-seat`. The route is not indexed or listed in the product catalog pending review.

## Delivered

- Wedding starter with six eight-seat round tables; classroom starter with twenty desks and a front-of-room label; blank room.
- Add, name, remove, and drag round tables, rectangular tables, desks, and labels. Keyboard arrow keys and position sliders provide alternatives to dragging.
- Tables support 2–12 seats. Desks support one. Room items are kept inside the canvas. Overlap warnings flag intersecting furniture; this is a diagram, not a measured or accessibility-validated venue plan.
- Paste up to 240 names, one per line. Duplicate names receive visible numbering. Choose a name and tap a seat, or use the assignment menu.
- Assigned people swap seats. Placing an unassigned person into an occupied seat returns the occupant to the unassigned list. Reducing capacity or removing furniture releases affected assignments.
- Undo up to 50 changes. Save/reopen versioned JSON projects with validation and size limits. No accounts, API calls, localStorage, or automatic retention of names.
- SVG room image export, full assignment list, landscape print / browser Save PDF layout. Export and print remove editing selection highlights.
- Mobile controls stack above the room, which can scroll horizontally. No new packages or paid services.

## Validation

`node --experimental-strip-types --test scripts/test-seating.mjs` passes eight tests covering swaps, replacement behavior, invalid seats, removal/capacity changes, template bounds, overlap reporting, Unicode/duplicate-name round trips, and malformed imports. The command uses Node 22+; production runtime remains the repository's configured Node version because Next compiles the TypeScript.

`npm run build` passes with the new route. `npm run lint` passes. Browser interaction and print-layout visual QA still need a reachable preview: the cloud browser cannot reach the local development server. Do not claim these checks are complete.

## Release scope

Keep it free for the first trial. Paid themes, automatic seating rules, persistent links, and collaborative editing are outside this version. Before listing it as live, verify touch dragging/panning, keyboard navigation, project downloads/reopening, long-name print output, and the wedding/classroom layouts in a deployed preview.
