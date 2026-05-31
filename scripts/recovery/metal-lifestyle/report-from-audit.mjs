/** Regenerate RECOVERY-AUDIT.md from audit.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const auditPath = path.join(__dirname, "../../../recovery/metal-lifestyle/reports/audit.json");

// Dynamic import of generateMarkdownReport — duplicate minimal report gen
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

// Report generator
function generateMarkdownReport(data) {
  const lines = [];
  lines.push("# Metal Lifestyle Recovery Audit");
  lines.push("");
  lines.push(`**Generated:** ${data.generatedAt}`);
  lines.push(`**Source:** ${data.sourceSite}`);
  lines.push("");
  lines.push("> Preservation audit only. No content imported.");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Total URLs discovered | ${data.summary.totalUrls} |`);
  lines.push(`| Unique article entries (canonical) | ${data.summary.uniqueArticles} |`);
  lines.push(`| Article URL variants (all forms) | ${data.summary.articleUrlVariants} |`);
  lines.push(`| Duplicate URL groups | ${data.summary.duplicateGroups} |`);
  lines.push(`| RSS feed entries | ${data.summary.rssEntries} |`);
  lines.push(`| Pagination pages crawled | ${data.summary.paginationPages} |`);
  lines.push(`| Internal link crawl pages | ${data.summary.internalCrawlPages} |`);
  lines.push("");
  lines.push("## Discovery Methods");
  lines.push("");
  for (const m of data.discoveryMethods) {
    lines.push(`### ${m.name}`);
    lines.push(`- Status: ${m.status}`);
    lines.push(`- URLs found: ${m.urlCount}`);
    if (m.notes) lines.push(`- Notes: ${m.notes}`);
    lines.push("");
  }
  lines.push("## Publication Era Analysis (2015–2019)");
  lines.push("");
  lines.push("| Year | Articles | Flag |");
  lines.push("|------|--------:|------|");
  for (const c of data.yearAnalysis.counts) {
    const flag = data.yearAnalysis.lowYears.some((l) => l.year === c.year)
      ? "⚠ Low"
      : c.count === 0
        ? "⚠ Empty"
        : "";
    lines.push(`| ${c.year} | ${c.count} | ${flag} |`);
  }
  lines.push("");
  lines.push(`Average per year: **${data.yearAnalysis.avg.toFixed(1)}** · Low threshold: **< ${data.yearAnalysis.lowThreshold}**`);
  lines.push("");
  if (data.yearAnalysis.emptyYears?.length) {
    lines.push("**Years with zero discovered articles:** " + data.yearAnalysis.emptyYears.map((y) => y.year).join(", "));
    lines.push("");
  }
  if (data.yearAnalysis.lowYears?.length) {
    lines.push("**Years with unusually low counts:**");
    for (const y of data.yearAnalysis.lowYears) {
      lines.push(`- ${y.year}: ${y.count} articles`);
    }
    lines.push("");
  }
  if (data.yearAnalysis.unknownCount) {
    lines.push(`**Articles without resolved year:** ${data.yearAnalysis.unknownCount}`);
    lines.push("");
  }
  lines.push("### Monthly distribution (2015–2019)");
  lines.push("");
  const months = Object.entries(data.yearAnalysis.byMonth)
    .filter(([k]) => /^(2015|2016|2017|2018|2019)-/.test(k))
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [month, count] of months) {
    lines.push(`- ${month}: ${count}`);
  }
  lines.push("");
  lines.push("## Duplicate URLs");
  lines.push("");
  lines.push(`${data.duplicates.length} articles with multiple URL forms.`);
  lines.push("");
  lines.push("## Orphaned & Gap Signals");
  lines.push("");
  lines.push(`- **Legacy URL only (no pretty permalink):** ${data.orphans.inRssNotPretty.length}`);
  lines.push(`- **In RSS but not pagination index:** ${data.orphans.rssNotPagination.length}`);
  lines.push("");
  if (data.priorComparison) {
    lines.push("## Comparison to Prior Crawl");
    lines.push("");
    lines.push(`- Prior crawl: ${data.priorComparison.priorTotal} URLs`);
    lines.push(`- New in audit: ${data.priorComparison.missingFromPriorCrawl.length}`);
    lines.push(`- In prior only: ${data.priorComparison.inPriorNotInAudit.length}`);
    lines.push("");
  }
  lines.push("## Recommended Next Steps");
  lines.push("");
  lines.push("1. Reconcile RSS vs pagination gaps before import.");
  lines.push("2. Review low-count years and legacy-only URLs.");
  lines.push("3. Manual authorship pass on Dakota-attributed work.");
  lines.push("4. **Do not import** until gaps are addressed.");
  lines.push("");
  return lines.join("\n");
}

const out = path.join(__dirname, "../../../recovery/metal-lifestyle/reports/RECOVERY-AUDIT.md");
fs.writeFileSync(out, generateMarkdownReport(audit), "utf8");
console.log("Wrote", out);
