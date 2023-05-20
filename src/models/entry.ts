export interface Entry {
  id: string;
  createdAt: string;
  status: "done" | "loading" | "error";
  title: string;
  text: string;
  selection?: { start:number,end:number };
}
