import Link from "next/link";
import { ClickMention } from "@/components/guides/ClickMention";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  assertFree,
  guideBySlug,
  guidePath,
  requireClick,
} from "@/data/guides";
import {
  articleStructuredData,
  breadcrumbStructuredData,
  howToStructuredData,
  socialMetadata,
} from "@/lib/seo";
import { LIMITS, createProject } from "@/lib/seating";
import { siteConfig } from "@/lib/site";

const guide = guideBySlug("holiday-seating-chart");
const seating = requireClick("take-your-seat");
const crossword = requireClick("custom-crossword");
const wordSearch = requireClick("custom-word-search");
const splitter = requireClick("gift-budget-splitter");
assertFree(seating);
assertFree(splitter);

const wedding = createProject("wedding");
const classroom = createProject("classroom");
const blank = createProject("blank");
const weddingTables = wedding.furniture.filter((item) => item.kind === "round");
const classroomDesks = classroom.furniture.filter((item) => item.kind === "desk");
const classroomLabel = classroom.furniture.find((item) => item.kind === "label");
const weddingSeats = weddingTables[0]?.capacity;
if (!weddingTables.length || weddingSeats === undefined || !classroomLabel) {
  throw new Error("Take Your Seat starters changed; update the seating guide.");
}
if (weddingTables.some((table) => table.capacity !== weddingSeats)) {
  throw new Error("Wedding starter tables no longer share one seat count.");
}
const frontOfRoom = classroomLabel;

const steps = [
  {
    id: "decide-the-job",
    name: "Decide what the chart is for",
    text: "A holiday chart gives everyone a chair and puts them near someone they are glad to see. It is a hospitality sketch, and the feelings stay with the host.",
  },
  {
    id: "start-the-room",
    name: "Start from a blank room or the wedding layout",
    text: `The wedding starter opens ${weddingTables.length} round tables with ${weddingSeats} seats each. The classroom starter opens ${classroomDesks.length} desks. Blank starts empty. Names you already typed stay if you switch layouts; the seats clear.`,
  },
  {
    id: "size-the-tables",
    name: "Size the tables to the dinner you are actually hosting",
    text: "Add round tables, long tables, desks, and room labels. Tables can be set from 2 to 12 seats. A desk holds one person. A label holds a word, such as Kitchen or Door, and nobody sits on it.",
  },
  {
    id: "assign-seats",
    name: "Add names, then give each person a chair",
    text: `Paste up to ${LIMITS.people} names, one per line, with up to ${LIMITS.name} characters each. Choose a person and tap a seat, or use the assignment menu. Two seated people swap if you give one of them the other's chair.`,
  },
  {
    id: "leave-air",
    name: "Leave a little air, and skip the grudge seating",
    text: "An empty chair is for the late arrival. People who need space get different tables, and the printed page stays a list of seats rather than a footnote about why.",
  },
  {
    id: "save-and-print",
    name: "Save the project, then print the assignment list",
    text: "Names stay in this browser tab. There is no automatic save and no account. Save the project file before you leave, and use Print / Save PDF when you want the full list of who sits where.",
  },
] as const;

const pagePath = guidePath(guide.slug);

export const metadata = socialMetadata({
  title: guide.title,
  description: guide.description,
  path: pagePath,
  type: "article",
  publishedTime: guide.updatedAt,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    articleStructuredData({
      headline: guide.title,
      description: guide.description,
      path: pagePath,
      datePublished: guide.updatedAt,
      dateModified: guide.updatedAt,
    }),
    howToStructuredData({
      name: guide.title,
      description: guide.description,
      path: pagePath,
      steps: [...steps],
      tools: [{ name: seating.name, path: `/clicks/${seating.slug}` }],
    }),
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: guide.title, path: pagePath },
    ]),
  ],
};

