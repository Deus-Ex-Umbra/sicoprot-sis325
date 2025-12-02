"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonochromeStyles = void 0;
const styles_class_1 = require("../styles.class");
class MonochromeStyles extends styles_class_1.Styles {
    *defineColors() {
        yield 'skinparam monochrome true';
    }
}
exports.MonochromeStyles = MonochromeStyles;
