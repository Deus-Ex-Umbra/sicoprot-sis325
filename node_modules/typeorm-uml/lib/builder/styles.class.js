"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Styles = void 0;
const types_1 = require("../types");
class Styles {
    constructor(skinParams) {
        this.skinParams = skinParams;
        if (!this.skinParams.colors) {
            this.skinParams.colors = new Map();
        }
    }
    static glueStyles(iterator) {
        return Array.from(iterator)
            .map((line) => line + '\n')
            .join('');
    }
    *defineTable() {
        if (this.skinParams.entityNamesOnly) {
            yield '!define table(ename, dbname) entity "<b>ename</b>"';
        }
        else if (this.skinParams.tableNamesOnly) {
            yield '!define table(ename, dbname) entity "<b>dbname</b>"';
        }
        else {
            yield '!define table(ename, dbname) entity "<b>ename</b>\\n<font size=10 color=gray>(dbname)</font>"';
        }
    }
    *defineColumns() {
        yield `!define pkey(x) {field} <b><color:${this.skinParams.colors.get('pkey') || 'DarkGoldenRod'}><&key></color> x</b>`;
        yield `!define fkey(x) {field} <color:${this.skinParams.colors.get('fkey') || '#AAAAAA'}><&key></color> x`;
        yield `!define column(x) {field} <color:${this.skinParams.colors.get('column') || '#EFEFEF'}><&media-record></color> x`;
    }
    *defineSkinParams() {
        yield `skinparam roundcorner ${this.skinParams.roundcorner || 5}`;
        yield `skinparam linetype ${this.skinParams.linetype || 'ortho'}`;
        yield `skinparam shadowing ${this.skinParams.shadowing || 'false'}`;
        yield `skinparam handwritten ${this.skinParams.handwritten || 'false'}`;
    }
    *defineColors() {
        yield 'skinparam class {';
        yield `    BackgroundColor ${this.skinParams.colors.get('class.BackgroundColor') || 'white'}`;
        yield `    ArrowColor ${this.skinParams.colors.get('class.ArrowColor') || 'seagreen'}`;
        yield `    BorderColor ${this.skinParams.colors.get('class.BorderColor') || 'seagreen'}`;
        yield '}';
    }
    *defineDirection() {
        if (this.skinParams.direction === types_1.Direction.LR) {
            yield 'left to right direction';
        }
        else if (this.skinParams.direction === types_1.Direction.TB) {
            yield 'top to bottom direction';
        }
    }
    *hideNotNeededUI() {
        yield 'hide stereotypes';
        yield 'hide methods';
        yield 'hide circle';
    }
    *print() {
        yield Styles.glueStyles(this.defineTable());
        yield Styles.glueStyles(this.defineColumns());
        yield Styles.glueStyles(this.hideNotNeededUI());
        yield Styles.glueStyles(this.defineDirection());
        yield Styles.glueStyles(this.defineSkinParams());
        yield Styles.glueStyles(this.defineColors());
    }
    toString() {
        return Styles.glueStyles(this.print());
    }
}
exports.Styles = Styles;
