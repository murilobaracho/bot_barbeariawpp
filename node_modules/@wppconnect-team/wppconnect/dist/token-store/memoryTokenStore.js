"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryTokenStore = void 0;
/**
 * Token Store using im memory
 *
 * ```typescript
 * // Example of typescript with MemoryTokenStore
 * import * as wppconnect from '@wppconnect-team/wppconnect';
 *
 * const myTokenStore = new wppconnect.tokenStore.MemoryTokenStore();
 *
 * wppconnect.create({
 *   session: 'mySession',
 *   tokenStore: myTokenStore,
 * });
 *
 * wppconnect.create({
 *   session: 'otherSession',
 *   tokenStore: myTokenStore,
 * });
 * ```
 */
class MemoryTokenStore {
    tokens = {};
    getToken(sessionName) {
        return this.tokens[sessionName];
    }
    setToken(sessionName, tokenData) {
        if (!tokenData) {
            return false;
        }
        this.tokens[sessionName] = tokenData;
        return true;
    }
    removeToken(sessionName) {
        delete this.tokens[sessionName];
        return true;
    }
    listTokens() {
        return Object.keys(this.tokens);
    }
}
exports.MemoryTokenStore = MemoryTokenStore;
