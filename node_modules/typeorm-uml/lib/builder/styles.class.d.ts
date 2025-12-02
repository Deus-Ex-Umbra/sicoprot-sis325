import { SkinParams } from '../types';
export declare class Styles {
    protected readonly skinParams: SkinParams;
    protected static glueStyles(iterator: IterableIterator<string>): string;
    constructor(skinParams: SkinParams);
    protected defineTable(): IterableIterator<string>;
    protected defineColumns(): IterableIterator<string>;
    protected defineSkinParams(): IterableIterator<string>;
    protected defineColors(): IterableIterator<string>;
    protected defineDirection(): IterableIterator<string>;
    protected hideNotNeededUI(): IterableIterator<string>;
    print(): IterableIterator<string>;
    toString(): string;
}
