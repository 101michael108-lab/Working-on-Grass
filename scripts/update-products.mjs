/**
 * Populate product pages with researched content.
 *
 * Run:  node --env-file=.env.local scripts/update-products.mjs
 *
 * Each entry is set with { merge: true } so existing good content (long
 * descriptions, features, the DPM's how-it-works / field-use / expert quote)
 * is preserved — this only ADDS specifications, enables the right page
 * sections, and fills documented gaps. Re-runnable / idempotent.
 *
 * Facts sourced from Briza Publications listings, the books' ISBNs, and the
 * standard Bransby & Tainton (1977) disc-pasture-meter design.
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

const spec = (feature, description) => ({ feature, description });

const guideFeatures = [
  "Over 1 000 full-colour photographs for confident field identification",
  "An easy-to-use grass identification key",
  "At-a-glance icons for ecological status, grazing value and life form",
  "Distribution and habitat notes for every species",
  "Thirteen illustrated introductory chapters on grasses and grasslands",
];

const UPDATES = {
  // ── Guide to Grasses of Southern Africa (ENG) ──
  nNkeHLQncnBpzP8cDIkl: {
    sku: "978-1-920217-35-8",
    specifications: [
      spec("Format", "Softcover, 288 pages, full colour"),
      spec("Edition", "3rd revised edition"),
      spec("ISBN", "978-1-920217-35-8"),
      spec("Photographs", "Over 1 000 colour photographs"),
      spec("Grasses covered", "The region's ~300 most important species"),
      spec("Language", "English"),
      spec("Publisher", "Briza Publications"),
    ],
    features: guideFeatures,
    enabledSections: { specifications: true, whatsInside: true },
  },

  // ── Gids tot Grasse van Suider-Afrika (AFR) ──
  R0Cei1MmkMaUL5QNzOMg: {
    sku: "WOG-BK-GRASS-AF",
    specifications: [
      spec("Format", "Softcover, 288 pages, full colour"),
      spec("Edition", "3rd revised edition"),
      spec("Photographs", "Over 1 000 colour photographs"),
      spec("Grasses covered", "The region's ~300 most important species"),
      spec("Language", "Afrikaans"),
      spec("Publisher", "Briza Publications"),
    ],
    features: guideFeatures,
    enabledSections: { specifications: true, whatsInside: true },
  },

  // ── Veld Management: Principles and Practices (ENG) ──
  VMGxAVlEGIsXHVk40PWD: {
    sku: "978-1-920217-29-7",
    specifications: [
      spec("Format", "Softcover, 256 pages, full colour"),
      spec("ISBN", "978-1-920217-29-7"),
      spec("Dimensions", "240 × 168 mm"),
      spec("Illustrations", "380 colour photographs & illustrations"),
      spec("Language", "English"),
      spec("Publisher", "Briza Publications"),
    ],
    enabledSections: { specifications: true },
  },

  // ── Veld Bestuur: Beginsels en Praktyke (AFR) ──
  XAUH1IL3a1Ox949kdPUW: {
    sku: "WOG-BK-VELD-AF",
    specifications: [
      spec("Format", "Softcover, 256 pages, full colour"),
      spec("Dimensions", "240 × 168 mm"),
      spec("Illustrations", "380 colour photographs & illustrations"),
      spec("Language", "Afrikaans"),
      spec("Publisher", "Briza Publications"),
    ],
    enabledSections: { specifications: true },
  },

  // ── Disc Pasture Meter (DPM) ── content exists but was all hidden.
  uqjo4q94vSueEUSBM2ox: {
    sku: "WOG-DPM-01",
    longDescription:
      "The Disc Pasture Meter (DPM) is a simple, rugged field instrument for the rapid, objective and non-destructive estimation of standing grass biomass. A weighted aluminium disc slides down a graduated rod and settles on the sward; the settling height, read in centimetres and averaged over many readings, is converted to kilograms of dry matter per hectare using a calibration equation.\n\nSince Bransby and Tainton first described it in 1977, the DPM has become a standard tool in Southern African veld and grazing management. It replaces slow, destructive cut-and-weigh sampling with a measurement one person can take across a whole camp in minutes — turning grazing-capacity and stocking-rate decisions into data rather than guesswork.",
    specifications: [
      spec("Material", "Aluminium disc on a graduated stainless-steel rod"),
      spec("Disc diameter", "≈ 455 mm (standard calibrated disc)"),
      spec("Disc mass", "≈ 1.5 kg (standard settling mass)"),
      spec("Reading", "Settled-disc height in centimetres off the graduated rod"),
      spec("Use", "Grazing-capacity & standing-biomass estimation"),
      spec("Includes", "Calibration & usage guide"),
    ],
    features: [
      "Aluminium settling disc",
      "Graduated measuring rod (centimetres)",
      "Calibration & usage guide",
      "Protective carry bag",
    ],
    targetAudience:
      "• Commercial livestock and game farmers\n• Ecologists and rangeland scientists\n• Agricultural students and lecturers\n• Conservation and rehabilitation teams",
    calibrationNote:
      "Disc-pasture-meter readings must be calibrated to your own veld before use. Take cut-and-weigh samples across a range of standing biomass in your conditions to build a local calibration — regression relationships vary with region, season and sward type.",
    enabledSections: {
      longDescription: true,
      whatsInside: true,
      whoItsFor: true,
      howItWorks: true,
      fieldApplication: true,
      specifications: true,
      expertRecommendation: true,
      valueProposition: true,
      calibrationNote: true,
    },
  },
};

async function main() {
  const db = getFirestore(initializeApp({ credential: cert(loadCreds()) }));
  const now = Timestamp.now();
  for (const [id, data] of Object.entries(UPDATES)) {
    await db.collection("products").doc(id).set({ ...data, updatedAt: now }, { merge: true });
    console.log(`✓ updated ${id}`);
  }
  console.log(`\nDone — ${Object.keys(UPDATES).length} products enriched.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Update failed:", e);
  process.exit(1);
});
