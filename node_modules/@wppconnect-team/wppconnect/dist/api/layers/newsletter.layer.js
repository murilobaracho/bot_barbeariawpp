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
exports.NewsletterLayer = void 0;
const helpers_1 = require("../helpers");
const host_layer_1 = require("./host.layer");
class NewsletterLayer extends host_layer_1.HostLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Create Newsletter
     * @category Newsletter
     *
     * @example
     * ```javascript
     * client.createNewsletter('Name for your newsletter', {description: 'Description for that', picture: '<base64_string',});
     * ```
     * @param name Name Newsletter
     * @param options options Newsletter, description and picture
     */
    async createNewsletter(name, options) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (name, options) => WPP.newsletter.create(name, options), name, options);
    }
    /**
     * Destroy a Newsletter
     * @category Newsletter
     *
     * @example
     * ```javascript
     * client.destroyNewsletter('[newsletter-id]@newsletter');
     * ```
     * @param name id of Newsletter
     */
    async destroyNewsletter(id) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (id) => WPP.newsletter.destroy(id), id);
    }
    /**
     * Edit a Newsletter
     * @category Newsletter
     *
     * @example
     * ```javascript
     * client.editNewsletter('[newsletter-id]@newsletter', {
        description: 'new description';
        name: 'new name';
        picture: '<new pic base64>';
      });
     * ```
     * @param name id of Newsletter
     */
    async editNewsletter(id, opts) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (id, opts) => WPP.newsletter.edit(id, opts), id, opts);
    }
    /**
     * Mute a Newsletter
     * @category Newsletter
     *
     * @example
     * ```javascript
     * client.muteNewsletter('[newsletter-id]@newsletter');
     * ```
     * @param name id of Newsletter
     */
    async muteNesletter(id) {
        return (0, helpers_1.evaluateAndReturn)(this.page, (id) => WPP.newsletter.mute(id), id);
    }
}
exports.NewsletterLayer = NewsletterLayer;
