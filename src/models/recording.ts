export interface Recording {
    id: string;
    createdAt: string;
    status: 'done' | 'loading' | 'error'
    text: string
    title: string


}