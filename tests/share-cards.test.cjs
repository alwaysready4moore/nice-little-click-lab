const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const cache = new Map();

function loadTypeScript(relativePath) {
  const file = path.resolve(root, relativePath);
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod.exports);
  const localRequire = (request) => {
    if (request.startsWith("@/")) {
      return loadTypeScript(resolveAlias(request.slice(2)));
    }
    if (!request.startsWith(".")) return require(request);
    const resolved = path.resolve(path.dirname(file), request);
    return loadTypeScript(path.relative(root, resolveExisting(resolved)));
  };
  const wrapper = vm.runInThisContext(
    "(function(require, module, exports) { " + compiled + "\n})",
    { filename: file },
  );
  wrapper(localRequire, mod, mod.exports);
  return mod.exports;
}

function resolveExisting(resolved) {
  if (fs.existsSync(resolved)) return resolved;
  for (const ext of [".ts", ".tsx", ".js"]) {
    if (fs.existsSync(resolved + ext)) return resolved + ext;
  }
  throw new Error("Missing test dependency: " + resolved);
}

function resolveAlias(specifier) {
  return path.relative(root, resolveExisting(path.resolve(root, specifier)));
}

const { clicks } = loadTypeScript("data/clicks.ts");
const { guides } = loadTypeScript("data/guides.ts");
const { siteConfig } = loadTypeScript("lib/site.ts");
const { clickShareCard, guideShareCard } = loadTypeScript("lib/share-card.ts");
const { shareImageUrl } = loadTypeScript("lib/seo.ts");

const verifiedPrices = {
  "meeting-cost-ticker": "Free",
  "custom-crossword": "$4",
  "please-advise": "Free",
  "custom-word-search": "$3",
  "should-have-been-an-email": "Free",
  "halloween-candy-calculator": "Free",
  "gift-budget-splitter": "Free",
  "take-your-seat": "Free",
};

test("share cards use catalog names, taglines, and prices", () => {
  assert.equal(siteConfig.url, "https://nicelittleclick.com");
  assert.deepEqual(
    clicks.map((click) => click.slug).sort(),
    Object.keys(verifiedPrices).sort(),
  );

  for (const click of clicks) {
    const card = clickShareCard(click.slug);
    assert.equal(card.title, click.name);
    assert.equal(card.tagline, click.shortDescription);
    assert.equal(card.badge, click.priceLabel);
    assert.equal(card.badge, verifiedPrices[click.slug]);
    assert.equal(card.path, `/clicks/${click.slug}`);
    assert.equal(card.footer, `nicelittleclick.com${card.path}`);
    assert.equal(shareImageUrl(card.path), `${siteConfig.url}${card.path}/opengraph-image`);
    assert.equal(card.alt.includes(click.priceLabel), true);
    assert.equal(/review|rating|stars/i.test(card.alt), false);
  }
});

test("guide cards do not invent prices", () => {
  const catalogAmounts = new Set(
    clicks.map((click) => click.priceLabel).filter((label) => label.startsWith("$")),
  );
  const cards = [guideShareCard("index"), ...guides.map((guide) => guideShareCard(guide.slug))];

  for (const card of cards) {
    assert.equal(shareImageUrl(card.path), `${siteConfig.url}${card.path}/opengraph-image`);
    assert.equal(card.footer.startsWith("www."), false);
    const amounts = card.title.match(/\$\d+(?:\.\d+)?/g) || [];
    const taglineAmounts = card.tagline.match(/\$\d+(?:\.\d+)?/g) || [];
    for (const amount of [...amounts, ...taglineAmounts]) {
      const underFiveGuideName = amount === "$5" && /under \$5/i.test(`${card.title} ${card.tagline}`);
      assert.equal(
        catalogAmounts.has(amount) || underFiveGuideName,
        true,
        `${amount} on ${card.path}`,
      );
    }
    if (card.badge.startsWith("$")) assert.equal(catalogAmounts.has(card.badge), true);
  }

  const gifts = guideShareCard("personalized-gifts-under-5");
  assert.match(gifts.tagline, /\$4/);
  assert.match(gifts.tagline, /\$3/);
  assert.equal(guideShareCard("secret-santa-budget").badge, "Guide");
  assert.equal(guideShareCard("holiday-seating-chart").badge, "Guide");
});

test("each live Click and guide route has an opengraph image file", () => {
  const pages = [
    ...clicks.map((click) => `app/clicks/${click.slug}`),
    "app/guides",
    ...guides.map((guide) => `app/guides/${guide.slug}`),
  ];
  for (const page of pages) {
    assert.equal(fs.existsSync(path.join(root, page, "opengraph-image.tsx")), true, page);
    const source = fs.readFileSync(path.join(root, page, "page.tsx"), "utf8");
    assert.equal(source.includes("siteConfig.socialImage"), false, page);
    assert.equal(source.includes("summary_large_image") || source.includes("socialMetadata"), true, page);
  }
});
