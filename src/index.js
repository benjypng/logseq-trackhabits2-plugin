import '@logseq/libs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';

const main = async () => {
  console.log('Track habits plugin loaded');

  // Generate unique identifier
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');

  // Insert renderer upon slash command
  logseq.Editor.registerSlashCommand('track habits', async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :trackhabits_${uniqueIdentifier()}}}`
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    const id = type.split('_')[1]?.trim();
    const trackHabitsId = `trackhabits_${id}`;

    const getAllHabits = async () => {
      const allHabits = await logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
              :where
              [?b :block/marker ?marker]
              [(missing? $ ?b :block/scheduled)]
              [(contains? #{"TODO" "DONE"} ?marker)]
              [?b :block/path-refs [:block/name "habit-tracker"]]
              [?page :block/original-name ?name]]
      `);

      const payload = allHabits.map((a) => ({
        content: a[0].content.substring(5, a[0].content.indexOf('#') - 1),
        parentId: a[0].page.id,
        journal: a[0]['journal?'],
        uuid: a[0].uuid,
        marker: a[0].marker,
      }));

      for (let i = 0; i < payload.length; i++) {
        const pageDetails = await logseq.Editor.getPage(payload[i].parentId);
        const dateName = pageDetails.originalName;
        const rawDate = pageDetails.journalDay;

        payload[i]['dateName'] = dateName;
        payload[i]['rawDate'] = rawDate;
      }

      payload.sort((a, b) => parseFloat(a.rawDate) - parseFloat(b.rawDate));

      return payload;
    };

    logseq.provideStyle(`
    .tableHeader {
      border-bottom: solid 3px red;
      background: aliceblue;
      color: black !important;
      font-weight: bold;
    }

    .tableRow {
      padding: 10px;
      border: solid 1px gray;
      background: papayawhip;
      color: black;
    }
    `);

    // Use React to render board
    const board = ReactDOMServer.renderToStaticMarkup(
      <App habitsArr={await getAllHabits()} />
    );
    const newBoard = board.replace(/TODO/g, '').replace(/DONE/g, '');

    // Set div for renderer to use
    const cmBoard = (board) => {
      return `<div>${board}</div>`;
    };

    if (!type.startsWith(':trackhabits_')) return;
    logseq.provideUI({
      key: `${trackHabitsId}`,
      slot,
      reset: true,
      template: cmBoard(newBoard),
    });
  });
};

logseq.ready(main).catch(console.error);
