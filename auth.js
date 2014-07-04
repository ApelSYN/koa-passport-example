var passport = require('koa-passport');

var user = { id: 1, username: 'test' };

passport.serializeUser(function(user, done) {
  done(null, user.id)
});

passport.deserializeUser(function(id, done) {
  done(null, user)
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  if (username === 'test' && password === 'test') {
    done(null, user)
  } else {
    done(null, false)
  }
}));

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
            if (uid === 1) {
                done(null, user)
            } else {
                done(null, false)
            }
        });
    },
    rememberMe.issueToken
));


var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
    clientID: 'your-client-id',
    clientSecret: 'your-secret',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/facebook/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
));

var TwitterStrategy = require('passport-twitter').Strategy;
passport.use(new TwitterStrategy({
    consumerKey: 'your-consumer-key',
    consumerSecret: 'your-secret',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    // retrieve user ...
    done(null, user)
  }
));

var GoogleStrategy = require('passport-google').Strategy;
passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:' + (process.env.PORT || 3000) + '/auth/google/callback',
    realm: 'http://localhost:' + (process.env.PORT || 3000)
  },
   function(identifier, profile, done) {
    // retrieve user ...
    done(null, user)
  }
));

module.exports = passport;