import {
  WorkbenchActivityLog,
  WorkbenchBatchesList,
  WorkbenchEditorialList,
  WorkbenchHoldingsList,
  WorkbenchOverview,
  WorkbenchSearch,
} from "@/components/workbench";
import { workbenchVoice } from "@/config/workbench-voice";
import { listEditorialBatchSummaries } from "@/lib/editorial-batches";
import {
  getEditorialWork,
  getReadyToFile,
  getRecentActivity,
  getRecentSteamAcquisitions,
  getWorkbenchOverview,
  searchWorkbench,
} from "@/lib/workbench";

export const dynamic = "force-dynamic";

interface WorkbenchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function WorkbenchPage({ searchParams }: WorkbenchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const overview = getWorkbenchOverview();
  const recent = getRecentSteamAcquisitions(12);
  const ready = getReadyToFile(16);
  const editorial = getEditorialWork();
  const batches = listEditorialBatchSummaries();
  const activity = getRecentActivity(20);
  const results = query ? searchWorkbench(query) : [];

  return (
    <div className="workbench-grid">
      <WorkbenchOverview overview={overview} />
      <WorkbenchSearch query={query} results={results} />
      <WorkbenchHoldingsList
        id="workbench-recent"
        title={workbenchVoice.recentAcquisitions.title}
        empty={workbenchVoice.recentAcquisitions.empty}
        rows={recent}
      />
      <WorkbenchHoldingsList
        id="workbench-ready"
        title={workbenchVoice.readyToFile.title}
        note={workbenchVoice.readyToFile.note}
        empty={workbenchVoice.readyToFile.empty}
        rows={ready}
      />
      <WorkbenchBatchesList batches={batches} />
      <WorkbenchEditorialList rows={editorial} />
      <WorkbenchActivityLog events={activity} />
    </div>
  );
}
