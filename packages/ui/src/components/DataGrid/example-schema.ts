import { GridSchema } from './types';

/**
 * Example schema that demonstrates using the pluggable component system
 */
export const exampleGridSchema: GridSchema = {
  columns: [
    {
      key: "id",
      header: "ID",
      dbField: "id",
      editDisabled: true,
      config: {
        renderer: "link",
        editor: "text",
        options: { baseUrl: "/items/" }
      }
    },
    {
      key: "name",
      header: "Name",
      dbField: "name",
      config: {
        renderer: "text",
        editor: "text"
      }
    },
    {
      key: "plasmid",
      header: "Plasmid",
      dbField: "plasmid",
      config: {
        renderer: "tag",
        editor: "tag",
        saveEvent: "change",
        options: {
          placeholder: "Select plasmid"
        }
      }
    },
    {
      key: "volume",
      header: "Volume (ul)",
      dbField: "volume",
      config: {
        renderer: "number",
        editor: "number",
        options: { unit: "ul" }
      }
    },
    {
      key: "assignees",
      header: "Assignees",
      dbField: "assignees",
      config: {
        renderer: "user",
        editor: "user",
        saveEvent: "change",
        options: { multiple: true }
      }
    },
    {
      key: "color",
      header: "Color",
      dbField: "color",
      config: {
        renderer: "color-value",
        editor: "color-value"
      }
    },
    {
      key: "edited_by",
      header: "Edited by",
      dbField: "edited_by",
      config: {
        renderer: "custom-avatar"
      }
    }
  ],
  uniqueKey: "id",
  defaultEditorMode: "inline"
};