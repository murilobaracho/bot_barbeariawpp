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
exports.ListenerLayer = void 0;
const events_1 = require("events");
const helpers_1 = require("../helpers");
const exposed_enum_1 = require("../helpers/exposed.enum");
const profile_layer_1 = require("./profile.layer");
class ListenerLayer extends profile_layer_1.ProfileLayer {
    page;
    listenerEmitter = new events_1.EventEmitter({
        captureRejections: true,
    });
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
        this.listenerEmitter.setMaxListeners(0);
        this.listenerEmitter.on(exposed_enum_1.ExposedFn.onInterfaceChange, (state) => {
            this.log('http', `Current state: ${state.mode} (${state.displayInfo})`);
        });
        this.listenerEmitter[events_1.captureRejectionSymbol] = (reason, event) => {
            let message = `Unhandled Rejection in a ${event} event: `;
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
            this.log('error', reason);
        };
    }
    async afterPageScriptInjected() {
        await super.afterPageScriptInjected();
        const functions = [
            ...Object.values(exposed_enum_1.ExposedFn),
            'onAddedToGroup',
            'onIncomingCall',
            'onRevokedMessage',
            'onReactionMessage',
            'onPollResponse',
            'onUpdateLabel',
            'onOrderStatusUpdate',
            'onParticipantsChanged',
            'onNewChat',
        ];
        for (const func of functions) {
            const has = await this.page
                .evaluate((func) => typeof window[func] === 'function', func)
                .catch(() => false);
            if (!has) {
                this.log('debug', `Exposing ${func} function`);
                await this.page
                    .exposeFunction(func, (...args) => {
                    Promise.resolve().then(() => {
                        const count = this.listenerEmitter.listenerCount(func);
                        if (count > 0) {
                            this.log('debug', `Emitting ${func} event (${count} registered)`);
                        }
                        this.listenerEmitter.emit(func, ...args);
                    });
                })
                    .catch(() => { });
            }
        }
        await this.page
            .evaluate(() => {
            try {
                if (!window['onMessage']?.exposed) {
                    WPP.on('chat.new_message', (msg) => {
                        if (msg.isSentByMe || msg.isStatusV3) {
                            return;
                        }
                        const serialized = WAPI.processMessageObj(msg, false, false);
                        if (serialized) {
                            window['onMessage'](serialized);
                        }
                    });
                    window['onMessage'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onAck']?.exposed) {
                    window.WAPI.waitNewAcknowledgements(window['onAck']);
                    window['onAck'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onMessageEdit']?.exposed) {
                    WPP.on('chat.msg_edited', (data) => {
                        const eventData = {
                            chat: data.chat,
                            id: data.id,
                            msg: WAPI.processMessageObj(data.msg, true, false),
                        };
                        window['onMessageEdit'](eventData);
                    });
                    window['onMessageEdit'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onAnyMessage']?.exposed) {
                    WPP.on('chat.new_message', (msg) => {
                        const serialized = WAPI.processMessageObj(msg, true, false);
                        if (serialized) {
                            window['onAnyMessage'](serialized);
                        }
                    });
                    window['onAnyMessage'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onStateChange']?.exposed) {
                    window.WAPI.onStateChange(window['onStateChange']);
                    window['onStateChange'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onStreamChange']?.exposed) {
                    window.WAPI.onStreamChange(window['onStreamChange']);
                    window['onStreamChange'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onStreamModeChanged']?.exposed) {
                    window.WAPI.onStreamModeChanged(window['onStreamModeChanged']);
                    window['onStreamModeChanged'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onStreamInfoChanged']?.exposed) {
                    window.WAPI.onStreamInfoChanged(window['onStreamInfoChanged']);
                    window['onStreamInfoChanged'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onAddedToGroup']?.exposed) {
                    window.WAPI.onAddedToGroup(window['onAddedToGroup']);
                    window['onAddedToGroup'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onIncomingCall']?.exposed) {
                    window.WAPI.onIncomingCall(window['onIncomingCall']);
                    window['onIncomingCall'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onInterfaceChange']?.exposed) {
                    window.WAPI.onInterfaceChange(window['onInterfaceChange']);
                    window['onInterfaceChange'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onNotificationMessage']?.exposed) {
                    window.WAPI.onNotificationMessage(window['onNotificationMessage']);
                    window['onNotificationMessage'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onPresenceChanged']?.exposed) {
                    WPP.on('chat.presence_change', window['onPresenceChanged']);
                    window['onPresenceChanged'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onLiveLocation']?.exposed) {
                    window.WAPI.onLiveLocation(window['onLiveLocation']);
                    window['onLiveLocation'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onRevokedMessage']?.exposed) {
                    WPP.on('chat.msg_revoke', (data) => {
                        const eventData = {
                            author: data.author,
                            from: data.from,
                            to: data.to,
                            id: data.id._serialized,
                            refId: data.refId._serialized,
                        };
                        window['onRevokedMessage'](eventData);
                    });
                    window['onRevokedMessage'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onReactionMessage']?.exposed) {
                    WPP.on('chat.new_reaction', (data) => {
                        const eventData = {
                            id: data.id,
                            msgId: data.msgId,
                            reactionText: data.reactionText,
                            read: data.read,
                            orphan: data.orphan,
                            orphanReason: data.orphanReason,
                            timestamp: data.timestamp,
                        };
                        window['onReactionMessage'](eventData);
                    });
                    window['onReactionMessage'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onPollResponse']?.exposed) {
                    WPP.on('chat.poll_response', (data) => {
                        const eventData = {
                            msgId: data.msgId,
                            chatId: data.chatId,
                            selectedOptions: data.selectedOptions,
                            timestamp: data.timestamp,
                            sender: data.sender,
                        };
                        window['onPollResponse'](eventData);
                    });
                    window['onPollResponse'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onUpdateLabel']?.exposed) {
                    WPP.on('chat.update_label', (data) => {
                        const eventData = {
                            chat: data.chat,
                            ids: data.ids,
                            labels: data.labels,
                            type: data.type,
                        };
                        window['onUpdateLabel'](eventData);
                    });
                    window['onUpdateLabel'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onOrderStatusUpdate']?.exposed) {
                    WPP.on('order.payment_status', (data) => {
                        const eventData = {
                            method: data.method,
                            timestamp: data.timestamp,
                            reference_id: data.reference_id,
                            msgId: data.msgId,
                        };
                        window['onOrderStatusUpdate'](eventData);
                    });
                    window['onOrderStatusUpdate'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onParticipantsChanged']?.exposed) {
                    WPP.on('group.participant_changed', (participantChangedEvent) => {
                        window['onParticipantsChanged'](participantChangedEvent);
                    });
                    window['onParticipantsChanged'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onNewChat']?.exposed) {
                    WPP.on('chat.new_chat', (chat) => {
                        window['onNewChat'](chat);
                    });
                    window['onNewChat'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                if (!window['onBackendEvent']?.exposed) {
                    WPP.on('conn.backend_event', (eventName, ...args) => {
                        window['onBackendEvent'](eventName, ...args);
                    });
                    window['onBackendEvent'].exposed = true;
                }
            }
            catch (error) {
                console.error(error);
            }
        })
            .catch(() => { });
    }
    /**
     * Register the event and create a disposable object to stop the listening
     * @param event Name of event
     * @param listener The function to execute
     * @returns Disposable object to stop the listening
     */
    registerEvent(event, listener) {
        this.log('debug', `Registering ${event.toString()} event`);
        this.listenerEmitter.on(event, listener);
        return {
            dispose: () => {
                this.listenerEmitter.off(event, listener);
            },
        };
    }
    /**
     * @event Listens to all new messages received only.
     * @returns Disposable object to stop the listening
     */
    onMessage(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.OnMessage, callback);
    }
    /**
     * @event Listens to all new messages, sent and received.
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    onAnyMessage(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.OnAnyMessage, callback);
    }
    /**
     * @event Listens to all notification messages, like group changes, join, leave
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    onNotificationMessage(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onNotificationMessage, callback);
    }
    /**
     * @event Listens List of mobile states
     * @returns Disposable object to stop the listening
     */
    onStateChange(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStateChange, callback);
    }
    /**
     * @deprecated in favor of {@link onStreamModeChanged}
     * @event Returns the current state of the connection
     * @returns Disposable object to stop the listening
     */
    onStreamChange(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStreamChange, callback);
    }
    /**
     * @event Listens to Stream mode changes
     * @returns Disposable object to stop the listening
     */
    onStreamModeChanged(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStreamModeChanged, callback);
    }
    /**
     * @event Listens to Stream info changes
     * @returns Disposable object to stop the listening
     */
    onStreamInfoChanged(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStreamInfoChanged, callback);
    }
    /**
     * @event Listens to all internal WhatsApp Web BackendEventBus events.
     * The first argument is the event name; additional arguments vary by event.
     * @returns Disposable object to stop the listening
     */
    onBackendEvent(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onBackendEvent, callback);
    }
    /**
     * @event Listens to interface mode change See {@link InterfaceState} and {@link InterfaceMode} for details
     * @returns Disposable object to stop the listening
     */
    onInterfaceChange(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onInterfaceChange, callback);
    }
    /**
     * @event Listens to message acknowledgement changes
     * @returns Disposable object to stop the listening
     */
    onAck(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onAck, callback);
    }
    /**
     * @event Listens to message edited changes
     * @returns Disposable object to stop the listening
     */
    onMessageEdit(callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onMessageEdit, callback);
    }
    onLiveLocation(id, callback) {
        const ids = [];
        if (typeof id === 'function') {
            callback = id;
        }
        else if (Array.isArray(id)) {
            ids.push(...id);
        }
        else {
            ids.push(id);
        }
        return this.registerEvent(exposed_enum_1.ExposedFn.onLiveLocation, (event) => {
            // Only group events
            if (ids.length && !ids.includes(event.id)) {
                return;
            }
            callback(event);
        });
    }
    onParticipantsChanged(groupId, callback) {
        if (typeof groupId === 'function') {
            callback = groupId;
            groupId = null;
        }
        return this.registerEvent(exposed_enum_1.ExposedFn.onParticipantsChanged, (evData) => {
            if (groupId && groupId !== evData.groupId) {
                return;
            }
            callback({
                by: evData.author,
                byPushName: evData.authorPushName,
                groupId: evData.groupId,
                action: evData.action,
                operation: evData.operation,
                who: evData.participants,
            });
        });
    }
    /**
     * @event Fires callback with Chat object every time the host phone is added to a group.
     * @param to callback
     * @returns Disposable object to stop the listening
     */
    onAddedToGroup(callback) {
        return this.registerEvent('onAddedToGroup', callback);
    }
    /**
     * @event Listen for incoming calls, whether audio or video (pending a reaction).
     * To reject the call, simply call `rejectCall` {@link rejectCall}
     * @returns Disposable object to stop listening
     */
    onIncomingCall(callback) {
        return this.registerEvent('onIncomingCall', callback);
    }
    onPresenceChanged(id, callback) {
        const ids = [];
        if (typeof id === 'function') {
            callback = id;
        }
        else if (Array.isArray(id)) {
            ids.push(...id);
        }
        else {
            ids.push(id);
        }
        if (ids.length) {
            this.subscribePresence(ids);
        }
        return this.registerEvent(exposed_enum_1.ExposedFn.onPresenceChanged, (presence) => {
            // Only group events
            if (ids.length && !ids.includes(presence.id)) {
                return;
            }
            callback(presence);
        });
    }
    /**
     * Subscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     *
     * ```typescript
     * // subcribe all contacts
     * const contacts = await client.getAllContacts();
     * await client.subscribePresence(contacts.map((c) => c.id._serialized));
     *
     * // subcribe all groups participants
     * const chats = await client.getAllGroups(false);
     * for (const c of chats) {
     *   const ids = c.groupMetadata.participants.map((p) => p.id._serialized);
     *   await client.subscribePresence(ids);
     * }
     * ```
     *
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of subscribed
     */
    async subscribePresence(id) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (id) => WAPI.subscribePresence(id), id);
    }
    /**
     * Unsubscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of unsubscribed
     */
    async unsubscribePresence(id) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, (id) => WAPI.unsubscribePresence(id), id);
    }
    /**
     * @event Listens to message revocation
     * @returns Disposable object to stop the listening
     */
    onRevokedMessage(callback) {
        return this.registerEvent('onRevokedMessage', callback);
    }
    /**
     * @event Listens to message reactions
     * @returns Disposable object to stop the listening
     */
    onReactionMessage(callback) {
        return this.registerEvent('onReactionMessage', callback);
    }
    /**
     * @event Listens to poll response messages
     * @returns Disposable object to stop the listening
     */
    onPollResponse(callback) {
        return this.registerEvent('onPollResponse', callback);
    }
    /**
     * @event Listens to update label
     * @returns Disposable object to stop the listening
     */
    onUpdateLabel(callback) {
        return this.registerEvent('onUpdateLabel', callback);
    }
    /**
     * @event Listens to update order status
     * @returns Disposable object to stop the listening
     */
    onOrderStatusUpdate(callback) {
        return this.registerEvent('onOrderStatusUpdate', callback);
    }
    /**
     * @event Listens to chats being added to ChatStore (Cache Layer)
     * @returns Disposable object to stop the listening
     */
    onNewChat(callback) {
        return this.registerEvent('onNewChat', callback);
    }
}
exports.ListenerLayer = ListenerLayer;
