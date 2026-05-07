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
exports.unregisterServiceWorker = unregisterServiceWorker;
exports.setWhatsappVersion = setWhatsappVersion;
exports.initWhatsapp = initWhatsapp;
exports.onLoadingScreen = onLoadingScreen;
exports.injectApi = injectApi;
exports.initBrowser = initBrowser;
exports.getOrCreatePage = getOrCreatePage;
const ChromeLauncher = __importStar(require("chrome-launcher"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const rimraf = __importStar(require("rimraf"));
const waVersion = __importStar(require("@wppconnect/wa-version"));
const axios_1 = __importDefault(require("axios"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_config_1 = require("../config/puppeteer.config");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const WAuserAgente_1 = require("../config/WAuserAgente");
const websocket_1 = require("./websocket");
async function unregisterServiceWorker(page) {
    await page.evaluateOnNewDocument(() => {
        // Remove existent service worker
        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => {
            for (let registration of registrations) {
                registration.unregister();
            }
        })
            .catch((err) => null);
        // Disable service worker registration
        // @ts-ignore
        navigator.serviceWorker.register = new Promise(() => { });
        setInterval(() => {
            window.onerror = console.error;
            window.onunhandledrejection = console.error;
        }, 500);
    });
}
/**
 * Força o carregamento de uma versão específica do WhatsApp WEB
 * @param page Página a ser injetada
 * @param version Versão ou expressão semver
 */
async function setWhatsappVersion(page, version, log) {
    let body = null;
    try {
        body = waVersion.getPageContent(version);
    }
    catch (error) { }
    if (!body) {
        log?.('error', `Version not available for ${version}, using latest as fallback`);
        return;
    }
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.url().startsWith('https://web.whatsapp.com/check-update')) {
            req.abort();
            return;
        }
        if (req.url() !== 'https://web.whatsapp.com/') {
            req.continue();
            return;
        }
        req.respond({
            status: 200,
            contentType: 'text/html',
            body: body,
        });
    });
}
async function initWhatsapp(page, token, clear = true, version, proxy, log) {
    if (proxy) {
        await page.authenticate({
            username: proxy.username,
            password: proxy.password,
        });
    }
    await page.setUserAgent(WAuserAgente_1.useragentOverride);
    await unregisterServiceWorker(page);
    if (version) {
        log?.('verbose', `Setting WhatsApp WEB version to ${version}`);
        await setWhatsappVersion(page, version, log);
    }
    log?.('verbose', `Loading WhatsApp WEB`);
    await page.goto(puppeteer_config_1.puppeteerConfig.whatsappUrl, {
        waitUntil: 'load',
        timeout: 0,
        referer: 'https://whatsapp.com/',
    });
    log?.('verbose', 'WhatsApp WEB loaded');
    /*setTimeout(() => {
      log?.('verbose', `Loading WhatsApp WEB`);
  
      const timeout = 10 * 1000;
      page
        .goto(puppeteerConfig.whatsappUrl, {
          timeout,
          waitUntil: 'domcontentloaded',
        })
        .catch(() => {});
  
      log?.('verbose', `WhatsApp WEB loaded`);
    }, 1000);
    */
    return page;
}
let lastPercent = null;
let lastPercentMessage = null;
async function onLoadingScreen(page, onLoadingScreenCallBack) {
    await page.evaluate(`function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }`);
    await page
        .exposeFunction('loadingScreen', async (percent, message) => {
        if (lastPercent !== percent || lastPercentMessage !== message) {
            onLoadingScreenCallBack && onLoadingScreenCallBack(percent, message);
            lastPercent = percent;
            lastPercentMessage = message;
        }
    })
        .catch(() => null);
    await page.evaluate(function (selectors) {
        let observer = new MutationObserver(function () {
            let window2 = window;
            let progressBar = window2.getElementByXpath(selectors.PROGRESS);
            let progressBarNewTheme = window2.getElementByXpath(selectors.PROGRESS_NEW_THEME);
            let progressMessage = window2.getElementByXpath(selectors.PROGRESS_MESSAGE);
            let progressMessageNewTheme = window2.getElementByXpath(selectors.PROGRESS_MESSAGE_NEW_THEME);
            if (progressBar) {
                if (this.lastPercent !== progressBar.value ||
                    this.lastPercentMessage !== progressMessage.innerText) {
                    window2.loadingScreen(progressBar.value, progressMessage.innerText);
                    this.lastPercent = progressBar.value;
                    this.lastPercentMessage = progressMessage.innerText;
                }
            }
            else if (progressBarNewTheme) {
                if (this.lastPercent !== progressBarNewTheme.value ||
                    this.lastPercentMessage !== progressMessageNewTheme.innerText) {
                    const progressMsg = progressMessageNewTheme.innerText != 'WhatsApp'
                        ? progressMessageNewTheme.innerText
                        : '';
                    window2.loadingScreen(progressBarNewTheme.value, progressMsg);
                    this.lastPercent = progressBarNewTheme.value;
                    this.lastPercentMessage = progressMsg;
                }
            }
        });
        observer.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });
    }, {
        PROGRESS: "//*[@id='app']/div/div/div[2]/progress",
        PROGRESS_NEW_THEME: "//*[@id='app']/div/div/div[3]/progress",
        PROGRESS_MESSAGE: "//*[@id='app']/div/div/div[3]",
        PROGRESS_MESSAGE_NEW_THEME: "//*[@id='app']/div/div/div[2]",
    });
}
async function injectApi(page, onLoadingScreenCallBack) {
    const injected = await page
        .evaluate(() => {
        // @ts-ignore
        return (typeof window.WAPI !== 'undefined' &&
            typeof window.Store !== 'undefined');
    })
        .catch(() => false);
    if (injected) {
        return;
    }
    await page.addScriptTag({
        path: require.resolve('@wppconnect/wa-js'),
    });
    await page.evaluate(() => {
        WPP.chat.defaultSendMessageOptions.createChat = true;
        WPP.conn.setKeepAlive(true);
    });
    await page.addScriptTag({
        path: require.resolve(path.join(__dirname, '../../dist/lib/wapi', 'wapi.js')),
    });
    await onLoadingScreen(page, onLoadingScreenCallBack);
    // Make sure WAPI is initialized
    await page
        .waitForFunction(() => {
        return (typeof window.WAPI !== 'undefined' &&
            typeof window.Store !== 'undefined' &&
            window.WPP.isReady);
    })
        .catch(() => false);
}
/**
 * Initializes browser, will try to use chrome as default
 * @param session
 */
