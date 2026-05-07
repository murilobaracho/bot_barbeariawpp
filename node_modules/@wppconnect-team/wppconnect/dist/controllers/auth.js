"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectingToPhone = exports.isInsideChat = exports.needsToScan = exports.isAuthenticated = exports.getInterfaceStatus = void 0;
exports.asciiQr = asciiQr;
const qrcode = __importStar(require("qrcode-terminal"));
const getInterfaceStatus = async (waPage) => {
    return await waPage
        .waitForFunction(() => {
        const elLoginWrapper = document.querySelector('body > div > div > .landing-wrapper');
        const elQRCodeCanvas = document.querySelector('canvas');
        if (elLoginWrapper && elQRCodeCanvas) {
            return 'UNPAIRED';
        }
        const streamStatus = WPP?.whatsapp?.Stream?.displayInfo;
        if (['PAIRING', 'RESUMING', 'SYNCING'].includes(streamStatus)) {
            return 'PAIRING';
        }
        const elChat = document.querySelector('.app,.two');
        if (elChat && elChat.attributes && elChat.tabIndex) {
            return 'CONNECTED';
        }
        return false;
    }, {
        timeout: 0,
        polling: 100,
    })
        .then(async (element) => {
        return (await element.evaluate((a) => a));
    })
        .catch(() => null);
};
exports.getInterfaceStatus = getInterfaceStatus;
/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
const isAuthenticated = (waPage) => {
    return waPage.evaluate(() => WPP.conn.isRegistered());
};
exports.isAuthenticated = isAuthenticated;
const needsToScan = async (waPage) => {
    const connected = await (0, exports.isAuthenticated)(waPage);
    return !connected;
};
exports.needsToScan = needsToScan;
const isInsideChat = async (waPage) => {
    return await waPage.evaluate(() => WPP.conn.isMainReady());
};
exports.isInsideChat = isInsideChat;
const isConnectingToPhone = async (waPage) => {
    return await waPage.evaluate(() => WPP.conn.isMainLoaded() && !WPP.conn.isMainReady());
};
exports.isConnectingToPhone = isConnectingToPhone;
async function asciiQr(code) {
    return new Promise((resolve) => {
        qrcode.generate(code, { small: true }, (qrcode) => {
            resolve(qrcode);
        });
    });
}
