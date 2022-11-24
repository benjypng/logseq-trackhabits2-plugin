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
				.trackHabits thead tr th:first-child, .trackHabits tbody tr td:first-child {
            width: 200px !important;
            min-width: 200px !important;
            max-width: 200px !important;
        }
        .trackHabits .tableHeader {
            border: 1px solid;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis;
            width: 50px !important;
        }
				.trackHabits .tableRow {
					  border: 1px solid;
				}
        .trackHabits .tableHeader .toolTipText {
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
        .trackHabits .tableHeader:hover .toolTipText {
            margin-top:-15px;
            visibility: visible;
            cursor: pointer;
        }
        .trackHabits {
            table-layout: fixed !important;
            width: 50px !important;
        }
	`);
}
