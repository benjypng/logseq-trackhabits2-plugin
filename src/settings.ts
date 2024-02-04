import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const settings: SettingSchemaDesc[] = [
  {
    key: "pageReference",
    title: "Page Reference",
    description: "Reference used to differentiate habits from other tasks.",
    type: "string",
    default: "habit-tracker"
  },
  {
    key: "noOfItems",
    title: "Maximum number of items to display",
    description: "If your habit tracker overflows, use this setting to control the number of items displayed.",
    type: "number",
    default: 10
  }
]
