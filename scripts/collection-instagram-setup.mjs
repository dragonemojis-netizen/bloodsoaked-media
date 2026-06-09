/**
 * Validates Instagram API credentials and prints setup diagnostics.
 * Run: node scripts/collection-instagram-setup.mjs
 */
import "./lib/load-env.mjs";
import {
  fetchAllInstagramMedia,
  fetchInstagramIdentity,
  loadInstagramConfig,
  resolveInstagramUserId,
} from "./lib/collection-instagram-api.mjs";

async function main() {
  console.log("Collection Instagram Setup");
  console.log("==========================");

  let config;
  try {
    config = loadInstagramConfig();
  } catch (err) {
    console.error(`\n${err.message}`);
    printSetupGuide();
    process.exit(1);
  }

  try {
    const identity = await fetchInstagramIdentity(config);
    const userId = await resolveInstagramUserId(config);
    const sample = await fetchAllInstagramMedia(config, userId, { limit: 3 });

    console.log("\nAuthentication: OK");
    console.log(`API base:       ${config.apiBase}`);
    console.log(`API version:    ${config.apiVersion}`);
    console.log(`Username:       @${identity.username ?? "unknown"}`);
    console.log(`User ID:        ${userId}`);
    console.log(`Account type:   ${identity.accountType ?? "unknown"}`);
    console.log(`Media count:    ${identity.mediaCount ?? "unknown"}`);
    console.log("Ingestion:      all Instagram posts (no hashtag filter)");
    console.log(`Sample fetch:   ${sample.length} media object(s)`);

    if (!config.userId) {
      console.log("\nTip: add INSTAGRAM_USER_ID to .env.local to skip /me lookup.");
      console.log(`INSTAGRAM_USER_ID=${userId}`);
    }

    console.log("\nNext steps:");
    console.log("  npm run collection:sync:dry");
    console.log("  npm run collection:sync");
    console.log("  npm run collection:audit");
  } catch (err) {
    console.error(`\nAuthentication failed: ${err.message}`);
    if (err.code) console.error(`Error code: ${err.code}`);
    printSetupGuide();
    process.exit(1);
  }
}

function printSetupGuide() {
  console.log(`
Setup requirements
------------------
Account type:
  Instagram Professional account (Business or Creator)

Meta app:
  Business-type Meta app with "Instagram API with Instagram Login"

Required permission:
  instagram_business_basic

Environment (.env.local):
  INSTAGRAM_ACCESS_TOKEN=...   # Long-lived user access token
  INSTAGRAM_USER_ID=...        # Optional — discovered via /me if omitted
User setup:
  1. Convert @bloodsoakedmedia to a Creator or Business account
  2. Create a Meta Business app at developers.facebook.com
  3. Add product: Instagram API with Instagram Login
  4. Add Instagram account in API Setup and Generate token
  5. Copy token into .env.local as INSTAGRAM_ACCESS_TOKEN
  6. Re-run: npm run collection:instagram:setup
`);
}

main();
