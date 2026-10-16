// Small dependency-free regression suite; uses the project's existing
// TypeScript dev dependency to load its pure validation/layout modules.
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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod.exports);
  const localRequire = (request) => {
    if (!request.startsWith(".")) return require(request);
    const resolved = path.resolve(path.dirname(file), request);
    const candidate = fs.existsSync(resolved + ".ts") ? resolved + ".ts" : resolved;
    if (!fs.existsSync(candidate)) throw new Error("Missing test dependency: " + candidate);
    return loadTypeScript(path.relative(root, candidate));
  };
  const wrapper = vm.runInThisContext("(function(require, module, exports) { " + compiled + "\n})", { filename: file });
  wrapper(localRequire, mod, mod.exports);
  return mod.exports;
}

const { meetingReceiptCanvasHeight, meetingReceiptFooterTop, meetingReceiptLastRowBottom } =
  loadTypeScript("lib/meeting-receipt-layout.ts");
const { parseCrosswordPurchasePayload } = loadTypeScript("lib/crossword/purchase.ts");
const { parseWordSearchPurchasePayload } = loadTypeScript("lib/wordsearch/purchase.ts");
const { canonicalizePurchaseBackup } = loadTypeScript("lib/purchase-backup.ts");

test("receipts fit one, eight, twelve and twenty attendee groups", () => {
  for (const count of [1, 8, 12, 20]) {
    const height = meetingReceiptCanvasHeight(count);
    assert.ok(height >= 1600);
    assert.ok(meetingReceiptFooterTop(count) - meetingReceiptLastRowBottom(count) >= 60,
      "footer must clear attendee rows for " + count + " groups");
  }
});

test("crossword checkout accepts eight valid entries but rejects duplicates", () => {
  const entries = ["PEACHES", "BALTIMORE", "BEES", "BOOKSHOP", "JOSIE", "HONEY", "SUNDAY", "MUSEUM"]
    .map((answer, index) => ({ id: "entry-" + index, answer, clue: "Clue " + index }));
  const payload = { title: "A puzzle", dedication: "", includeClickOnAnswerKey: true, entries };
  assert.equal(parseCrosswordPurchasePayload(payload)?.entries.length, 8);
  assert.equal(parseCrosswordPurchasePayload({ ...payload, entries: [entries[0], entries[0], ...entries.slice(2)] }), null);
  assert.equal(parseCrosswordPurchasePayload({ ...payload, entries: entries.slice(1) }), null);
});

test("word search rejects duplicate, short and overlong words", () => {
  const words = ["PEACHES", "BALTIMORE", "BEES", "BOOKSHOP", "JOSIE", "HONEY", "SUNDAY", "MUSEUM", "GARDEN", "PIZZA"]
    .map((word, index) => ({ id: "word-" + index, word }));
  const payload = { title: "A search", dedication: "", difficulty: "medium", theme: "classic", includeClickOnAnswerKey: true, words };
  assert.equal(parseWordSearchPurchasePayload(payload)?.words.length, 10);
  assert.equal(parseWordSearchPurchasePayload({ ...payload, words: [words[0], words[0], ...words.slice(2)] }), null);
  assert.equal(parseWordSearchPurchasePayload({ ...payload, words: [{ id: "one", word: "A" }, ...words.slice(1)] }), null);
  assert.equal(parseWordSearchPurchasePayload({ ...payload, words: [{ id: "long", word: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }, ...words.slice(1)] }), null);
});

test("portable backups use the exact canonical payload recorded in Stripe", () => {
  const rawCrossword = {
    title: "  My Crossword  ",
    dedication: " hello ",
    includeClickOnAnswerKey: true,
    entries: ["PEACHES", "BALTIMORE", "BEES", "BOOKSHOP", "JOSIE", "HONEY", "SUNDAY", "MUSEUM"]
      .map((answer, index) => ({ id: "custom-" + index, answer, clue: "Clue " + index })),
  };
  const expectedCrossword = parseCrosswordPurchasePayload(rawCrossword);
  assert.equal(
    JSON.stringify(canonicalizePurchaseBackup("crossword", rawCrossword)),
    JSON.stringify(expectedCrossword),
  );
  assert.equal(expectedCrossword.entries[0].id, "memory-1");

  const rawWordSearch = {
    title: "  My Word Search ",
    dedication: " hi ",
    difficulty: "medium",
    theme: "classic",
    includeClickOnAnswerKey: false,
    words: ["PEACHES", "BALTIMORE", "BEES", "BOOKSHOP", "JOSIE", "HONEY", "SUNDAY", "MUSEUM", "GARDEN", "PIZZA"]
      .map((word, index) => ({ id: "draft-" + index, word })),
  };
  const expectedWordSearch = parseWordSearchPurchasePayload(rawWordSearch);
  assert.equal(
    JSON.stringify(canonicalizePurchaseBackup("wordsearch", rawWordSearch)),
    JSON.stringify(expectedWordSearch),
  );
  assert.equal(expectedWordSearch.words[0].id, "word-1");
});
