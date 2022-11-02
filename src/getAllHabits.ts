import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

export async function getAllHabits() {
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
      let payload = allHabits.map((a: any) => ({
        content: a[0].content.substring(5, a[0].content.indexOf("#") - 1),
        parentId: a[0].page.id,
        journal: a[0]["journal?"],
        uuid: a[0].uuid,
        marker: a[0].marker,
      }));

      for (let i = 0; i < payload.length; i++) {
        const pageDetails = await logseq.Editor.getPage(payload[i].parentId);
        const dateName = pageDetails!.originalName;
        const rawDate = pageDetails!.journalDay;

        payload[i]["dateName"] = dateName;
        payload[i]["rawDate"] = rawDate;
      }

      payload = payload
        .sort(
          (a: BlockEntity, b: BlockEntity) =>
            parseFloat(a.rawDate) - parseFloat(b.rawDate)
        )
        .reverse()
        .slice(0, logseq.settings!.noOfItems);

      return payload;
    }
  } catch (e) {
    console.log(e);
  }
}
