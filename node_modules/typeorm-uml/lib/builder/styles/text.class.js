"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextStyles = void 0;
const styles_class_1 = require("../styles.class");
class TextStyles extends styles_class_1.Styles {
    *defineColumns() {
        yield '!define pkey(x) x';
        yield '!define fkey(x) x';
        yield '!define column(x) x';
    }
    *defineColors() {
    }
    *defineSkinParams() {
    }
}
exports.TextStyles = TextStyles;
