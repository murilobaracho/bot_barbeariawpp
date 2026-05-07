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
exports.BusinessLayer = void 0;
const controls_layer_1 = require("./controls.layer");
const helpers_1 = require("../helpers");
class BusinessLayer extends controls_layer_1.ControlsLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * Querys product catalog
     * @param id Buisness profile id ('00000@c.us')
     */
    async getBusinessProfilesProducts(id) {
        return (0, helpers_1.evaluateAndReturn)(this.page, ({ id }) => WAPI.getBusinessProfilesProducts(id), { id });
    }
    /**
     * Get Business Profile
     * @param id Buisness profile id ('00000@c.us')
     */
    async getBusinessProfile(id) {
        return (0, helpers_1.evaluateAndReturn)(this.page, async ({ id }) => {
            return JSON.parse(JSON.stringify(await WPP.contact.getBusinessProfile(id)));
        }, { id });
    }
    /**
     * Querys order catalog
     * @param messageId string
     * @returns Message object
     */
    async getOrderbyMsg(messageId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, ({ messageId }) => WAPI.getOrderbyMsg(messageId), { messageId });
    }
    /**
   * Update your business profile
   *
   * @example
   * ```javascript
   * await client.editBusinessProfile({description: 'New description for profile'});
   * ```
   *
   * ```javascript
   * await client.editBusinessProfile({categories: {
      id: "133436743388217",
      localized_display_name: "Artes e entretenimento",
      not_a_biz: false,
    }});
   * ```
   *
   * ```javascript
   * await client.editBusinessProfile({address: 'Street 01, New York'});
   * ```
   *
   * ```javascript
   * await client.editBusinessProfile({email: 'test@test.com.br'});
   * ```
   *
   * Change website of profile (max 2 sites)
   * ```javascript
   * await client.editBusinessProfile({website: [
    "https://www.wppconnect.io",
    "https://www.teste2.com.br",
  ]});
   * ```
   *
   * Change businessHours for Specific Hours
   * ```javascript
   * await client.editBusinessProfile({ businessHours: {
   * {
        tue: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
        wed: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
        thu: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
        fri: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
        sat: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
        sun: {
          mode: "specific_hours",
          hours: [
            [
              540,
              1080,
            ],
          ],
        },
      }
    },
    timezone: "America/Sao_Paulo"
    });
   *
   * Change businessHours for Always Opened
   * ```javascript
   * await client.editBusinessProfile({ businessHours: {
      {
        mon: {
          mode: "open_24h",
        },
        tue: {
          mode: "open_24h",
        },
        wed: {
          mode: "open_24h",
        },
        thu: {
          mode: "open_24h",
        },
        fri: {
          mode: "open_24h",
        },
        sat: {
          mode: "open_24h",
        },
        sun: {
          mode: "open_24h",
        },
      }
      timezone: "America/Sao_Paulo"
    });
   *
   * Change businessHours for Appointment Only
   * ```javascript
   * await client.editBusinessProfile({ businessHours: { {
      mon: {
        mode: "appointment_only",
      },
      tue: {
        mode: "appointment_only",
      },
      wed: {
        mode: "appointment_only",
      },
      thu: {
        mode: "appointment_only",
      },
      fri: {
        mode: "appointment_only",
      },
      sat: {
        mode: "appointment_only",
      },
      sun: {
        mode: "appointment_only",
      },
    }
      timezone: "America/Sao_Paulo"
    });
   *
   *
   * ```
   */
    async editBusinessProfile(options) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, async ({ options }) => {
            return JSON.parse(JSON.stringify(await WPP.profile.editBusinessProfile(options)));
        }, { options });
    }
    /**
     * Sends product with product image to given chat id
     * @param to Chat id
     * @param base64 Base64 image data
     * @param caption Message body
     * @param businessId Business id number that owns the product ('0000@c.us')
     * @param productId Product id, see method getBusinessProfilesProducts for more info
     */
    async sendImageWithProduct(to, base64, caption, businessId, productId) {
        return (0, helpers_1.evaluateAndReturn)(this.page, ({ to, base64, businessId, caption, productId }) => {
            WAPI.sendImageWithProduct(base64, to, caption, businessId, productId);
        }, { to, base64, businessId, caption, productId });
    }
}
exports.BusinessLayer = BusinessLayer;
