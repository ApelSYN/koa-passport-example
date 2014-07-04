var koa = require('koa')
  , app = koa();

// sessions
var session = require('koa-generic-session');
app.keys = ['your-session-secret'];
app.use(session());

// authentication
var passport = require('./auth');

// body parser
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

// append view renderer
var views = require('koa-render');
app.use(views('./views', {
  map: { html: 'handlebars' },
  cache: false
}));


// Require authentication for now
var authed = function*(next) {
    if (this.isAuthenticated()) {
        yield next
    } else {
        this.redirect('/')
    }
};

var rememberMe = require('./rememberMe');


// routes
var Router = require('koa-router');

var router = new Router();

router

    .get('/', function*() {
      this.body = yield this.render('login')
    })

    .post('/custom', function*(next) {
      var ctx = this;
      yield passport.authenticate('local', function*(err, user, info) {
        if (err) throw err;
        if (user === false) {
          ctx.status = 401;
          ctx.body = { success: false }
        } else {
          yield ctx.login(user);
          ctx.body = { success: true }
        }
      }).call(this, next)
    })

    // POST /login
    .post('/login',
      passport.authenticate('local', {
        failureRedirect: '/'
      }),
      function*(next) {
          var ctx = this;
          if (this.request.body.remember_me) {
              rememberMe.issueToken(this.passport.user,
                  function(err, token) {
                      if (err) { return next(err); }
                      ctx.cookies.set("remember_me", token, {signed: true});
                  }
              );
          }
          yield next;
      },
      function*(next) {
          this.redirect('/app');
          yield next;
      }
    )

    .get('/logout', function*(next) {
      this.logout();
      this.redirect('/');
      yield next;
    })

    .get('/auth/facebook',
      passport.authenticate('facebook')
    )

    .get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/app',
        failureRedirect: '/'
      })
    )

    .get('/auth/twitter',
      passport.authenticate('twitter')
    )

    .get('/auth/twitter/callback',
      passport.authenticate('twitter', {
        successRedirect: '/app',
        failureRedirect: '/'
      })
    )

    .get('/auth/google',
      passport.authenticate('google')
    )

    .get('/auth/google/callback',
      passport.authenticate('google', {
        successRedirect: '/app',
        failureRedirect: '/'
      })
    )

    // Seccured page(s)
    .get('/app', authed, function*() {
        this.body = yield this.render('app')
    });

app.use(router.middleware());

// start server
app.listen(process.env.PORT || 3000);