export default function HolidaySeatingGuidePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <GuideArticle
        guide={guide}
        aside="Chairs are easy. Who sits next to whom is the whole sport."
      >
        <p>
          Holiday dinner drama rarely starts with the green beans. It starts
          when two people who needed a little distance are handed neighboring
          chairs, or when the host spends the meal crossing the room for the
          kitchen. A chart will not settle a family. It can keep the easy
          mistakes from being accidents.{" "}
          <Link href={`/clicks/${seating.slug}`}>{seating.name}</Link> is free,
          it runs in the browser, and there is no account. Names stay in the
          tab until you save a project file yourself.
        </p>
        <p>
          {siteConfig.name} built the Click for wedding tables and classroom
          desks. A holiday dinner can borrow either shape, as long as you
          remember the drawing has never seen your hallway.
        </p>

        <section aria-labelledby="decide-the-job">
          <h2 id="decide-the-job">{steps[0].name}</h2>
          <p>{steps[0].text}</p>
          <p>
            Write two short lists on paper, because the Click does not store
            rules. Must-sit-together covers partners, a child and the adult who
            knows their bedtime, and anyone who needs a familiar chair nearby.
            Glad-to-be-near covers the guest who knows almost nobody. Seat
            those pairs first. People who need space get different tables, not
            a buffer seat between them.
          </p>
        </section>

        <section aria-labelledby="start-the-room">
          <h2 id="start-the-room">{steps[1].name}</h2>
          <p>{steps[1].text}</p>
          <p>
            The wedding layout arrives titled “{wedding.title}.” The classroom
            layout is titled “{classroom.title},” with a label reading “
            {frontOfRoom.label}” and {classroomDesks.length} one-person
            desks. Blank is empty and starts from the title “{blank.title},”
            which you can replace. The chart title can run to 80 characters.
            Rename it to the dinner you are hosting so the printout does not
            still say classroom. Undo covers up to 50 changes, so a reckless
            layout is a detour.
          </p>
          <p>
            Walk the real room before you fall in love with the drawing.{" "}
            {seating.name} warns you when furniture overlaps on the canvas.
            That warning is about the diagram. Move the highlighted pieces
            apart before you print, then look at the actual hall. The canvas
            does not know your doorway or whether a chair fits.
          </p>
          <div className="mention-grid">
            <ClickMention click={seating} />
          </div>
        </section>

        <section aria-labelledby="size-the-tables">
          <h2 id="size-the-tables">{steps[2].name}</h2>
          <p>{steps[2].text}</p>
          <p>
            A round table you add starts with 8 seats, and a long table starts
            with 6. Either can be set from 2 to 12. Desks stay single seats.
            Labels such as Kitchen, Door, or Porch keep the drawing oriented,
            and they do not add capacity. The room holds up to {LIMITS.furniture}{" "}
            items. Drag a piece, use the arrow keys, or nudge it with the
            position sliders, and rename “Table 3” to “By the window” if that
            is how people will find themselves.
          </p>
          <p>
            Put the host near the kitchen or door you labeled. A kids’ spot
            can be a smaller table or a short row of desks. If there are more
            people than chairs, the plan says how many seats are still missing.
            Add them before the coats come off.
          </p>
        </section>

        <section aria-labelledby="assign-seats">
          <h2 id="assign-seats">{steps[3].name}</h2>
          <p>{steps[3].text}</p>
          <p>
            Empty lines are ignored. If a batch would break the{" "}
            {LIMITS.people}-person limit or the {LIMITS.name}-character limit,
            none of those names are added. Duplicate names get a visible
            number, so two people with the same name can have two chairs. The
            assignment menu is the steadier path on a phone. Next unseated
            walks to the next person still standing, and search helps when the
            list is long. The plan counts who is seated, how many seats are
            empty, and how many tables or desks are full.
          </p>
          <p>
            Swaps are specific. If both people already had seats and you place
            one in the other’s chair, they trade. If the person you are placing
            had no seat and you choose an occupied chair, the occupant returns
            to the unassigned list. Shrinking a table, or deleting it, sends
            the affected people back to the list too. Remove a guest and undo
            can bring them back. Holidays are famous for changing the list.
          </p>
        </section>

        <section aria-labelledby="leave-air">
          <h2 id="leave-air">{steps[4].name}</h2>
          <p>{steps[4].text}</p>
          <p>
            If the room can spare a chair, leave it empty for the late arrival
            or the 4 p.m. text. An empty seat on the chart is cheaper than a
            folding chair found during the toast. When two people need space,
            stop explaining it on the page. The printout should read like
            hospitality: a table, a seat, a name. Someone will read that paper
            out loud. Give them nothing to narrate except the chair.
          </p>
        </section>

        <section aria-labelledby="save-and-print">
          <h2 id="save-and-print">{steps[5].name}</h2>
          <p>{steps[5].text}</p>
          <p>
            Save project downloads a file you can open here later. The opener
            expects a file smaller than 1 MB, and a file that is not a valid{" "}
            {seating.name} project leaves the current plan alone. Save room
            image downloads an SVG. Print / Save PDF carries the assignment
            list, with seat numbers, and long names can wrap. Printing drops
            the editing highlights, so clear any overlap warning first.
          </p>
          <p>
            You place every person yourself. This version has no automatic
            seating and no live co-host link, so send the project file and
            agree who may move a table. Bring the paper. A chart that lives
            only on a phone becomes a performance during the soup.
          </p>
          <p>
            The other weekend jobs have their own notes. A{" "}
            <Link href={`/clicks/${crossword.slug}`}>
              {crossword.priceLabel} crossword
            </Link>{" "}
            or a{" "}
            <Link href={`/clicks/${wordSearch.slug}`}>
              {wordSearch.priceLabel} word search
            </Link>{" "}
            can sit at a place setting; the{" "}
            <Link href={guidePath("personalized-gifts-under-5")}>gift guide</Link>{" "}
            explains both. A Secret Santa split belongs in{" "}
            <Link href={`/clicks/${splitter.slug}`}>{splitter.name}</Link> and
            the{" "}
            <Link href={guidePath("secret-santa-budget")}>budget guide</Link>,
            which never has to share a spreadsheet with this chart.
          </p>
        </section>
      </GuideArticle>
    </>
  );
}
