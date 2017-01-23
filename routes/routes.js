const router = require('koa-router')();
const pug = require('pug');
const app = require('../app').app;
const passport = require('../app').passport;
const User = require('../models/user');



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
    .get('/ok', async (ctx)=>{
        ctx.body = 'ok'
    })
    .get('/bad', async (ctx)=>{
        ctx.body = 'bad'
    })

module.exports = router;