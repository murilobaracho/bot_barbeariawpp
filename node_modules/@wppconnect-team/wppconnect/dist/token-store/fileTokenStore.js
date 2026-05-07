"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTokenStore = exports.defaultFileTokenStoreOptions = void 0;
/*
 * This file is part of WPPConnect.
 *
 * WPPConnect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WPPConnect is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with WPPConnect.  If not, see <https://www.gnu.org/licenses/>.
 */
/// <reference types="node" />
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const logger_1 = require("../utils/logger");
const isValidSessionToken_1 = require("./isValidSessionToken");
exports.defaultFileTokenStoreOptions = {
    decodeFunction: JSON.parse,
    encodeFunction: JSON.stringify,
    encoding: 'utf8',
    fileExtension: '.data.json',
    path: './tokens',
};
/**
 * Token Store using file
 *
 * ```typescript
 * // Example of typescript with FileTokenStore
 * import * as wppconnect from '@wppconnect-team/wppconnect';
 *
 * const myTokenStore = new wppconnect.tokenStore.FileTokenStore({
 * // decodeFunction: JSON.parse,
 * // encodeFunction: JSON.stringify,
 * // encoding: 'utf8',
 * // fileExtension: '.my.ext',
 * // path: './a_custom_path',
 * });
 *
 * wppconnect.create({
 *   session: 'mySession',
 *   tokenStore: myTokenStore,
 * });
 *
 * wppconnect.create({
 *   session: 'otherSession',
 *   tokenStore: myTokenStore,
 * });
 * ```
 */
class FileTokenStore {
    options;
    constructor(options = {}) {
        this.options = Object.assign({}, exports.defaultFileTokenStoreOptions, options);
    }
    /**
     * Resolve the path of file
     * @param sessionName Name of session
     * @returns Full path of token file
     */
    resolverPath(sessionName) {
        const filename = (0, sanitize_filename_1.default)(sessionName) + this.options.fileExtension;
        return path.resolve(process.cwd(), path.join(this.options.path, filename));
    }
    async getToken(sessionName) {
        const filePath = this.resolverPath(sessionName);
        if (!fs.existsSync(filePath)) {
            return undefined;
        }
        const text = await fs.promises
            .readFile(filePath, {
            encoding: this.options.encoding,
        })
            .catch(() => null);
        if (!text) {
            return undefined;
        }
        try {
            return this.options.decodeFunction(text);
        }
        catch (error) {
            logger_1.defaultLogger.debug(error);
            return undefined;
        }
    }
    async setToken(sessionName, tokenData) {
        if (!tokenData || !(0, isValidSessionToken_1.isValidSessionToken)(tokenData)) {
            return false;
        }
        if (!fs.existsSync(this.options.path)) {
            await fs.promises.mkdir(this.options.path, { recursive: true });
        }
        const filePath = this.resolverPath(sessionName);
        try {
            const text = this.options.encodeFunction(tokenData);
            await fs.promises.writeFile(filePath, text, {
                encoding: this.options.encoding,
            });
            return true;
        }
        catch (error) {
            logger_1.defaultLogger.debug(error);
            return false;
        }
    }
    async removeToken(sessionName) {
        const filePath = this.resolverPath(sessionName);
        if (!fs.existsSync(filePath)) {
            return false;
        }
        try {
            await fs.promises.unlink(filePath);
            return true;
        }
        catch (error) {
            logger_1.defaultLogger.debug(error);
            return false;
        }
    }
    async listTokens() {
        if (!fs.existsSync(this.options.path)) {
            return [];
        }
        try {
            let files = await fs.promises.readdir(this.options.path);
            // Only sessions with same fileExtension
            files = files.filter((file) => file.endsWith(this.options.fileExtension));
            // Return name only
            files = files.map((file) => path.basename(file, this.options.fileExtension));
            return files;
        }
        catch (error) {
            logger_1.defaultLogger.debug(error);
            return [];
        }
    }
}
exports.FileTokenStore = FileTokenStore;
