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
      },
      sortable: true,
      filterable: true
    },
    {
      key: "name",
      header: "Name",
      dbField: "name",
      config: {
        renderer: "text",
        editor: "text"
      },
      sortable: true,
      filterable: true
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
      },
      sortable: true
    },
    {
      key: "volume",
      header: "Volume (ul)",
      dbField: "volume",
      config: {
        renderer: "number",
        editor: "number",
        options: { unit: "ul" }
      },
      sortable: true
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
      },
      sortable: false
    }
  ],
  uniqueKey: "id",
  defaultEditorMode: "inline"
};