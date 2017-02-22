// libraries
const validator = require('validator');
const _ = require('underscore');

function validate(ctx, value, check, args) {
    const errorMessage = args.errorMessage || `${check} failed`;
    const options = args.options;

    if (typeof(validator[check]) !== 'function')
        ctx.throw(500, `Validator function ${check} does not exist`);
    if (options && validator[check].length !== 2)
        ctx.throw(500, `Validator function ${check} does not take any options`);

    const result = options
        ? validator[check](value, options)
        : validator[check](value);

    if (!result)
        ctx.throw(400, errorMessage);
}

module.exports = function(validation) {
    if (!validation || _.isEmpty(validation))
        throw new Error('Provide validation object to parse.');

    return function*(next) {
        _.mapObject(validation, (validation, property) => {
            const value = this.request.body[property];
            if (typeof(value) === 'undefined')
                this.throw(500, `Property ${property} does not exist`);

            if (typeof(validation) === 'string')
                validate(this, value, validation, {});
            else
                _.mapObject(validation, (args, check) => validate(this, value, check, args));
        });

        yield next;
    }
}
