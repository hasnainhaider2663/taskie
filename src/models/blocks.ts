export interface TextBlock {
    text: string;
    audio: string
}

export interface AudioBlock {
    audio: string
}

export interface ImageBlock {
    imgUrl: string
}
export interface VideoBlock {
    videoUrl: string
}
export interface CheckListBlock {
    items: ChechListItem[]
}
export interface ChechListItem {
    text: string;
    checked: boolean;
}
export interface Block {
    block: TextBlock | AudioBlock | ImageBlock | VideoBlock | CheckListBlock;
    type: BlockType;
}
export enum BlockType {
    TextBlock = 'TextBlock', AudioBlock = 'AudioBlock', ImageBlock = 'ImageBlock', VideoBlock = 'VideoBlock', CheckListBlock = 'CheckListBlock'
}