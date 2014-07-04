/* Fake, in-memory database of remember me tokens */

(function () {
    "use strict";

    var tokens = {};

    var rememberMe = {
        consumeRememberMeToken: function consumeRememberMeToken (token, fn) {
            var uid = tokens[token];
            // invalidate the single-use token
            delete tokens[token];
            return fn(null, uid);
        },

        saveRememberMeToken: function saveRememberMeToken (token, uid, fn) {
            tokens[token] = uid;
            return fn();
        },


        issueToken: function issueToken(user, done) {
            var token = rememberMe.randomString(64);
            rememberMe.saveRememberMeToken(token, user.id, function(err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        },

        /**
         * Return the random string
         *
         * @param {number} len A length of random string
         * @return {string}
         */
        randomString: function randomString (len) {
            var buf = []
                , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                , charlen = chars.length;

            for (var i = 0; i < len; ++i) {
                buf.push(chars[rememberMe.getRandomInt(0, charlen - 1)]);
            }

            return buf.join('');
        },

        /**
         * Return random number between 'min' and 'max' value
         *
         * @param {number} min
         * @param {number} max
         * @return {number}
         */
        getRandomInt: function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    };

    module.exports = rememberMe
}());





