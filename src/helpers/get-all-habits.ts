import { createColumnHelper } from "@tanstack/react-table";

type Habit = {
  content: string;
  parentId: string;
  uuid: string;
  marker: string;
  dateName: string;
  rawDate: number | undefined;
};

export const getAllHabits = async (): Promise<{
  data: any;
  columns: any;
} | void> => {
  try {
    let allHabits = await logseq.DB.q(
      `(and (task TODO DOING NOW LATER DONE) [[${logseq.settings?.pageReference}]])`,
    );
    if (!allHabits) throw new Error("No habits found");

    let habitArr: Habit[] = [];
    for (const habit of allHabits) {
      const pageDetails = await logseq.Editor.getPage(habit.page.id);
      if (!pageDetails) continue;
      const dateName = pageDetails.originalName;
      const rawDate = pageDetails.journalDay;
      habitArr.push({
        content: habit.content.substring(5, habit.content.indexOf("#") - 1),
        parentId: habit.page.id,
        uuid: habit.uuid,
        marker: habit.marker,
        dateName,
        rawDate,
      });
    }

    habitArr = habitArr
      // Filters out TODOs on non journal pages
      .filter((a: Habit) => a.rawDate !== undefined)
      // Sorts by date
      .sort((a: Habit, b: Habit) => a.rawDate! - b.rawDate!)
      // Take only first few items depending on settings
      .slice(-logseq.settings!.noOfItems!);

    const dataArray: { dateName: string; [key: string]: string }[] = [];
    const groupedByDateName: { [dateName: string]: { [key: string]: string } } =
      {};

    habitArr.forEach((obj) => {
      if (!groupedByDateName[obj.dateName]) {
        groupedByDateName[obj.dateName] = {};
      }
      groupedByDateName[obj.dateName]![obj.content] = obj.marker;
    });

    for (const dateName in groupedByDateName) {
      dataArray.push({ dateName, ...groupedByDateName[dateName] });
    }

    const uniqueHabits = [...new Set(habitArr.map((h) => h.content))];

    const columnHelper = createColumnHelper<Habit>();
    const columns = [
      columnHelper.accessor("dateName", {
        cell: (info) => info.getValue(),
        header: () => "Date",
      }),
      ...uniqueHabits.map((contentType) =>
        columnHelper.accessor(
          (row) => {
            //@ts-ignore
            return row[contentType] === "DONE" ? "✅" : "❌";
          },
          {
            id: contentType,
            header: () => contentType,
            cell: (info) => info.getValue(),
          },
        ),
      ),
    ];

    return {
      data: dataArray,
      columns,
    };
  } catch (e) {
    console.log(e);
  }
};
