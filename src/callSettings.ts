import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export function callSettings() {
  const settings: SettingSchemaDesc[] = [
    {
      key: "noOfItems",
      title: "Number of items to display",
      description:
        "If your habit tracker overflows, use this setting to control the number of items displayed.",
      type: "number",
      default: 10,
    },
  ];
  logseq.useSettingsSchema(settings);
}

export function callStyle() {
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
}
