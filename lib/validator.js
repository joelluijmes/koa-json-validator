// libraries
const validator = require('validator');
const _ = require('underscore');

class JsonValidator {

    constructor(ctx, validationObject, targetObject) {
        // koa's ctx
        this.ctx = ctx;
        // validation object which get parsed into validator checks
        this.validationObject = validationObject;
        // target object to test on, if not specified uses the request.body
        this.object = targetObject || this.ctx.request.body;
    }

    process() {
        _.mapObject(this.validationObject, (validation, property) => {
            // get the actual value which we are testing
            const value = this.object[property];
            const errorMessage = validation.errorMessage;

            // if the value doesn't exist, the valdiation failed
            if (typeof(value) === 'undefined')
                this.ctx.throw(400, errorMessage || `Property ${property} does not exist`);

            // if the validation is a string, the method we are using on
            // validatorjs, perform the validation without any options
            if (typeof(validation) === 'string') {
                this.validate(value, validation, {});
                return;
            }

            // stop validation if only errorMessage was given in the validation
            // object
            if (_.size(validation) === 1 && typeof(errorMessage) === 'string')
                return;

            // if not, its a object, could mean nested parameters or options
            // were given to test with
            _.mapObject(validation, (args, func) => {
                // if there is a validator with this name it means that it isn't
                // a nested parameter
                if (typeof(validator[func]) === 'function') {
                    this.validate(value, func, args);
                    return;
                }

                let nestedValidation = {};
                nestedValidation[func] = args;

                let targetObject = {};
                targetObject[func] = value[func];

                new JsonValidator(this.ctx, nestedValidation, targetObject).process();
            });
        });
    }

    validate(value, func, args) {
        let errorMessage = `${func} failed`;
        let options;

        if (typeof(args) === 'string') {
            // simplified form: { isInt: 'Not a integer' }
            errorMessage = args;
        } else if (typeof(args) === 'object') {
            // given an object:
            //
            // isInt: {
            //     errorMessage: { 'not a integer bigger than 2' },
            //     options: { min: 2 }
            // }
            errorMessage = args.errorMessage || errorMessage;
            options = args.options;
        }

        // check if there is a validator func with this name
        if (typeof(validator[func]) !== 'function')
            this.ctx.throw(500, `Validator function ${func} does not exist`);
        if (options && validator[func].length !== 2)
            this.ctx.throw(500, `Validator function ${func} does not take any options`);

        // perform the validation
        const result = options ?
            validator[func](value, options) :
            validator[func](value);

        if (result)
            return;

        this.ctx.throw(400, errorMessage);
    }

}

function validate(validation) {
    if (!validation || _.isEmpty(validation))
        throw new Error('Provide validation object to parse.');

    return function*(next) {
        new JsonValidator(this, validation).process();

        yield next;
    }
}

module.exports = validate;
