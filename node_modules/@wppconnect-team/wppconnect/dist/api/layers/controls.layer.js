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
exports.ControlsLayer = void 0;
const helpers_1 = require("../helpers");
const ui_layer_1 = require("./ui.layer");
class ControlsLayer extends ui_layer_1.UILayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Unblock contact
     * @category Blocklist
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    async unblockContact(contactId) {
        await (0, helpers_1.evaluateAndReturn)(this.page, (contactId) => WPP.blocklist.unblockContact(contactId), contactId);
        return true;
    }
    /**
     * Block contact
     * @category Blocklist
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    async blockContact(contactId) {
        await (0, helpers_1.evaluateAndReturn)(this.page, (contactId) => WPP.blocklist.blockContact(contactId), contactId);
        return true;
    }
    /**
     * puts the chat as unread
     * @category Chat
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    async markUnseenMessage(contactId) {
        await (0, helpers_1.evaluateAndReturn)(this.page, (contactId) => WPP.chat.markIsUnread(contactId), contactId);
        return true;
    }
    /**
     * Deletes the given chat
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @returns boolean
     */
    async deleteChat(chatId) {
        const result = await (0, helpers_1.evaluateAndReturn)(this.page, (chatId) => WPP.chat.delete(chatId), chatId);
        return result.status === 200;
    }
    /**
     * Archive and unarchive chat messages with true or false
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    async archiveChat(chatId, option = true) {
        return (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId, option }) => WPP.chat.archive(chatId, option), { chatId, option });
    }
    /**
     * Pin and Unpin chat messages with true or false
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @param nonExistent {boolean} Pin chat, non-existent (optional)
     * @returns object
     */
    async pinChat(chatId, option, nonExistent) {
        if (nonExistent) {
            await (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId }) => WPP.chat.find(chatId), { chatId });
        }
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId, option }) => WPP.chat.pin(chatId, option), { chatId, option });
    }
    /**
     * Deletes all messages of given chat
     * @category Chat
     * @param chatId
     * @param keepStarred Keep starred messages
     * @returns boolean
     */
    async clearChat(chatId, keepStarred = true) {
        const result = await (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId, keepStarred }) => WPP.chat.clear(chatId, keepStarred), { chatId, keepStarred });
        return result.status === 200;
    }
    /**
     * Deletes message of given message id
     * @category Chat
     * @param chatId The chat id from which to delete the message.
     * @param messageId The specific message id of the message to be deleted
     * @param onlyLocal If it should only delete locally (message remains on the other recipienct's phone). Defaults to false.
     */
    async deleteMessage(chatId, messageId, onlyLocal = false, deleteMediaInDevice = true) {
        await (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId, messageId, onlyLocal, deleteMediaInDevice }) => WPP.chat.deleteMessage(chatId, messageId, deleteMediaInDevice, !onlyLocal), { chatId, messageId, onlyLocal, deleteMediaInDevice });
        return true;
    }
    /**
     * Edits message of given message id
     * @category Chat
     * @param msgId The specific message id of the message to be edited
     * @param newText New content of specified message
     * @param options Common message options
     *
     * @example
     * ```javascript
     * // Simple message
     * client.editMessage('true_<number>@c.us_messageId', 'new Text For Simple Message');
     * ```
     */
    async editMessage(msgId, newText, options = {}) {
        const editResult = await (0, helpers_1.evaluateAndReturn)(this.page, ({ msgId, newText, options }) => WPP.chat.editMessage(msgId, newText, options), { msgId, newText, options });
        const result = (await (0, helpers_1.evaluateAndReturn)(this.page, async ({ messageId }) => {
            return JSON.parse(JSON.stringify(await WAPI.getMessageById(messageId)));
        }, { messageId: editResult.id }));
        if (result.body !== newText)
            throw editResult;
        return result;
    }
    /**
     * Stars message of given message id
     * @category Chat
     * @param messagesId The specific message id of the message to be starred
     * @param star Add or remove star of the message. Defaults to true.
     */
    async starMessage(messagesId, star = true) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ messagesId, star }) => WAPI.starMessages(messagesId, star), { messagesId, star });
    }
    /**
     * Allow only admin to send messages with true or false
     * @category Group
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    async setMessagesAdminsOnly(chatId, option) {
        return (0, helpers_1.evaluateAndReturn)(this.page, ({ chatId, option }) => WAPI.setMessagesAdminsOnly(chatId, option), { chatId, option });
    }
    /**
     * Enable or disable temporary messages with true or false
     * @category Chat
     * @param chatOrGroupId id '000000000000@c.us' or '000000-000000@g.us'
     * @param value true or false
     * @returns boolean
     */
    async setTemporaryMessages(chatOrGroupId, value) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ chatOrGroupId, value }) => WAPI.setTemporaryMessages(chatOrGroupId, value), { chatOrGroupId, value });
    }
    /**
     * Change limits of whatsapp web
     *  * @example
     * ```javascript
     *  //Change the maximum size (bytes) for uploading media (max 70MB)
     *  WPP.conn.setLimit('maxMediaSize',16777216);
     *
     *  //Change the maximum size (bytes) for uploading files (max 1GB)
     *  WPP.conn.setLimit('maxFileSize',104857600);
     *
     *  //Change the maximum number of contacts that can be selected when sharing (Default 5)
     *  WPP.conn.setLimit('maxShare',100);
     *
     *  //Change the maximum time (seconds) of a video status
     *  WPP.conn.setLimit('statusVideoMaxDuration',120);
     *
     *  //Remove pinned conversation limit (only whatsapp web) (Default 3)
     *  WPP.conn.setLimit('unlimitedPin',true);
     * ```
     * @category Chat
     */
    async setLimit(key, value) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ key, value }) => WPP.conn.setLimit(key, value), { key, value });
    }
}
exports.ControlsLayer = ControlsLayer;
