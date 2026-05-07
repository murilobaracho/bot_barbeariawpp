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
exports.CommunityLayer = void 0;
const helpers_1 = require("../helpers");
const newsletter_layer_1 = require("./newsletter.layer");
class CommunityLayer extends newsletter_layer_1.NewsletterLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Create a community
     *
     * @category Community
     * @param groupIds Array with groups id
     */
    async createCommunity(name, description, groupIds) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (name, description, groupIds) => WPP.community.create(name, description, groupIds), name, description, groupIds);
    }
    /**
     * Deactivate a community
     * @category Community
     * @param communityId id
     */
    async deactivateCommunity(communityId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId) => WPP.community.deactivate(communityId), communityId);
    }
    /**
     * Add groups to community
     *
     * @category Community
     * @param communityId id
     */
    async addSubgroupsCommunity(communityId, groupsIds) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId, groupsIds) => WPP.community.addSubgroups(communityId, groupsIds), communityId, groupsIds);
    }
    /**
     * Remove groups of community
     *
     * @category Community
     * @param communityId id
     */
    async removeSubgroupsCommunity(communityId, groupsIds) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId, groupsIds) => WPP.community.removeSubgroups(communityId, groupsIds), communityId, groupsIds);
    }
    /**
     * Remove admin of community participant
     *
     * @category Community
     * @param communityId id
     */
    async demoteCommunityParticipant(communityId, participantId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId, participantId) => WPP.community.demoteParticipants(communityId, participantId), communityId, participantId);
    }
    /**
     * Promote participant of community to admin
     *
     * @category Community
     * @param communityId id
     */
    async promoteCommunityParticipant(communityId, participantId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId, participantId) => WPP.community.promoteParticipants(communityId, participantId), communityId, participantId);
    }
    /**
     * Get all participants of a community
     *
     * @category Community
     * @param communityId id
     */
    async getCommunityParticipants(communityId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (communityId) => WPP.community.getParticipants(communityId), communityId);
    }
}
exports.CommunityLayer = CommunityLayer;
