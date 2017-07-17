const Koa = require('koa'),
      app = new Koa(),
      views = require('koa-views'),
      bodyParser = require('koa-bodyparser'),
      rememberMe = require('./rememberMe'),
      Router = require('koa-router');

// trust proxy
app.proxy = true;

// sessions
const session = require('koa-session');
app.keys = ['your-session-secret'];
app.use(session({}, app));

// body parser
app.use(bodyParser());

// authentication
var passport = require('./auth');

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

// append view renderer
app.use(views('./views', {
  map: { html: 'handlebars' },
  cache: false
}));


// Require authentication for now
var authed = (ctx, next) => {
    if (ctx.isAuthenticated()) {
        return next()
    } else {
        ctx.redirect('/');
    }
};

// routes
var router = new Router();

router

    .get('/', async (ctx, next) => {
      await ctx.render('login')
    })

    .post('/custom', function(ctx) {
        return passport.authenticate('local', function(err, user, info, status) {
            if (user === false) {
                ctx.body = { success: false }
                ctx.throw(401)
            } else {
                ctx.body = { success: true }
                return ctx.login(user)
            }
        })(ctx)
    })

    // POST /login
    .post('/login',
      passport.authenticate('local', {
        failureRedirect: '/'
      }),
      async (ctx, next) => {
          if (ctx.request.body.remember_me) {
              rememberMe.issueToken(ctx.session.passport.user,
                  function(err, token) {
                      if (err) { return next(err); }
                      ctx.cookies.set("remember_me", token, {signed: true, maxAge: 604800000}); // remember for 1 week
                  }
              );
          }
          await next();
      },
      (ctx) => {
          ctx.redirect('/app');
      }
    )

    .get('/logout', (ctx) => {
      ctx.logout();
      ctx.redirect('/');
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
    .get('/app', authed, async (ctx, next) => {
        await ctx.render('app');
        await next();
    });

app.use(router.middleware());

// start server
app.listen(process.env.PORT || 3000);
