# koa-json-validator
[![Build Status](https://img.shields.io/teamcity/http/lensert.com:8111/s/KoaJsonValidatorBuild.svg)](http://lensert.com:8111/project.html?projectId=KoaJsonValidator)
[![npm version](https://badge.fury.io/js/koa-json-validator.svg)](https://badge.fury.io/js/koa-json-validator)

A [koa](https://github.com/koajs/koa) middleware for [node-validator](https://github.com/chriso/validator.js) taking a json object
inspired by [express-validator](https://github.com/ctavan/express-validator).

It works by parsing a javascript object, which calls the original functions on [node-validator](https://github.com/chriso/validator.js).
Meaning that it works with all of [node-validator](https://github.com/chriso/validator.js) functions, it even passes options to the
function.

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation
```
npm install koa-json-validator --save
```

## Usage
see also [test-server.js](test-server.js)  

#### Full Example
```javascript
// libraries
const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();

// the validator middleware
const validator = require('koa-json-validator');

const port = process.env.PORT || 3000;
const app = koa();

app.use(bodyParser());
app.use(function*(next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.status || 500;
        this.body = {
            error: err.message
        };
    }
});

// validation object, tip: load from json file :)
const registerValidation = {
    username: {
        isLength: {
            options: {
                min: 3,
                max: 9
            },
            errorMessage: 'Username must be between 3 and 9 characters'
        },
        isAlphanumeric: 'Username must be alphanumeric'
    },
    password: {
        isLength: {
            options: {
                min: 6
            },
            errorMessage: 'Password must be at least 6 characters'
        }
    }
};

// call the validator with a validation object
router.post('/register', validator(registerValidation), function*(next) {
    // do database checks

    this.body = {
        message: 'account created'
    };
});

app.use(router.routes());
app.listen(port);
```

## License
Copyright (c) 2017, Joël Luijmes <joelluijmes@gmail.com>, ISC License
