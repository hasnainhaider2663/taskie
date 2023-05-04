import { Entry } from "./entry";

export interface User {
    uid: string;
    displayName: string;
    createdAt: Date;
    email: string;
    entries: Entry[]
}