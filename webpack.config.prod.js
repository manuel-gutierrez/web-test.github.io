"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_config_1 = __importDefault(require("./webpack.config"));
webpack_config_1.default.devtool = false;
exports.default = webpack_config_1.default;
