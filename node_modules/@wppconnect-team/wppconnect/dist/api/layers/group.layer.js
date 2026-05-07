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
exports.GroupLayer = void 0;
const helpers_1 = require("../helpers");
const retriever_layer_1 = require("./retriever.layer");
class GroupLayer extends retriever_layer_1.RetrieverLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Removes the host device from the group
     * @category Group
     * @param groupId group id
     */
    async leaveGroup(groupId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (groupId) => WPP.group.leave(groupId), groupId);
    }
    /**
     * Retrieves group members as [Id] objects
     * @category Group
     * @param groupId group id
     */
    async getGroupMembersIds(groupId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (groupId) => Promise.resolve(WPP.group.getParticipants(groupId)).then((participants) => participants.map((p) => p.id)), groupId);
    }
    /**
     * Returns current group members as [Contact] objects
     * For previous members, see `groupMetadata.pastParticipants`.
     * @category Group
     * @param groupId
     */
    async getGroupMembers(groupId) {
        const membersIds = await this.getGroupMembersIds(groupId);
        const actions = membersIds.map((memberId) => {
            return this.getContact(memberId._serialized);
        });
        return Promise.all(actions);
    }
    /**
     * Generates group-invite link
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    async getGroupInviteLink(chatId) {
        const code = await (0, helpers_1.evaluateAndReturn)(this.page, (chatId) => WPP.group.getInviteCode(chatId), chatId);
        return `https://chat.whatsapp.com/${code}`;
    }
    /**
     * Revokes group-invite link and generates a new one.
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    async revokeGroupInviteLink(chatId) {
        const code = await (0, helpers_1.evaluateAndReturn)(this.page, (chatId) => WPP.group.revokeInviteCode(chatId), chatId);
        return `https://chat.whatsapp.com/${code}`;
    }
    /**
     * Displays group info from an invitation link (or invitation ID)
     * @category Group
     * @param inviteCode
     * @returns Invite code or group link. Example: CMJYfPFqRyE2GxrnkldYED
     * @example getGroupInfoFromInviteLink('https://chat.whatsapp.com/invite/CMJYfPFqRyE2GxrnkldYED')
     * @example getGroupInfoFromInviteLink('CMJYfPFqRyE2GxrnkldYED')
     */
    async getGroupInfoFromInviteLink(inviteCode) {
        inviteCode = inviteCode.replace('chat.whatsapp.com/', '');
        inviteCode = inviteCode.replace('invite/', '');
        inviteCode = inviteCode.replace('https://', '');
        inviteCode = inviteCode.replace('http://', '');
        return await (0, helpers_1.evaluateAndReturn)(this.page, (inviteCode) => WPP.group.getGroupInfoFromInviteCode(inviteCode), inviteCode);
    }
    /**
     * Creates a new chat group
     * @category Group
     * @param groupName Group name
     * @param contacts Contacts that should be added.
     */
    async createGroup(groupName, contacts) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupName, contacts }) => WPP.group.create(groupName, contacts, null), { groupName, contacts });
    }
    /**
     * Removes participant from group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    async removeParticipant(groupId, participantId) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, participantId }) => WPP.group.removeParticipants(groupId, participantId), { groupId, participantId });
    }
    /**
     * Adds participant to Group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    async addParticipant(groupId, participantId) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, participantId }) => WPP.group.addParticipants(groupId, participantId), { groupId, participantId });
    }
    /**
     * Promotes participant as Admin in given group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    async promoteParticipant(groupId, participantId) {
        await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, participantId }) => WPP.group.promoteParticipants(groupId, participantId), { groupId, participantId });
        return true;
    }
    /**
     * Demotes admin privileges of participant
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    async demoteParticipant(groupId, participantId) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, participantId }) => WPP.group.demoteParticipants(groupId, participantId), { groupId, participantId });
        return true;
    }
    /**
     * Retrieves group admins
     * @category Group
     * @param chatId Group/Chat id ('0000000000-00000000@g.us')
     */
    async getGroupAdmins(chatId) {
        const participants = await (0, helpers_1.evaluateAndReturn)(this.page, (chatId) => Promise.resolve(WPP.group.getParticipants(chatId)).then((participants) => participants.map((p) => p.toJSON())), chatId);
        return participants.filter((p) => p.isAdmin).map((p) => p.id);
    }
    /**
     * Join a group with an invite code or link
     * @category Group
     * @param inviteCode
     * @example joinGroup('https://chat.whatsapp.com/invite/CMJYfPFqRyE2GxrnkldYED')
     * @example joinGroup('CMJYfPFqRyE2GxrnkldYED')
     */
    async joinGroup(inviteCode) {
        inviteCode = inviteCode.replace('chat.whatsapp.com/', '');
        inviteCode = inviteCode.replace('invite/', '');
        inviteCode = inviteCode.replace('https://', '');
        inviteCode = inviteCode.replace('http://', '');
        return await (0, helpers_1.evaluateAndReturn)(this.page, (inviteCode) => WPP.group.join(inviteCode), inviteCode);
    }
    /**
     * Set group description (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param description New group description
     * @returns empty object
     */
    async setGroupDescription(groupId, description) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, description }) => WPP.group.setDescription(groupId, description), { groupId, description });
    }
    /**
     * Set group subject (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param title New group subject
     * @returns empty object
     */
    async setGroupSubject(groupId, title) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, title }) => WPP.group.setSubject(groupId, title), { groupId, title });
    }
    /**
     * Enable or disable group properties, see {@link GroupProperty for details}
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param property
     * @param value true or false
     * @returns empty object
     */
    async setGroupProperty(groupId, property, value) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, property, value }) => WPP.group.setProperty(groupId, property, value), { groupId, property, value });
    }
    /**
     * Set group icon
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param base64 Image in base64 ( data:image/jpeg;base64,..... )
     * @returns empty object
     */
    async setGroupIcon(groupId, pathOrBase64) {
        let base64 = '';
        if (pathOrBase64.startsWith('data:')) {
            base64 = pathOrBase64;
        }
        else {
            let fileContent = await (0, helpers_1.downloadFileToBase64)(pathOrBase64, [
                'image/gif',
                'image/png',
                'image/jpg',
                'image/jpeg',
                'image/webp',
            ]);
            if (!fileContent) {
                fileContent = await (0, helpers_1.fileToBase64)(pathOrBase64);
            }
            if (fileContent) {
                base64 = fileContent;
            }
        }
        if (!base64) {
            const error = new Error('Empty or invalid file or base64');
            Object.assign(error, {
                code: 'empty_file',
            });
            throw error;
        }
        const mimeInfo = (0, helpers_1.base64MimeType)(base64);
        if (!mimeInfo || !mimeInfo.includes('image')) {
            const error = new Error('Not an image, allowed formats png, jpeg and webp');
            Object.assign(error, {
                code: 'invalid_image',
            });
            throw error;
        }
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, base64 }) => WPP.group.setIcon(groupId, base64), { groupId, base64 });
    }
    /**
     * Set group subject (if allowed)
     * @category Group
     * @param groupId Group ID ('0000000000@g.us')
     * @returns empty object
     */
    async removeGroupIcon(groupId) {
        if (!groupId) {
            throw new Error('Empty or invalid group id');
        }
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId }) => WPP.group.removeIcon(groupId), { groupId });
    }
    /**
     * Get the max number of participants for a group
     * @category Group
     * @returns number
     */
    async getGroupSizeLimit() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.group.getGroupSizeLimit());
    }
    /**
     * Approve a membership request to group
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param wid <number>@c.us
     * @returns Promise
     */
    async approveGroupMembershipRequest(groupId, membershipIds) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, membershipIds }) => WPP.group.approve(groupId, membershipIds), { groupId, membershipIds });
    }
    /**
     * Reject a membership request to group
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param wid <number>@c.us
     * @returns Promise
     */
    async rejectGroupMembershipRequest(groupId, membershipIds) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId, membershipIds }) => WPP.group.reject(groupId, membershipIds), { groupId, membershipIds });
    }
    /**
     * Retrieve a list of a membership approval requests
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @returns Promise
     */
    async getGroupMembershipRequests(groupId) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ groupId }) => WPP.group.getMembershipRequests(groupId), { groupId });
    }
}
exports.GroupLayer = GroupLayer;
