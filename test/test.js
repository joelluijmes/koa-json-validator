// target
const validator = require('../lib/validator');
const testValidation = require('./test-validation');

// testing framework
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

// const validation = function*(next) {
//     this.body = { message: 'test' };
// }

const validation = validator(testValidation);
const app = require('./helpers/app')(validation);

describe('lib/validator.js - test', () => {

    it('fail on non number', (done) => {
        chai.request(app)
            .post('/somewhere')
            .send({
                number: 'John'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('Numbers only');

                done();
            });
    });

});
