/**
 * Validates Steam API configuration and prints setup diagnostics.
 * Run: npm run steam:setup
 */
import "./lib/load-env.mjs";
import { loadSteamConfig } from "./lib/steam/steam-config.mjs";
import {
  fetchOwnedGames,
  fetchPlayerSummary,
  resolveSteamId,
} from "./lib/steam/steam-api.mjs";

async function main() {
  console.log("Steam Acquisition Setup");
  console.log("=======================");

  let config;
  try {
    config = loadSteamConfig();
  } catch (err) {
    console.error(`\n${err.message}`);
    printSetupGuide();
    process.exit(1);
  }

  try {
    const steamId = await resolveSteamId(config);
    const summary = await fetchPlayerSummary(config, steamId);
    const owned = await fetchOwnedGames(config, steamId);

    console.log("\nAuthentication: OK");
    console.log(`API base:       ${config.apiBase}`);
    console.log(`Store base:     ${config.storeBase}`);
    console.log(`SteamID:        ${steamId}`);
    console.log(`Persona:        ${summary?.personaName ?? "unknown"}`);
    console.log(
      `Profile:        ${summary?.isPublic ? "public" : "NOT public — game details may be hidden"}`,
    );
    console.log(`Owned titles:   ${owned.length}`);
    console.log(`Store locale:   ${config.country} / ${config.language}`);

    if (!config.steamId && config.vanity) {
      console.log("\nTip: add STEAM_ID to .env.local to skip vanity resolution.");
      console.log(`STEAM_ID=${steamId}`);
    }

    console.log("\nNext steps:");
    console.log("  npm run steam:sync:dry");
    console.log("  npm run steam:sync");
  } catch (err) {
    console.error(`\nSetup failed: ${err.message}`);
    printSetupGuide();
    process.exit(1);
  }
}

function printSetupGuide() {
  console.log(`
Setup requirements
------------------
Steam Web API key:
  Register at https://steamcommunity.com/dev/apikey

Profile privacy:
  Profile and "Game details" must be set to Public so owned games are readable.

Environment (.env.local):
  STEAM_API_KEY=...            # Steam Web API key
  STEAM_ID=...                 # 64-bit SteamID (preferred), or:
  STEAM_VANITY=...             # custom URL name from steamcommunity.com/id/<name>

Optional tuning (.env.local):
  STEAM_STORE_COUNTRY=us
  STEAM_STORE_LANGUAGE=english
  STEAM_METADATA_MAX_AGE_DAYS=30
  STEAM_DETAILS_PER_RUN=80
  STEAM_INCLUDE_FREE_GAMES=true

Then re-run:
  npm run steam:setup
`);
}

main();
