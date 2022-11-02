import "@logseq/libs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App";
import { callStyle, callSettings } from "./callSettings";
import { getAllHabits } from "./getAllHabits";

const main = async () => {
  console.log("logseq-trackhabits2-plugin loaded");

  // Call plugin settings
  callSettings();

  // Call plugin css styles
  callStyle();

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
    const allHabitsArr: any[] = await getAllHabits();

    // Use React to render board
    const board = ReactDOMServer.renderToStaticMarkup(
      <App habitsArr={allHabitsArr} />
    );
    const newBoard = board.replace(/TODO/g, "").replace(/DONE/g, "");

    // Set div for renderer to use
    const cmBoard = (board: any) => {
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
