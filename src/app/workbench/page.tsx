import {
  WorkbenchActivityLog,
  WorkbenchBatchesList,
  WorkbenchEditorialList,
  WorkbenchHoldingsList,
  WorkbenchOverview,
  WorkbenchSearchClient,
} from "@/components/workbench";
import { workbenchVoice } from "@/config/workbench-voice";
import { listEditorialBatchSummaries } from "@/lib/editorial-batches";
import {
  getEditorialWork,
  getReadyToFile,
  getRecentActivity,
  getRecentSteamAcquisitions,
  getWorkbenchOverview,
  getWorkbenchSearchIndex,
} from "@/lib/workbench";

export default function WorkbenchPage() {
  const overview = getWorkbenchOverview();
  const recent = getRecentSteamAcquisitions(12);
  const ready = getReadyToFile(16);
  const editorial = getEditorialWork();
  const batches = listEditorialBatchSummaries();
  const activity = getRecentActivity(20);
  const searchIndex = getWorkbenchSearchIndex();

  return (
    <div className="workbench-grid">
      <WorkbenchOverview overview={overview} />
      <WorkbenchSearchClient index={searchIndex} />
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
