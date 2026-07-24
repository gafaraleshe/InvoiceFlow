/**
 * Seed the account owner's privileged workspace + API key.
 *
 * This provisions a "special access" tenant (default: SHOTBYGAFAR) on the
 * Business plan and mints an owner-scoped API key that unlocks every
 * capability. Use it to connect your own booking site to Sigma.
 *
 *   DATABASE_URL=... pnpm seed:owner
 *
 * Env (all optional):
 *   OWNER_ORG_NAME   workspace name           (default: "SHOTBYGAFAR")
 *   OWNER_USER_ID    Clerk user id to own it  (default: none — key-only tenant)
 *   OWNER_EMAIL      email for that user      (default: none)
 *   OWNER_KEY_NAME   API key label            (default: "SHOTBYGAFAR booking site")
 *
 * The plaintext key is printed ONCE — copy it into your booking site's
 * SIGMA_API_KEY. It is stored only as a SHA-256 hash.
 */
import { eq } from "drizzle-orm";
import { db } from "../server/db/client";
import { organizations, memberships } from "../server/db/schema";
import { createApiKey, syncUser } from "../server/db";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "owner"
  );
}

async function main() {
  const orgName = process.env.OWNER_ORG_NAME || "SHOTBYGAFAR";
  const userId = process.env.OWNER_USER_ID || null;
  const email = process.env.OWNER_EMAIL || null;
  const keyName = process.env.OWNER_KEY_NAME || `${orgName} booking site`;
  const slug = slugify(orgName);

  // Reuse an existing org with this slug, otherwise create one on Business.
  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({ name: orgName, slug, plan: "business" })
      .returning();
    console.log(`✓ created workspace "${orgName}" (${org.id}) on the Business plan`);
  } else {
    if (org.plan !== "business") {
      await db
        .update(organizations)
        .set({ plan: "business" })
        .where(eq(organizations.id, org.id));
    }
    console.log(`✓ using existing workspace "${orgName}" (${org.id})`);
  }

  // Optionally attach a human owner (Clerk user).
  if (userId && email) {
    await syncUser({ id: userId, email });
    await db
      .insert(memberships)
      .values({ organizationId: org.id, userId, role: "owner" })
      .onConflictDoNothing();
    console.log(`✓ ${email} is an owner of "${orgName}"`);
  }

  // Mint the owner-scoped key.
  const { key, apiKey } = await createApiKey(org.id, keyName, {
    scopes: ["owner"],
  });

  console.log("");
  console.log("─".repeat(60));
  console.log("  OWNER API KEY (shown once — copy it now):");
  console.log("");
  console.log(`  ${key}`);
  console.log("");
  console.log(`  name:   ${apiKey.name}`);
  console.log(`  scopes: owner (full special access)`);
  console.log("─".repeat(60));
  console.log("");
  console.log("Set it on your booking site as SIGMA_API_KEY, then run:");
  console.log("  node scripts/connect.mjs --url <your-sigma-origin> --key <key>");

  process.exit(0);
}

main().catch(err => {
  console.error("seed:owner failed:", err);
  process.exit(1);
});
