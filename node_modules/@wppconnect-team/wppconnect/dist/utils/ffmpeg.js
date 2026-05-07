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
exports.getFfmpegPath = getFfmpegPath;
exports.convertToMP4GIF = convertToMP4GIF;
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
const execa_1 = __importDefault(require("execa"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rimraf_1 = __importDefault(require("rimraf"));
const tmp = __importStar(require("tmp"));
const lookpath_1 = require("lookpath");
const tmpDir = tmp.dirSync({});
let i = 0;
process.on('exit', () => {
    // Remove only on exit signal
    try {
        // Use rimraf because it is synchronous
        rimraf_1.default.sync(tmpDir.name);
    }
    catch (error) { }
});
async function getFfmpegPath() {
    let ffmpegPath = process.env['FFMPEG_PATH'];
    if (ffmpegPath) {
        const isExecutable = await fs.promises
            .access(ffmpegPath, fs.constants.X_OK)
            .then(() => true)
            .catch(() => false);
        if (isExecutable) {
            return ffmpegPath;
        }
    }
    ffmpegPath = await (0, lookpath_1.lookpath)('ffmpeg', {
        include: [
            'C:\\FFmpeg\\bin',
            'C:\\FFmpeg\\FFmpeg\\bin',
            'C:\\Program Files\\ffmpeg\\bin',
            'C:\\Program Files (x86)\\ffmpeg\\bin',
        ],
    });
    if (!ffmpegPath) {
        try {
            ffmpegPath = require('ffmpeg-static');
        }
        catch (error) { }
    }
    if (!ffmpegPath) {
        throw new Error('Error: FFMPEG not found. Please install ffmpeg or define the env FFMPEG_PATH or install ffmpeg-static');
    }
    return ffmpegPath;
}
/**
 * Convert a file to a compatible MP4-GIF for WhatsApp
 * @param inputBase64 Gif in base64 format
 * @returns base64 of a MP4-GIF for WhatsApp
 */
async function convertToMP4GIF(inputBase64) {
    const inputPath = path.join(tmpDir.name, `${i++}`);
    const outputPath = path.join(tmpDir.name, `${i++}.mp4`);
    if (inputBase64.includes(',')) {
        inputBase64 = inputBase64.split(',')[1];
    }
    fs.writeFileSync(inputPath, Buffer.from(inputBase64, 'base64'));
    /**
     * fluent-ffmpeg is a good alternative,
     * but to work with MP4 you must use fisical file or ffmpeg will not work
     * Because of that, I made the choice to use temporary file
     */
    const ffmpegPath = await getFfmpegPath();
    try {
        const out = await (0, execa_1.default)(ffmpegPath, [
            '-i',
            inputPath,
            '-movflags',
            'faststart',
            '-pix_fmt',
            'yuv420p',
            '-vf',
            'scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-f',
            'mp4',
            outputPath,
        ]);
        if (out.exitCode === 0) {
            const outputBase64 = fs.readFileSync(outputPath);
            return 'data:video/mp4;base64,' + outputBase64.toString('base64');
        }
        throw out.stderr;
    }
    finally {
        (0, rimraf_1.default)(inputPath, () => null);
        (0, rimraf_1.default)(outputPath, () => null);
    }
    return '';
}
