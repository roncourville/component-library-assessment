import { GridSchema } from '@workspace/ui/components/DataGrid';
import {
  UserRenderer,
} from './components/renderers';

import {
  CustomTagEditor,
  UserEditor,
} from './components/editors';

import {
  TextRenderer, TextEditor,
  NumberRenderer, NumberEditor, TagRenderer, LinkRenderer
} from '@workspace/ui/components/DataGrid';

export const gridSchema: GridSchema = {
  uniqueKey: "id",
  defaultEditorMode: "inline",
  columns: [
    {
      key: "id",
      header: "ID",
      width: "w-48",
      fixedWidth: "200px",
      dbField: "id",
      editDisabled: true,
      config: {
        renderer: LinkRenderer,
        editor: TextEditor,
        options: {
          baseUrl: "/plasmids/",
        },
      }
    },
    {
      key: "plasmid",
      header: "Plasmid",
      fixedWidth: "250px",
      dbField: "plasmid_name",
      config: {
        renderer: TagRenderer,
        editor: CustomTagEditor,
        saveEvent: "change",
        options: {
          placeholder: "Select plasmid"
        },
      }
    },
    {
      key: "volume",
      header: "Volume",
      width: "w-32",
      fixedWidth: "120px",
      dbField: "volume_ul",
      config: {
        renderer: NumberRenderer,
        editor: NumberEditor,
        options: {
          unit: "μl",
        },
      }
    },
    {
      key: "length",
      header: "Length",
      width: "w-32",
      fixedWidth: "120px",
      dbField: "length_bp",
      config: {
        renderer: NumberRenderer,
        editor: NumberEditor,
        options: {
          unit: "bp",
        },
      }
    },
    {
      key: "storageLocation",
      header: "Storage Location",
      fixedWidth: "200px",
      dbField: "storage_location",
      config: {
        renderer: TextRenderer,
        editor: TextEditor,
      }
    },
    {
      key: "assignees",
      header: "Assignees",
      fixedWidth: "300px",
      dbField: "assignees",
      config: {
        renderer: UserRenderer,
        editor: UserEditor,
        saveEvent: "change",
        options: {
          multiple: true,
        },
      }
    },
  ],
};