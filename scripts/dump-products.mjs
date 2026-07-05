import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadCreds() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (inline) return JSON.parse(inline);
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (path) return JSON.parse(readFileSync(path, "utf8"));
  return JSON.parse(readFileSync("service-account.json", "utf8"));
}

const db = getFirestore(initializeApp({ credential: cert(loadCreds()) }));
const snap = await db.collection("products").get();
console.log(`\n${snap.size} products:\n`);
snap.forEach((d) => {
  const p = d.data();
  console.log("========================================");
  console.log("id:", d.id);
  console.log("name:", p.name);
  console.log(`category: ${p.category} | price: ${p.price} | stock: ${p.stock} | sku: ${p.sku || "-"} | brand: ${p.brand || "-"} | isDigital: ${!!p.isDigital}`);
  console.log("description:", (p.description || "").replace(/\s+/g, " ").slice(0, 260));
  console.log(
    `content -> longDesc:${(p.longDescription || "").length}ch specs:${(p.specifications || []).length} features:${(p.features || []).length} howItWorks:${!!p.howItWorks} fieldUse:${!!p.fieldUse} authority:${!!p.authorityStatement} audience:${!!p.targetAudience} valueProp:${!!p.valueProposition} calibration:${!!p.calibrationNote}`
  );
  console.log("enabledSections:", JSON.stringify(p.enabledSections || {}));
  console.log("images:", (p.images || []).length);
});
process.exit(0);
