// libraries
const validator = require('validator');
const _ = require('underscore');

module.exports = function(validation) {
    if (!validation)
        throw new Error('Provide validation object to parse.');

    return function*(next) {
        _.mapObject(validation, (validation, property) => {
            const value = this.request.body[property];

            _.mapObject(validation, (arguments, check) => {
                const errorMessage = arguments.errorMessage || `${check} failed`;
                const options = arguments.options;

                const result = options
                    ? validator[check](value, options)
                    : validator[check](value);

                if (!result)
                    this.throw(400, errorMessage);

                console.log(`${check}: ${result}`);
                // console.log(` ${errorMessage}`);
                // console.log(` ${options}`);
            });

            console.log();
        });

        this.status = 200;
    }
}
