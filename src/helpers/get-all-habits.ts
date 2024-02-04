import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { createColumnHelper } from "@tanstack/react-table";

type Habit = {
  content: string;
  parentId: string;
  uuid: string;
  marker: string;
  dateName: string;
  rawDate: number | undefined;
};

export const getAllHabits = async (): Promise<{ data: any, columns: any } | void> => {
  try {
    let allHabits = await logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
              :where
              [?b :block/marker ?marker]
              [(missing? $ ?b :block/scheduled)]
              [(contains? #{"TODO" "DONE"} ?marker)]
              [?b :block/path-refs [:block/name "habit-tracker"]]
              [?page :block/original-name ?name]]
      `);
    if (!allHabits) return;

    let habitArr: Habit[] = [];
    for (const habit of allHabits) {
      if (habit[0]) {
        const pageDetails = await logseq.Editor.getPage(habit[0].page.id);
        if (!pageDetails) continue;
        const dateName = pageDetails.originalName;
        const rawDate = pageDetails.journalDay; // TODO items on non journal pages will have undefined date
        habitArr.push({
          content: habit[0].content.substring(5, habit[0].content.indexOf("#") - 1),
          parentId: habit[0].page.id,
          uuid: habit[0].uuid,
          marker: habit[0].marker,
          dateName,
          rawDate,
        })
      }
    }

    habitArr = habitArr
      // Filters out TODOs on non journal pages
      .filter((a: Habit) => a.rawDate !== undefined)
      // Sorts by date
      .sort(
        (a: Habit, b: Habit) =>
          (a.rawDate!) - (b.rawDate!)
      )
      // Take only first few items depending on settings
      .slice(-logseq.settings!.noOfItems);


    const uniqueHabits = [...new Set(habitArr.map(h => h.content))]
    const columnHelper = createColumnHelper<Habit>();
    const columns = [
      columnHelper.accessor('dateName', { cell: info => info.getValue() }),
      ...uniqueHabits.map(contentType =>
        columnHelper.accessor(row => row.content === contentType && row.marker === "DONE" ? "✅" : "❌", {
          id: contentType,
          header: () => contentType,
          cell: info => info.getValue(),
        })
      ),
    ]

    return {
      data: habitArr, columns
    };
  } catch (e) {
    console.log(e);
  }
}
