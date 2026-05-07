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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostLayer = void 0;
const create_config_1 = require("../../config/create-config");
const auth_1 = require("../../controllers/auth");
const browser_1 = require("../../controllers/browser");
const logger_1 = require("../../utils/logger");
const sleep_1 = require("../../utils/sleep");
const helpers_1 = require("../helpers");
class HostLayer {
    page;
    session;
    options;
    logger;
    autoCloseInterval = null;
    autoCloseCalled = false;
    isInitialized = false;
    isInjected = false;
    isStarted = false;
    isLogged = false;
    isInChat = false;
    checkStartInterval = null;
    urlCode = '';
    attempt = 0;
    catchQR = null;
    statusFind = null;
    onLoadingScreen = null;
    catchLinkCode = null;
    constructor(page, session, options) {
        this.page = page;
        this.session = session;
        this.options = { ...create_config_1.defaultOptions, ...options };
        this.logger = this.options.logger || logger_1.defaultLogger;
        this.log('info', 'Initializing...');
        this.initialize();
    }
    log(level, message, meta = {}) {
        this.logger.log({
            level,
            message,
            session: this.session,
            type: 'client',
            ...meta,
        });
    }
    async initialize() {
        this.page.on('close', () => {
            this.cancelAutoClose();
            this.log('verbose', 'Page Closed', { type: 'page' });
        });
        this.page.on('load', () => {
            this.log('verbose', 'Page loaded', { type: 'page' });
            this.afterPageLoad();
        });
        this.isInitialized = true;
    }
    async afterPageLoad() {
        this.log('verbose', 'Injecting wapi.js');
        const options = {
            deviceName: this.options.deviceName,
            disableGoogleAnalytics: this.options.disableGoogleAnalytics,
            googleAnalyticsId: this.options.googleAnalyticsId,
            linkPreviewApiServers: this.options.linkPreviewApiServers,
            poweredBy: this.options.poweredBy,
        };
        await (0, helpers_1.evaluateAndReturn)(this.page, (options) => {
            window.WPPConfig = options;
        }, options);
        this.isInjected = false;
        await (0, browser_1.injectApi)(this.page, this.onLoadingScreen)
            .then(() => {
            this.isInjected = true;
            this.log('verbose', 'wapi.js injected');
            this.afterPageScriptInjected();
        })
            .catch((e) => {
            console.log(e);
            this.log('verbose', 'wapi.js failed');
            this.log('error', e);
        });
    }
    async afterPageScriptInjected() {
        this.getWAVersion()
            .then((version) => {
            this.log('info', `WhatsApp WEB version: ${version}`);
        })
            .catch(() => null);
        this.getWAJSVersion()
            .then((version) => {
            this.log('info', `WA-JS version: ${version}`);
        })
            .catch(() => null);
        (0, helpers_1.evaluateAndReturn)(this.page, () => {
            WPP.on('conn.auth_code_change', window.checkQrCode);
        }).catch(() => null);
        (0, helpers_1.evaluateAndReturn)(this.page, () => {
            WPP.on('conn.main_ready', window.checkInChat);
        }).catch(() => null);
        this.checkInChat();
        this.checkQrCode();
    }
    async start() {
        if (this.isStarted) {
            return;
        }
        this.isStarted = true;
        await (0, browser_1.initWhatsapp)(this.page, null, false, this.options.whatsappVersion, this.options.proxy, this.log.bind(this));
        await this.page.exposeFunction('checkQrCode', () => this.checkQrCode());
        /*await this.page.exposeFunction('loginByCode', (phone: string) =>
          this.loginByCode(phone)
        );*/
        await this.page.exposeFunction('checkInChat', () => this.checkInChat());
        this.checkStartInterval = setInterval(() => this.checkStart(), 5000);
        this.page.on('close', () => {
            clearInterval(this.checkStartInterval);
        });
    }
    async checkStart() {
        (0, auth_1.needsToScan)(this.page)
            .then((need) => { })
            .catch(() => null);
    }
    async checkQrCode() {
        const needScan = await (0, auth_1.needsToScan)(this.page).catch(() => null);
        this.isLogged = !needScan;
        if (!needScan) {
            this.attempt = 0;
            return;
        }
        const result = await this.getQrCode();
        if (!result?.urlCode || this.urlCode === result.urlCode) {
            return;
        }
        if (typeof this.options.phoneNumber === 'string') {
            return this.loginByCode(this.options.phoneNumber);
        }
        this.urlCode = result.urlCode;
        this.attempt++;
        let qr = '';
        if (this.options.logQR || this.catchQR) {
            qr = await (0, auth_1.asciiQr)(this.urlCode);
        }
        if (this.options.logQR) {
            this.log('info', `Waiting for QRCode Scan (Attempt ${this.attempt})...:\n${qr}`, { code: this.urlCode });
        }
        else {
            this.log('verbose', `Waiting for QRCode Scan: Attempt ${this.attempt}`);
        }
        this.catchQR?.(result.base64Image, qr, this.attempt, result.urlCode);
    }
    async loginByCode(phone) {
        const code = await (0, helpers_1.evaluateAndReturn)(this.page, async ({ phone }) => {
            return JSON.parse(JSON.stringify(await WPP.conn.genLinkDeviceCodeForPhoneNumber(phone)));
        }, { phone });
        if (this.options.logQR) {
            this.log('info', `Waiting for Login By Code (Code: ${code})\n`);
        }
        else {
            this.log('verbose', `Waiting for Login By Code`);
        }
        this.catchLinkCode?.(code);
    }
    async checkInChat() {
        const inChat = await (0, auth_1.isInsideChat)(this.page).catch(() => null);
        this.isInChat = !!inChat;
        if (!inChat) {
            return;
        }
        this.log('http', 'Connected');
        this.statusFind?.('inChat', this.session);
    }
    tryAutoClose() {
        if (this.autoCloseInterval) {
            this.cancelAutoClose();
        }
        if ((this.options.autoClose > 0 || this.options.deviceSyncTimeout > 0) &&
            !this.autoCloseInterval &&
            !this.page.isClosed()) {
            this.log('info', 'Closing the page');
            this.autoCloseCalled = true;
            this.statusFind && this.statusFind('autocloseCalled', this.session);
            try {
                this.page.close();
            }
            catch (error) { }
        }
    }
    startAutoClose(time = null) {
        if (time === null || time === undefined) {
            time = this.options.autoClose;
        }
        if (time > 0 && !this.autoCloseInterval) {
            const seconds = Math.round(time / 1000);
            this.log('info', `Auto close configured to ${seconds}s`);
            let remain = seconds;
            this.autoCloseInterval = setInterval(() => {
                if (this.page.isClosed()) {
                    this.cancelAutoClose();
                    return;
                }
                remain -= 1;
                if (remain % 10 === 0 || remain <= 5) {
                    this.log('http', `Auto close remain: ${remain}s`);
                }
                if (remain <= 0) {
                    this.tryAutoClose();
                }
            }, 1000);
        }
    }
    cancelAutoClose() {
        clearInterval(this.autoCloseInterval);
        this.autoCloseInterval = null;
    }
    async getQrCode() {
        let qrResult;
        qrResult = await (0, helpers_1.scrapeImg)(this.page).catch(() => undefined);
        return qrResult;
    }
    async waitForQrCodeScan() {
        if (!this.isStarted) {
            throw new Error('waitForQrCodeScan error: Session not started');
        }
        while (!this.page.isClosed() && !this.isLogged) {
            await (0, sleep_1.sleep)(200);
            const needScan = await (0, auth_1.needsToScan)(this.page).catch(() => null);
            this.isLogged = !needScan;
        }
    }
    async waitForInChat() {
        if (!this.isStarted) {
            throw new Error('waitForInChat error: Session not started');
        }
        if (!this.isLogged) {
            return false;
        }
        const start = Date.now();
        while (!this.page.isClosed() && this.isLogged && !this.isInChat) {
            if (this.options.deviceSyncTimeout > 0 &&
                Date.now() - start >= this.options.deviceSyncTimeout) {
                return false;
            }
            await (0, sleep_1.sleep)(1000);
            const inChat = (0, auth_1.isInsideChat)(this.page).catch(() => null);
            this.isInChat = !!inChat;
        }
        return this.isInChat;
    }
    async waitForPageLoad() {
        while (!this.isInjected) {
            await (0, sleep_1.sleep)(200);
        }
        await this.page.waitForFunction(() => WPP.isReady).catch(() => { });
    }
    async waitForLogin() {
        this.log('http', 'Waiting page load');
        await this.waitForPageLoad();
        this.log('http', 'Checking is logged...');
        let authenticated = await (0, auth_1.isAuthenticated)(this.page).catch(() => null);
        this.startAutoClose();
        if (authenticated === false) {
            this.log('http', typeof this.options.phoneNumber === 'string'
                ? 'Waiting for Login by Code...'
                : 'Waiting for QRCode Scan...');
            this.statusFind?.('notLogged', this.session);
            await this.waitForQrCodeScan();
            this.log('http', typeof this.options.phoneNumber === 'string'
                ? 'Checking Login by Code status...'
                : 'Checking QRCode status...');
            // Wait for interface update
            await (0, sleep_1.sleep)(200);
            authenticated = await (0, auth_1.isAuthenticated)(this.page).catch(() => null);
            if (authenticated === null) {
                this.log('warn', 'Failed to authenticate');
                this.statusFind?.('qrReadError', this.session);
            }
            else if (authenticated) {
                this.log('http', 'Login with success');
                this.statusFind?.('qrReadSuccess', this.session);
            }
            else {
                this.log('warn', 'Login Fail');
                this.statusFind?.('qrReadFail', this.session);
                this.tryAutoClose();
                throw new Error('Failed to read the QRCode');
            }
        }
        else if (authenticated === true) {
            this.log('http', 'Authenticated');
            this.statusFind?.('isLogged', this.session);
        }
        if (authenticated === true) {
            // Reinicia o contador do autoclose
            this.cancelAutoClose();
            // Wait for interface update
            await (0, sleep_1.sleep)(200);
            this.startAutoClose(this.options.deviceSyncTimeout);
            this.log('http', 'Checking phone is connected...');
            const inChat = await this.waitForInChat();
            if (!inChat) {
                this.log('warn', 'Phone not connected');
                this.statusFind?.('phoneNotConnected', this.session);
                this.tryAutoClose();
                throw new Error('Phone not connected');
            }
            this.cancelAutoClose();
            return true;
        }
        if (authenticated === false) {
            this.tryAutoClose();
            this.log('warn', 'Not logged');
            throw new Error('Not logged');
        }
        this.tryAutoClose();
        if (this.autoCloseCalled) {
            this.log('error', 'Auto Close Called');
            throw new Error('Auto Close Called');
        }
        if (this.page.isClosed()) {
            this.log('error', 'Page Closed');
            throw new Error('Page Closed');
        }
        this.log('error', 'Unknow error');
        throw new Error('Unknow error');
    }
    /**
     * @category Host
     * @returns Current host device details
     */
    async getHostDevice() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.getHost());
    }
    /**
     * @category Host
     * @returns Current wid connected
     */
    async getWid() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.getWid());
    }
    /**
     * Retrieves WA version
     * @category Host
     */
    async getWAVersion() {
        await this.page
            .waitForFunction(() => WAPI.getWAVersion())
            .catch(() => null);
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.getWAVersion());
    }
    /**
     * Retrieves WA-JS version
     * @category Host
     */
    async getWAJSVersion() {
        await this.page.waitForFunction(() => WPP.version).catch(() => null);
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.version);
    }
    /**
     * Retrieves the connection state
     * @category Host
     */
    async getConnectionState() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => {
            return WPP.whatsapp.Socket.state;
        });
    }
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    async isConnected() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.isConnected());
    }
    /**
     * Check is online
     * @category Host
     */
    async isOnline() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isOnline());
    }
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    async isLoggedIn() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.isLoggedIn());
    }
    /**
     * Retrieves Battery Level
     * @category Host
     */
    async getBatteryLevel() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.getBatteryLevel());
    }
    /**
     * Start phone Watchdog, forcing the phone connection verification.
     *
     * @category Host
     * @param interval interval number in miliseconds
     */
    async startPhoneWatchdog(interval = 15000) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (interval) => WAPI.startPhoneWatchdog(interval), interval);
    }
    /**
     * Stop phone Watchdog, more details in {@link startPhoneWatchdog}
     * @category Host
     */
    async stopPhoneWatchdog(interval) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WAPI.stopPhoneWatchdog());
    }
    /**
     * Check the current session is an MultiDevice session
     * @category Host
     */
    async isMultiDevice() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isMultiDevice());
    }
    /**
     * Retrieve main interface is authenticated, loaded and synced
     * @category Host
     */
    async isMainReady() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isMainReady());
    }
    /**
     * Retrieve if is authenticated
     * @category Host
     */
    async isAuthenticated() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isAuthenticated());
    }
    /**
     * Retrieve if main interface is authenticated and loaded, bot not synced
     * @category Host
     */
    async isMainLoaded() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isMainLoaded());
    }
    /**
     * Retrieve if main interface is initializing
     * @category Host
     */
    async isMainInit() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.isMainInit());
    }
    /**
     * Join or leave of WhatsApp Web beta program.
     * Will return the value seted
     * @category Host
     */
    async joinWebBeta(value) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (value) => WPP.conn.joinWebBeta(value), value);
    }
    /**
     * Get WhatsApp build constants
     * @category Host
     * @returns Build constants information
     */
    async getBuildConstants() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.getBuildConstants());
    }
    /**
     * Check if the account has been migrated to LID
     * @category Host
     * @returns true if the account has been migrated to LID, false otherwise
     */
    async isLidMigrated() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.whatsapp.functions.isLidMigrated());
    }
}
exports.HostLayer = HostLayer;
