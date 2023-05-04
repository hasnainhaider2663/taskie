import { Recording } from "./recording";

export interface User {
    uid: string;
    displayName: string;
    createdAt: Date;
    email: string;
    recordings: Recording[]
}