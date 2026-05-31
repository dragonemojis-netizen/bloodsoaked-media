import fs from "fs";
import path from "path";
import type { Vault, VaultEntry } from "@/types/vault";

const VAULT_PATH = path.join(process.cwd(), "content", "vault.json");

export function getVault(): Vault {
  if (!fs.existsSync(VAULT_PATH)) {
    return { introduction: "", entries: [] };
  }
  return JSON.parse(fs.readFileSync(VAULT_PATH, "utf8")) as Vault;
}

export function getAllVaultEntries(): VaultEntry[] {
  return getVault().entries;
}
