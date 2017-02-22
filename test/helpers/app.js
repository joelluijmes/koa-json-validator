// sample app, derived from express-validator
const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();

const port = process.env.PORT || 8888;
const app = koa();

app.use(bodyParser());
app.use(function*(next) {
    try {
        yield next
    } catch (e) {
        this.status = e.status || 500;
        this.body = {
            message: e.message
        };
    }
})
module.exports = function(validation) {
    router.get(/\/test(\d+)/, validation);
    router.get('/:testparam?', validation);
    router.post('/:testparam?', validation);

    app.use(router.routes());

    return app.listen(port);
};
