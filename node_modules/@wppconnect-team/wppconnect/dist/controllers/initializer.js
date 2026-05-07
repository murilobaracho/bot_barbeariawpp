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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const whatsapp_1 = require("../api/whatsapp");
const create_config_1 = require("../config/create-config");
const logger_1 = require("../utils/logger");
const sleep_1 = require("../utils/sleep");
const browser_1 = require("./browser");
const welcome_1 = require("./welcome");
process.on('unhandledRejection', (reason, promise) => {
    let message = 'Unhandled Rejection: ';
    if (reason instanceof Error) {
        if (reason.stack) {
            message += reason.stack;
        }
        else {
            message += reason.toString();
        }
    }
    else {
        message += JSON.stringify(reason);
    }
    logger_1.defaultLogger.error(message);
});
async function create(sessionOrOption, catchQR, statusFind, onLoadingScreen, catchLinkCode, options, browserSessionToken) {
    let session = 'session';
    let usingDeprecatedCreate = false;
    if (typeof sessionOrOption === 'string' &&
        sessionOrOption.replace(/\s/g, '').length) {
        session = sessionOrOption.replace(/\s/g, '');
        usingDeprecatedCreate =
            typeof sessionOrOption === 'string' ||
                typeof catchQR !== 'undefined' ||
                typeof statusFind !== 'undefined' ||
                typeof options !== 'undefined' ||
                typeof browserSessionToken !== 'undefined';
    }
    else if (typeof sessionOrOption === 'object') {
        options = sessionOrOption;
        if (sessionOrOption.session)
            session = sessionOrOption.session;
        catchQR = sessionOrOption.catchQR || catchQR;
        statusFind = sessionOrOption.statusFind || statusFind;
        onLoadingScreen = sessionOrOption.onLoadingScreen || onLoadingScreen;
        catchLinkCode = sessionOrOption.catchLinkCode || catchLinkCode;
        if (!options.sessionToken) {
            options.sessionToken =
                sessionOrOption.browserSessionToken || browserSessionToken;
        }
    }
    const { onStreamModeChanged, onStreamInfoChanged } = sessionOrOption; // Only available in new create method
    const mergedOptions = { ...create_config_1.defaultOptions, ...options };
    const logger = mergedOptions.logger;
    if (usingDeprecatedCreate) {
        logger.warn('You are using deprecated create method, please use create({options}) See: https://wppconnect.io/wppconnect/pages/Getting%20Started/creating-client.html#passing-options-on-create');
    }
    if (!mergedOptions.disableWelcome) {
        (0, welcome_1.welcomeScreen)();
    }
    if (mergedOptions.updatesLog) {
        await (0, welcome_1.checkUpdates)();
    }
    let browser = mergedOptions.browser;
    let page = mergedOptions.page;
    if (!browser && page) {
        // Get browser from page
        browser = page.browser();
    }
    else if (!browser && !page) {
        if (!mergedOptions.browserWS &&
            !mergedOptions.puppeteerOptions?.userDataDir) {
            mergedOptions.puppeteerOptions.userDataDir = path.resolve(process.cwd(), path.join(mergedOptions.folderNameToken, (0, sanitize_filename_1.default)(session)));
            if (!fs.existsSync(mergedOptions.puppeteerOptions.userDataDir)) {
                fs.mkdirSync(mergedOptions.puppeteerOptions.userDataDir, {
                    recursive: true,
                });
            }
        }
        if (!mergedOptions.browserWS) {
            logger.info(`Using browser folder '${mergedOptions.puppeteerOptions.userDataDir}'`, {
                session,
                type: 'browser',
            });
        }
        // Initialize new browser
        logger.info('Initializing browser...', { session, type: 'browser' });
        browser = await (0, browser_1.initBrowser)(session, mergedOptions, logger).catch((e) => {
            if (mergedOptions.browserWS && mergedOptions.browserWS != '') {
                logger.error(`Error when try to connect ${mergedOptions.browserWS}`, {
                    session,
                    type: 'browser',
                });
            }
            else {
                logger.error(`Error no open browser`, {
                    session,
                    type: 'browser',
                });
            }
            logger.error(e.message, {
                session,
                type: 'browser',
            });
            throw e;
        });
        logger.http('checking headless...', {
            session,
            type: 'browser',
        });
        if (mergedOptions.headless) {
            logger.http('headless option is active, browser hidden', {
                session,
                type: 'browser',
            });
        }
        else {
            logger.http('headless option is disabled, browser visible', {
                session,
                type: 'browser',
            });
        }
    }
    if (!mergedOptions.browserWS && browser['_process']) {
        browser['_process'].once('close', () => {
            browser['isClose'] = true;
        });
    }
    browser.on('targetdestroyed', async (target) => {
        if (typeof browser.isConnected === 'function' &&
            !browser.isConnected()) {
            return;
        }
        const pages = await browser.pages();
        if (!pages.length) {
            browser.close().catch(() => null);
        }
    });
    browser.on('disconnected', () => {
        if (mergedOptions.browserWS) {
            statusFind && statusFind('serverClose', session);
        }
        else {
            statusFind && statusFind('browserClose', session);
        }
    });
    if (!page) {
        // Initialize a page
        page = await (0, browser_1.getOrCreatePage)(browser);
    }
    if (page) {
        await page.setBypassCSP(true);
        const client = new whatsapp_1.Whatsapp(page, session, mergedOptions);
        client.catchQR = catchQR;
        client.statusFind = statusFind;
        client.onLoadingScreen = onLoadingScreen;
        client.catchLinkCode = catchLinkCode;
        if (onStreamModeChanged) {
            client.onStreamModeChanged(onStreamModeChanged);
        }
        if (onStreamInfoChanged) {
            client.onStreamInfoChanged(onStreamInfoChanged);
        }
        await client.start();
        if (mergedOptions.waitForLogin) {
            const isLogged = await client.waitForLogin();
            if (!isLogged) {
                throw new Error('Not Logged');
            }
            let waitLoginPromise = null;
            client.onStateChange(async (state) => {
                const connected = await page.evaluate(() => WPP.conn.isRegistered());
                if (!connected) {
                    await (0, sleep_1.sleep)(2000);
                    if (!waitLoginPromise) {
                        waitLoginPromise = client
                            .waitForLogin()
                            .catch(() => { })
                            .finally(() => {
                            waitLoginPromise = null;
                        });
                    }
                    await waitLoginPromise;
                }
            });
        }
        return client;
    }
}
