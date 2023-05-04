import { Entry } from "./recording";

export interface User {
    uid: string;
    displayName: string;
    createdAt: Date;
    email: string;
    entries: Entry[]
}