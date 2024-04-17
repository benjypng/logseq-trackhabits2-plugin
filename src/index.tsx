import "@logseq/libs";
import ReactDOMServer from "react-dom/server";
import { HabitsTable } from "./components/HabitsTable";
import { getAllHabits } from "./helpers/get-all-habits";
import { settings } from "./settings";
import "./tailwind.css";

const main = async () => {
  console.log("logseq-trackhabits2-plugin loaded");

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("Track habits", async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :trackhabits_${e.uuid}}}`,
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    if (!type) return;
    const trackHabitsId = `trackhabits_${payload?.uuid}_${slot}`;
    if (!type.startsWith(":trackhabits_")) return;

    const tableData = await getAllHabits();
    if (!tableData) return;

    // Use React to render board
    let html = ReactDOMServer.renderToStaticMarkup(
      <HabitsTable data={tableData.data} columns={tableData.columns} />,
    );

    // Set div for renderer to use
    const createBoard = (board: string) => {
      return `<div id="${trackHabitsId}" class="trackHabits" data-trackhabits-id="${trackHabitsId}" data-slot-id="${slot}">${board}</div>`;
    };

    logseq.provideUI({
      key: `${trackHabitsId}`,
      slot,
      reset: true,
      template: createBoard(html),
    });
  });
};

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
