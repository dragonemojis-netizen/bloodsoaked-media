import { SectionHeader } from "@/components/content/SectionHeader";
import { VaultHall } from "@/components/vault/VaultHall";
import { publication } from "@/config/publication";
import { getVault } from "@/lib/vault";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.theVault,
  description:
    "Current residents of Dakota's permanent shelf — curator notes on what stays, why it stays, and what might rotate out.",
};

export default function VaultPage() {
  const vault = getVault();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <SectionHeader
        eyebrow={publication.vaultEyebrow}
        title={publication.theVault}
        description="Handwritten shelf notes — why these four live here now, and why the collection never stops changing."
      />
      <VaultHall vault={vault} />
    </div>
  );
}
