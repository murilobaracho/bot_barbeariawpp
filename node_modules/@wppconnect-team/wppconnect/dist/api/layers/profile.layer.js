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
exports.ProfileLayer = void 0;
const helpers_1 = require("../helpers");
const status_layer_1 = require("./status.layer");
class ProfileLayer extends status_layer_1.StatusLayer {
    page;
    constructor(page, session, options) {
        super(page, session, options);
        this.page = page;
    }
    /**
     * @category Chat
     * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
     * @param time duration of silence
     * @param type kind of silence "hours" "minutes" "year"
     * To remove the silence, just enter the contact parameter
     */
    async sendMute(id, time, type) {
        const result = await (0, helpers_1.evaluateAndReturn)(this.page, (id, time, type) => WAPI.sendMute(id, time, type), id, time, type);
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sets current user profile status
     * @category Profile
     * @param status
     */
    async setProfileStatus(status) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ status }) => {
            WPP.profile.setMyStatus(status);
        }, { status });
    }
    /**
     * Gets current user profile status
     * @category Profile
     */
    getProfileStatus() {
        return (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.profile.getMyStatus());
    }
    /**
     * Sets the user's current profile photo
     * @category Profile
     * @param name
     */
    async setProfilePic(pathOrBase64, to) {
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
        const buff = Buffer.from(base64.replace(/^data:image\/(png|jpe?g|webp);base64,/, ''), 'base64');
        let _webb64_96 = await (0, helpers_1.resizeImg)(buff, { width: 96, height: 96 }), _webb64_640 = await (0, helpers_1.resizeImg)(buff, { width: 640, height: 640 });
        let obj = { a: _webb64_640, b: _webb64_96 };
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ obj, to }) => WAPI.setProfilePic(obj, to), {
            obj,
            to,
        });
    }
    /**
     * Sets current user profile name
     * @category Profile
     * @param name
     */
    async setProfileName(name) {
        return await (0, helpers_1.evaluateAndReturn)(this.page, ({ name }) => WPP.profile.setMyProfileName(name), { name });
    }
    /**
     * Gets the current user profile name
     * @category Profile
     */
    getProfileName() {
        return (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.profile.getMyProfileName());
    }
    /**
     * Remove your profile picture
     * @category Profile
     */
    async removeMyProfilePicture() {
        return await (0, helpers_1.evaluateAndReturn)(this.page, () => WPP.profile.removeMyProfilePicture());
    }
}
exports.ProfileLayer = ProfileLayer;
