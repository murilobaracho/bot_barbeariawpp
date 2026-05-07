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
exports.UILayer = void 0;
const helpers_1 = require("../helpers");
const group_layer_1 = require("./group.layer");
class UILayer extends group_layer_1.GroupLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Opens given chat at last message (bottom)
     * Will fire natural workflow events of whatsapp web
     * @category UI
     * @param chatId
     */
    async openChat(chatId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (chatId) => WPP.chat.openChatBottom(chatId, undefined), chatId);
    }
    /**
     * Opens chat at given message position
     * @category UI
     * @param chatId Chat id
     * @param messageId Message id (For example: '06D3AB3D0EEB9D077A3F9A3EFF4DD030')
     */
    async openChatAt(chatId, messageId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (chatId, messageId) => WPP.chat.openChatAt(chatId, messageId, undefined), chatId, messageId);
    }
    /**
     * Closes the currently opened chat (if any).
     * The boolean result reflects if there was any chat that got closed.
     * @category UI
     */
    async closeChat() {
        return (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.chat.closeChat());
    }
    /**
     * Return the currently active chat (visually open)
     * @category UI
     */
    getActiveChat() {
        return (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.chat.getActiveChat());
    }
    /**
     * Get current theme
     * @category UI
     * @returns Current theme ('dark' or 'light')
     */
    async getTheme() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.getTheme());
    }
    /**
     * Set theme
     * Note: This will force a reload of WhatsApp Web to take effect
     * @category UI
     * @param theme Theme to set ('dark' or 'light')
     * @returns void
     */
    async setTheme(theme) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (theme) => WPP.conn.setTheme(theme), theme);
    }
    /**
     * Get auto download settings
     * @category UI
     * @returns Auto download settings
     */
    async getAutoDownloadSettings() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.conn.getAutoDownloadSettings());
    }
    /**
     * Set auto download settings
     * Note: This will force a reload of WhatsApp Web to take effect
     * @category UI
     * @param settings Auto download settings to set
     * @returns void
     */
    async setAutoDownloadSettings(settings) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (settings) => WPP.conn.setAutoDownloadSettings(settings), settings);
    }
}
exports.UILayer = UILayer;
