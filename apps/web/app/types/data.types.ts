import { Database } from "./database.types";
export type Plasmid = Database["public"]["Tables"]["plasmids"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];