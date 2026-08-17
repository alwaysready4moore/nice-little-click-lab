const siteUrl = "https://www.nicelittleclick.com";
const key = "79301f499f1545fa5986f52faaa49e0b";
const paths = [
  "/",
  "/clicks",
  "/clicks/meeting-cost-ticker",
  "/clicks/custom-crossword",
  "/clicks/please-advise",
  "/clicks/custom-word-search",
  "/clicks/should-have-been-an-email",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList: paths.map((path) => new URL(path, siteUrl).toString()),
};

try {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok || response.status === 202) {
    console.log(
      `IndexNow accepted ${payload.urlList.length} URLs (HTTP ${response.status}).`,
    );
  } else {
    console.warn(
      `IndexNow returned HTTP ${response.status}. The site build is unaffected.`,
    );
    process.exitCode = 0;
  }
} catch (error) {
  console.warn("IndexNow submission could not be completed:", error);
  console.warn("The site build is unaffected. Try npm run indexnow again later.");
  process.exitCode = 0;
}
