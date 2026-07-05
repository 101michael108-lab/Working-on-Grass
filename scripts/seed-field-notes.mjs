/**
 * Field Notes authoring / seed script.
 *
 * Run:  npm run seed:field-notes
 *   (which is: node --env-file=.env.local scripts/seed-field-notes.mjs)
 *
 * Edit the NOTES array below and re-run — each note is upserted by slug
 * (the slug is the Firestore document id), so re-running updates in place
 * rather than creating duplicates. This is the primary way Field Notes are
 * written: author markdown-lite content here, run the script, done.
 *
 * Body format (markdown-lite):
 *   ## Heading        -> section heading (H2)
 *   ### Subheading    -> H3
 *   plain lines       -> paragraph (blank line separates paragraphs)
 *   - item            -> bullet list
 *   > quote           -> inline block quote
 *   **bold**          -> bold
 *   [label](/shop)    -> link (internal links keep authority on-site)
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function loadCreds() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (inline) return JSON.parse(inline);
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (path) return JSON.parse(readFileSync(path, "utf8"));
  return JSON.parse(readFileSync("service-account.json", "utf8"));
}

const DPM = "uqjo4q94vSueEUSBM2ox"; // Disc Pasture Meter product id

const NOTES = [
  {
    slug: "how-to-calculate-grazing-capacity",
    title: "How to Calculate Grazing Capacity on Your Veld",
    category: "Grazing Management",
    deck: "A practical, field-tested method for turning veld condition into a defensible stocking rate — without guesswork.",
    takeaways: [
      "Grazing capacity is a measure of how much forage your veld can sustainably produce, expressed in hectares per large stock unit (ha/LSU).",
      "Measure standing biomass objectively rather than eyeballing it — a disc pasture meter turns readings into kilograms of dry matter per hectare.",
      "Always leave a safe grazing fraction behind; harvesting everything sacrifices next season's production.",
    ],
    pullQuote: "You cannot manage what you have not measured — and on the veld, a number beats an opinion every time.",
    relatedProductId: DPM,
    publishedAt: new Date("2026-06-18T08:00:00+02:00"),
    body: `Grazing capacity is the single most important number in veld management, and the one most often guessed at. Set your stocking rate too high and you strip the veld faster than it can recover; too low and you leave production — and income — on the table. This note walks through a repeatable method you can run on your own land.

## What grazing capacity actually means

Grazing capacity is the area of veld required to sustain one large stock unit (LSU) over a year without degrading the resource, expressed as hectares per LSU. A lower number (say 4 ha/LSU) means productive veld; a higher number (say 12 ha/LSU) means sparse or arid veld that needs more area per animal.

It is not a fixed property of your farm. It shifts with rainfall, veld condition, and how you have grazed in previous seasons. That is exactly why it should be **measured**, not inherited from what the previous owner told you.

## Step 1: Measure standing biomass objectively

Walk a representative transect across each camp and take a series of settled-disc readings with a [disc pasture meter](/shop). Take 50 to 100 readings per camp so a few bare or rank patches do not skew the result. Average the readings, then apply your regional calibration to convert mean disc height into kilograms of dry matter per hectare.

Visual assessment feels faster, but two experienced people will disagree by 30% or more on the same camp. An instrument removes the argument.

## Step 2: Apply a safe grazing fraction

You never graze everything that grows. A portion must remain to protect the soil, feed the roots, and carry the sward into the next season. As a working rule, plan to use roughly a quarter to a third of the standing crop over the grazing period, adjusting for veld condition and season.

Multiply available dry matter by that fraction to get the forage you can actually allocate to animals.

## Step 3: Convert to a stocking rate

One LSU consumes roughly 10 to 12 kg of dry matter per day. Divide your allocatable forage by daily intake and the number of grazing days to arrive at the number of animals a camp can carry — and therefore the hectares each animal needs.

Re-measure each season. A wet year genuinely raises capacity; a drought genuinely lowers it, and the veld will punish a stocking rate that ignores the difference.`,
  },
  {
    slug: "sweetveld-vs-sourveld",
    title: "Sweetveld vs Sourveld: What the Difference Means for Grazing",
    category: "Veld Assessment",
    deck: "Why some veld feeds animals all year and some only in summer — and how to graze each without wrecking it.",
    takeaways: [
      "Sweetveld stays palatable and nutritious through winter; sourveld becomes unpalatable and low in nutrients once it matures.",
      "The difference is driven mainly by soil fertility and rainfall, not by a single grass species.",
      "Match your grazing calendar to veld type: rest sourveld in summer, and never rely on it for winter grazing without supplementation.",
    ],
    pullQuote: "Sweetveld forgives; sourveld remembers. Graze each on its own terms.",
    publishedAt: new Date("2026-05-30T08:00:00+02:00"),
    body: `Ask two farmers what "sourveld" means and you may get two answers. But the distinction between sweetveld and sourveld is one of the most useful frameworks for planning a grazing year in Southern Africa.

## The core difference

Sweetveld retains its nutritional value and palatability into the dormant winter season — animals will graze it year-round and hold condition. Sourveld, by contrast, grows vigorously in summer but becomes fibrous, unpalatable and low in protein once it matures, so its winter grazing value collapses.

Mixed veld sits between the two and shares characteristics of both.

## What drives it

The pattern tracks soil fertility and rainfall more than any single grass. Sweetveld tends to occur on more fertile soils in lower-rainfall areas; sourveld on leached, less fertile soils in higher-rainfall areas. The same species can even behave differently depending on where it grows.

Knowing which you have tells you how hard the veld can work for you and when it needs to rest.

## Grazing implications

- **Sweetveld** can carry animals through winter, but its resilience tempts overstocking — watch condition closely.
- **Sourveld** must be grazed while it is still green and growing in summer; plan alternative winter feed rather than forcing animals onto rank, low-value material.
- **On mixed veld**, move animals to follow quality through the season.

If you are not sure which you are standing on, a proper veld-condition assessment — species composition, basal cover and grazing value — will tell you. The [Guide to Grasses of Southern Africa](/shop) is the standard reference for identifying the indicator species that give it away.`,
  },
  {
    slug: "when-to-rest-your-veld",
    title: "When and How to Rest Your Veld",
    category: "Grazing Management",
    deck: "Rest is the cheapest input you have. Here is how to use it deliberately instead of by accident.",
    takeaways: [
      "Rest during the growing season lets key grasses flower, set seed and rebuild root reserves.",
      "A full-season rest every few years does more for veld recovery than continuous light grazing.",
      "Rotational systems work because they build rest in — not because they move animals for its own sake.",
    ],
    publishedAt: new Date("2026-05-12T08:00:00+02:00"),
    body: `Overgrazing is rarely about too many animals in absolute terms. More often it is about animals staying too long, or returning too soon, so the most valuable grasses never get to recover. The remedy is rest — applied on purpose.

## Why rest works

Perennial grasses recover by rebuilding root reserves and, periodically, by flowering and setting seed. Both need a stretch of the growing season free of defoliation. Grazing a plant repeatedly during active growth starves the roots and, over seasons, thins out the very species you want to keep.

Rest is how you bank that recovery.

## When to rest

The highest-value rest is during the summer growing season, timed so key grasses can complete their cycle. A camp that is rested through one full growing season every few years will recover faster than one grazed lightly but continuously — continuous light grazing still denies plants an uninterrupted recovery window.

> The goal is not to graze less. It is to graze, then leave — and mean it.

## Building rest into a system

Rotational grazing is popular because it structures rest into the calendar: animals concentrate in one camp while the others recover. The system only works if the recovery periods are genuinely long enough for the season and veld condition — moving animals on a fixed schedule that ignores growth is just overgrazing with extra steps.

Plan your rest deliberately, measure the response, and let the veld tell you whether the recovery window is long enough.`,
  },
];

async function main() {
  const app = initializeApp({ credential: cert(loadCreds()) });
  const db = getFirestore(app);
  const now = Timestamp.now();

  for (const n of NOTES) {
    const ref = db.collection("fieldNotes").doc(n.slug);
    await ref.set(
      {
        slug: n.slug,
        title: n.title,
        category: n.category,
        deck: n.deck,
        body: n.body,
        takeaways: n.takeaways ?? [],
        pullQuote: n.pullQuote ?? null,
        relatedProductId: n.relatedProductId ?? null,
        coverImageUrl: n.coverImageUrl ?? null,
        isPublished: n.isPublished ?? true,
        publishedAt: Timestamp.fromDate(n.publishedAt),
        updatedAt: now,
      },
      { merge: true }
    );
    console.log(`✓ upserted field note: ${n.slug}`);
  }
  console.log(`\nDone — ${NOTES.length} field notes written to Firestore.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