async function initBrowser(session, options, logger) {
    if (options.useChrome) {
        const chromePath = getChrome();
        if (chromePath) {
            if (!options.puppeteerOptions) {
                options.puppeteerOptions = {};
            }
            options.puppeteerOptions.executablePath = chromePath;
        }
        else {
            logger.warn('Chrome not found, using chromium', {
                session,
                type: 'browser',
            });
        }
    }
    // Use stealth plugin to avoid being detected as a bot
    puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
    let browser = null;
    if (options.browserWS && options.browserWS != '') {
        const transport = await getTransport(options.browserWS);
        browser = await puppeteer_extra_1.default.connect({ transport });
    }
    else {
        /**
         * Setting the headless mode to the old Puppeteer mode, when using the 'new' mode, results in an error on CentOS7 and Debian11.
         * Temporary fix.
         *
         * If proxy settings are provided, they are applied to the browser launch arguments.
         * This allows the browser to use the specified proxy server for all network requests.
         */
        const args = options.browserArgs
            ? options.browserArgs
            : [...puppeteer_config_1.puppeteerConfig.chromiumArgs];
        if (options.proxy && options.proxy.url) {
            args.push(`--proxy-server=${options.proxy.url}`);
        }
        browser = await puppeteer_extra_1.default.launch({
            headless: options.headless,
            devtools: options.devtools,
            args,
            ...options.puppeteerOptions,
        });
        // Register an exit callback to remove user-data-dir
        try {
            const arg = browser
                .process()
                .spawnargs.find((s) => s.startsWith('--user-data-dir='));
            if (arg) {
                const tmpUserDataDir = arg.split('=')[1];
                // Only if path is in TMP directory
                if (path.relative(os.tmpdir(), tmpUserDataDir).startsWith('puppeteer')) {
                    process.on('exit', () => {
                        // Remove only on exit signal
                        try {
                            rimraf.sync(tmpUserDataDir);
                        }
                        catch (error) { }
                    });
                }
            }
        }
        catch (error) { }
    }
    return browser;
}
async function getOrCreatePage(browser) {
    const pages = await browser.pages();
    if (pages.length) {
        return pages[0];
    }
    return await browser.newPage();
}
/**
 * Retrieves chrome instance path
 */
function getChrome() {
    try {
        return ChromeLauncher.Launcher.getFirstInstallation();
    }
    catch (error) {
        return undefined;
    }
}
async function getTransport(browserWS) {
    let error = null;
    try {
        return await websocket_1.WebSocketTransport.create(browserWS, 10000);
    }
    catch (e) {
        error = e;
    }
    // Automatic get the endpoint
    try {
        const endpointURL = browserWS.replace(/ws(s)?:/, 'http$1:') + '/json/version';
        const data = await axios_1.default.get(endpointURL).then((r) => r.data);
        return await websocket_1.WebSocketTransport.create(data.webSocketDebuggerUrl, 10000);
    }
    catch (e) { }
    // Throw first error
    throw error;
}
