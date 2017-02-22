const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();

const validator = require('../lib/validator');

const port = process.env.PORT || 8888;
const app = koa();

app.use(bodyParser());
app.use(function*(next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.status || 500;
        this.body = {
            message: err.message
        };
    }
});

const complete = function*(next) {
    this.status = 200;
    this.body = {};
}

router.post('/failOnInvalidValidator', validator({
    param: 'invalid'
}), complete);

router.post('/failOnInvalidOptionGiven', validator({
    param: {
        isDecimal: {
            options: {
                min: 3
            }
        }
    }
}), complete);

router.post('/failOnMissingParameter', validator({
    param: 'isInt'
}), complete);

router.post('/defaultErrorOnInvalidParameter', validator({
    param: 'isInt'
}), complete);

router.post('/customErrorOnInvalidParameter', validator({
    param: {
        isInt: {
            errorMessage: 'Param is not a integer'
        }
    }
}), complete);

module.exports = function() {
    app.use(router.routes());
    //app.use(router.allowedMethods());

    return app.listen(port, console.log);
};
