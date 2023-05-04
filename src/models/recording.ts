export interface Entry {
    id: string;
    createdAt: string;
    status: 'done' | 'loading' | 'error'
    blocks: [];
    title: string


}