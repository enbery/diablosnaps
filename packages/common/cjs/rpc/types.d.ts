import { Game } from '../game';
export interface BackpackItemDocument {
    id: string;
    value: Game.Item;
    text?: string;
    creationDate: Date;
    indexedDate?: Date;
    tags: string[];
}
export interface BackpackTag {
    id: string;
    name: string;
}
//# sourceMappingURL=types.d.ts.map