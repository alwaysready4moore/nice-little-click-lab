import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

const content = `# Nice Little Click Lab

> Tiny tools, games, and gifts for oddly specific moments.

Nice Little Click Lab is a small web-product studio operated by Moore Family Print Shop LLC. Its products are called Clicks: focused browser tools, games, and personalized downloads designed to do one clear job without accounts or unnecessary setup.

## Main pages

- [Home](${siteConfig.url}/): Studio overview and featured Clicks.
- [All Clicks](${siteConfig.url}/clicks): Current catalog of tools, games, and gifts.
- [Meeting Cost Ticker](${siteConfig.url}/clicks/meeting-cost-ticker): Free browser-based meeting cost calculator with a live timer and downloadable receipt.
- [Instant Custom Crossword Gift](${siteConfig.url}/clicks/custom-crossword): A $4 personalized crossword builder that creates a printable two-page PDF from 8 to 15 answers and clues.
- [Please Advise](${siteConfig.url}/clicks/please-advise): Free workplace email game with 10- or 20-email sessions.
- [About](${siteConfig.url}/about): What the Lab makes and how a Click is designed.
- [Contact](${siteConfig.url}/contact): Support, feedback, and purchase help.
- [Privacy](${siteConfig.url}/privacy): How browser data, payments, hosting logs, and personalized entries are handled.
- [Terms](${siteConfig.url}/terms): Terms for free tools and paid digital products.

## Product facts

### Meeting Cost Ticker

- Price: Free.
- Account required: No.
- Data handling: Meeting details and calculations stay in the browser and are not saved by the Lab.
- Output: A downloadable meeting receipt.
- Important limitation: Results are estimates based on the salary or hourly-cost values entered by the user.

### Instant Custom Crossword Gift

- Price: $4 USD, one-time purchase.
- Input: 8 to 15 complete answer-and-clue pairs, plus an optional dedication.
- Output: A two-page PDF containing the crossword and a separate answer key.
- AI use: Entries are arranged by programmed crossword logic, not sent to a generative AI service.
- Data handling: The Lab does not provide an account or permanent puzzle library. Customers should save the downloaded PDF.

### Please Advise

- Price: Free.
- Account required: No.
- Format: A fictional workplace game about choosing Reply, Reply All, or Spam / Ignore.
- Sessions: 10 or 20 emails.
- Important limitation: The game is entertainment, not legal, HR, or workplace-policy advice.

## Contact

Email: ${siteConfig.email}

Last updated: ${siteConfig.lastUpdated}
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
