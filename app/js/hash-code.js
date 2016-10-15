"use strict";

/**
 * Calculates the hash code of a string. This is a port of Java's String.hashCode
 * @param str the string to hash
 * @returns {number} the string hash code.
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export default function hashCode(str) {
    var hash = 0;
    if (str === undefined || str.length == 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
