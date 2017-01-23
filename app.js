const Koa = require('koa');
const config = require('./config');
const mongo = require('mongoose');
const Router = require('koa-router');
const router = new Router();
const serve = require('koa-static');
const fs    = require('fs');
const convert = require('koa-convert');
const session = require('koa-generic-session');
const flash = require('koa-connect-flash');
const bodyParser = require('koa-bodyparser');
const MongooseStore = require('koa-session-mongoose');
const app = new Koa();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const pug = require('pug');

mongo.connect(config.mongoose.uri, config.mongoose.options);
mongo.Promise = Promise;
const User = require('./models/user');



passport.serializeUser(function(user, done) {
    done(null, user.id); // uses _id as idFieldd
});

passport.deserializeUser(function(id, done) {
    User.findById(id, done); // callback version checks id validity automatically
});

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username, password: password }, done);
}));


app.keys = ['your-session-secret'];


router
    .post('/login', passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/'
        }))
    .post('/logout',async function(ctx, next) {
        ctx.logout();
        ctx.session = null; // destroy session (!!!)
        ctx.redirect('/');
    })
    .get('/test', async()=>{
        await User.create({username: 'test', password: 'test'});
    })
    .get('/counter', async(ctx)=>{
        let n = ctx.session.views || 0;
        ctx.session.views = ++n;
        ctx.body = n + ' views';
    })
    .get('/', async function(ctx, next) {
            if (ctx.isAuthenticated()) {
                ctx.body = pug.renderFile('./templates/welcome.pug');
            } else {
                ctx.body = pug.renderFile('./templates/login.pug');
            }
    })

app
    .use(convert(serve('./public')))
    .use(convert(bodyParser({
        jsonLimit: '56kb'
    })))
    .use(convert(session({
        key:     'sid',
        cookie:  {
            httpOnly:  true,
            path:      '/',
            overwrite: true,
            signed:    false, // by default true (not needed here)
            maxAge:    3600 * 4 * 1e3 // session expires in 4 hours, remember me lives longer
        },
        rolling: true,
        store: MongooseStore.create({
            model:   'Session',
            expires: 3600 * 4
        })
    })))
    .use(passport.initialize())
    .use(passport.session())
    .use(flash())

    .use(router.routes())
    .use(router.allowedMethods())
    .use(function(ctx, next) {
        if (ctx.isAuthenticated()) {
            console.log('Authenticated');
            return next()
        } else {
            console.log('notAuthenticated');
            ctx.redirect('/')
        }
    })
    .listen(config.port);