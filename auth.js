var passport = require('koa-passport');

const fetchUser = (() => {
    // This is an example! Use password hashing in your
    const user = { id: 1, username: 'test', password: 'test' }
    return async function() {
        return user
    }
})()

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    try {
        const user = await fetchUser()
        done(null, user)
    } catch(err) {
        done(err)
    }
})

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
    fetchUser()
        .then(user => {
            if (username === user.username && password === user.password) {
                done(null, user)
            } else {
                done(null, false)
            }
        })
        .catch(err => done(err))
}))


var RememberMeStrategy = require('koa-passport-remember-me').Strategy;
var rememberMe = require('./rememberMe');
// Remember Me cookie strategy
//   This strategy consumes a remember me token, supplying the user the
//   token was originally issued to.  The token is single-use, so a new
//   token is then issued to replace it.
passport.use(new RememberMeStrategy(
    {
        cookie: {signed: true}
    },
    function(token, done) {
        rememberMe.consumeRememberMeToken(token, function(err, uid) {
            if (err) { return done(err); }
            if (!uid) { return done(null, false); }

            // retrieve user ...
            fetchUser()
                .then(user => {
                    if (user.id === 1) {
                        done(null, user)
                    } else {
                        done(null, false)
                    }
                })
                .catch(err => done(err))
        });
    },
    rememberMe.issueToken
));


const FacebookStrategy = require('passport-facebook').Strategy
passport.use(new FacebookStrategy({
        clientID: 'your-client-id',
        clientSecret: 'your-secret',
        callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
    },
    function(token, tokenSecret, profile, done) {
        // retrieve user ...
        fetchUser().then(user => done(null, user))
    }
))

const TwitterStrategy = require('passport-twitter').Strategy
passport.use(new TwitterStrategy({
        consumerKey: 'your-consumer-key',
        consumerSecret: 'your-secret',
        callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/twitter/callback'
    },
    function(token, tokenSecret, profile, done) {
        // retrieve user ...
        fetchUser().then(user => done(null, user))
    }
))

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
        clientId: 'your-client-id',
        clientSecret: 'your-secret',
        callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback'
    },
    function(token, tokenSecret, profile, done) {
        // retrieve user ...
        fetchUser().then(user => done(null, user))
    }
))

module.exports = passport;