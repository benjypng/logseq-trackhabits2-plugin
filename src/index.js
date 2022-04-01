import "@logseq/libs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App";

const main = async () => {
  console.log("Track habits plugin loaded");

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "");

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand("track habits", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :trackhabits_${uniqueIdentifier()}}}`
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    const id = type.split("_")[1]?.trim();
    const trackHabitsId = `trackhabits_${id}`;

    if (!type.startsWith(":trackhabits_")) return;

    const getAllHabits = async () => {
      try {
        const allHabits = await logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
              :where
              [?b :block/marker ?marker]
              [(missing? $ ?b :block/scheduled)]
              [(contains? #{"TODO" "DONE"} ?marker)]
              [?b :block/path-refs [:block/name "habit-tracker"]]
              [?page :block/original-name ?name]]
      `);

        if (allHabits) {
          const payload = allHabits.map((a) => ({
            content: a[0].content.substring(5, a[0].content.indexOf("#") - 1),
            parentId: a[0].page.id,
            journal: a[0]["journal?"],
            uuid: a[0].uuid,
            marker: a[0].marker,
          }));

          for (let i = 0; i < payload.length; i++) {
            const pageDetails = await logseq.Editor.getPage(
              payload[i].parentId
            );
            const dateName = pageDetails.originalName;
            const rawDate = pageDetails.journalDay;

            payload[i]["dateName"] = dateName;
            payload[i]["rawDate"] = rawDate;
          }

          payload.sort((a, b) => parseFloat(a.rawDate) - parseFloat(b.rawDate));

          return payload;
        }
      } catch (e) {
        console.log(e);
      }
    };

    logseq.provideStyle(`
        table.trackHabits .tableHeader, .tableRow {
            border: solid 1px black;
            color: black !important;
            background-color: white !important;
        }
        table.trackHabits .tableHeader {
            border-bottom: 1px dotted block;
        }
        table.trackHabits .tableHeader .toolTipText {
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            padding: 5px 0;
            border-radius: 6px;
            position: absolute;
            z-index: 1;
        }
        table.trackHabits .tableHeader:hover .toolTipText {
            margin-top:-15px;
            visibility: visible;
            cursor: pointer;
        }
        table.trackHabits {
            table-layout: fixed !important;
            width: 50px !important;
        }
        table.trackHabits th {
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis;
            width: 50px !important;
        }
        table.trackHabits thead tr th:first-child, tbody tr td:first-child {
            width: 200px !important;
            min-width: 200px !important;
            max-width: 200px !important;
        }
    `);

    // Use React to render board
    const board = ReactDOMServer.renderToStaticMarkup(
      <App habitsArr={await getAllHabits()} />
    );
    const newBoard = board.replace(/TODO/g, "").replace(/DONE/g, "");

    // Set div for renderer to use
    const cmBoard = (board) => {
      return `<div id="${trackHabitsId}" data-trackhabits-id="${trackHabitsId}" data-slot-id="${slot}">${board}</div>`;
    };

    logseq.provideUI({
      key: `${trackHabitsId}`,
      slot,
      reset: true,
      template: cmBoard(newBoard),
    });
  });
};

logseq.ready(main).catch(console.error);
