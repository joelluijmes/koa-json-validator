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

router.post('/giveErrorOnMissingParameter', validator({
    param: {
        errorMessage: 'Param missing'
    }
}), complete);

router.post('/successOnGivenParameter', validator({
    param: {
        errorMessage: 'Param missing'
    }
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

router.post('/customErrorOnInvalidParameterSimpledForm', validator({
    param: {
        isInt: 'Param is not a integer'
    }
}), complete);

router.post('/customErrorOnValidationWithOptions', validator({
    param: {
        isInt: {
            options: {
                min: 3
            },
            errorMessage: 'Param must be bigger than 3'
        }
    }
}), complete);

router.post('/nestedParameters', validator({
    param: {
        key: 'isAlpha',
        value: 'isInt'
    }
}), complete);

router.post('/nestedParametersWithErrorMessage', validator({
    param: {
        key: {
            isAlpha: 'param.key can only be alpha characters'
        },
        value: 'isInt'
    }
}), complete);

module.exports = function() {
    app.use(router.routes());
    //app.use(router.allowedMethods());

    return app.listen(port, console.log);
};
