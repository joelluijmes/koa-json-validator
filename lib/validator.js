// libraries
const validator = require('validator');
const _ = require('underscore');

class JsonValidator {

    constructor(ctx, validationObject, targetObject) {
        this.ctx = ctx;
        this.validationObject = validationObject;
        this.object = targetObject || this.ctx.request.body;
    }

    process() {
        _.mapObject(this.validationObject, (validation, property) => {
            const value = this.object[property];
            const errorMessage = validation.errorMessage;

            if (typeof(value) === 'undefined')
                this.ctx.throw(500, errorMessage || `Property ${property} does not exist`);

            if (typeof(validation) === 'string') {
                this.validate(value, validation, {});
                return;
            }

            _.mapObject(validation, (args, func) => {
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
        const errorMessage = args.errorMessage || `${func} failed`;
        const options = args.options;

        if (typeof(validator[func]) !== 'function')
            this.ctx.throw(500, `Validator function ${func} does not exist`);
        if (options && validator[func].length !== 2)
            this.ctx.throw(500, `Validator function ${func} does not take any options`);

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
