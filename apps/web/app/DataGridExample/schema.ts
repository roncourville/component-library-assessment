import { GridSchema } from '@workspace/ui/components/DataGrid/types';

export const gridSchema: GridSchema = {
  uniqueKey: "id",
  columns: [
    {
      key: "id",
      header: "ID",
      width: "w-48",
      fixedWidth: "200px",
      dbField: "id",
      config: {
        type: "link",
        baseUrl: "/plasmids",
      },
    },
    {
      key: "plasmid",
      header: "Plasmid",
      fixedWidth: "250px",
      dbField: "plasmid_name",
      config: {
        type: "tag",
      },
    },
    {
      key: "volume",
      header: "Volume",
      width: "w-32",
      fixedWidth: "120px",
      dbField: "volume_ul",
      config: {
        type: "number",
        unit: "μl",
      },
    },
    {
      key: "length",
      header: "Length",
      width: "w-32",
      fixedWidth: "120px",
      dbField: "length_bp",
      config: {
        type: "number",
        unit: "bp",
      },
    },
    {
      key: "storageLocation",
      header: "Storage Location",
      fixedWidth: "200px",
      dbField: "storage_location",
      config: {
        type: "text",
      },
    },
    {
      key: "assignees",
      header: "Assignees",
      fixedWidth: "300px",
      dbField: "assignees",
      config: {
        type: "user",
        multiple: true,
      },
    },
  ],
};
