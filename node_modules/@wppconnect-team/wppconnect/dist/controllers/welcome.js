"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeScreen = welcomeScreen;
exports.checkUpdates = checkUpdates;
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
const boxen_1 = __importDefault(require("boxen"));
const chalk_1 = __importDefault(require("chalk"));
const latest_version_1 = __importDefault(require("latest-version"));
const logger_1 = require("../utils/logger");
const semver_1 = require("../utils/semver");
const { version } = require('../../package.json');
// Global
let welcomeShown = false;
let updatesChecked = false;
function welcomeScreen() {
    if (welcomeShown) {
        return;
    }
    welcomeShown = true;
    logger_1.defaultLogger.info(`
   _       ______  ____  ______                            __ 
  | |     / / __ \\/ __ \\/ ____/___  ____  ____  ___  _____/ /_
  | | /| / / /_/ / /_/ / /   / __ \\/ __ \\/ __ \\/ _ \\/ ___/ __/
  | |/ |/ / ____/ ____/ /___/ /_/ / / / / / / /  __/ /__/ /_  
  |__/|__/_/   /_/    \\____/\\____/_/ /_/_/ /_/\\___/\\___/\\__/`);
}
async function checkUpdates() {
    // Check for updates if needed
    if (!updatesChecked) {
        updatesChecked = true;
        await checkWPPConnectVersion();
    }
}
/**
 * Checks for a new version of WPPConnect and logs the result
 */
async function checkWPPConnectVersion() {
    logger_1.defaultLogger.info('Checking for updates');
    await (0, latest_version_1.default)('@wppconnect-team/wppconnect')
        .then((latest) => {
        if ((0, semver_1.upToDate)(version, latest)) {
            logger_1.defaultLogger.info("You're up to date");
        }
        else {
            logger_1.defaultLogger.info('There is a new version available');
            logUpdateAvailable(version, latest);
        }
    })
        .catch(() => {
        logger_1.defaultLogger.warn('Failed to check for updates');
    });
}
/**
 * Logs a boxen of instructions to update
 * @param current
 * @param latest
 */
function logUpdateAvailable(current, latest) {
    // prettier-ignore
    const newVersionLog = `There is a new version of ${chalk_1.default.bold(`Wppconnect`)} ${chalk_1.default.gray(current)} ➜  ${chalk_1.default.bold.green(latest)}\n` +
        `Update your package by running:\n\n` +
        `${chalk_1.default.bold('\>')} ${chalk_1.default.blueBright('npm update @wppconnect-team/wppconnect')}`;
    logger_1.defaultLogger.info((0, boxen_1.default)(newVersionLog, { padding: 1 }));
    logger_1.defaultLogger.info(`For more info visit: ${chalk_1.default.underline('https://github.com/wppconnect-team/wppconnect/blob/master/README.md#update-checking')}\n`);
}
