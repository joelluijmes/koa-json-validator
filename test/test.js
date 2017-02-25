// target
const testServer = require('./test-server')();
const validator = require('../lib/validator');

// testing framework
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);


describe('lib/validator.js - test', () => {

    it('should give exception on empty validator', (done) => {
        validator.bind(null, {}).should.throw('Provide validation object to parse.');

        done();
    });

    it('should fail on invalid validator', (done) => {
        chai.request(testServer)
            .post('/failOnInvalidValidator')
            .send({
                param: 12
            })
            .end((err, res) => {
                res.should.have.status(500);
                res.should.be.json;
                res.body.message.should.equal('Validator function invalid does not exist');

                done();
            });
    });

    it('should fail on validator who doesn\'t take any option', (done) => {
        chai.request(testServer)
            .post('/failOnInvalidOptionGiven')
            .send({
                param: 12
            })
            .end((err, res) => {
                res.should.have.status(500);
                res.should.be.json;
                res.body.message.should.equal('Validator function isDecimal does not take any options');

                done();
            });
    });

    it('should fail if parameter is not posted', (done) => {
        chai.request(testServer)
            .post('/failOnMissingParameter')
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('Property param does not exist');

                done();
            });
    });

    it('should fail with message if parameter is not posted', (done) => {
        chai.request(testServer)
            .post('/giveErrorOnMissingParameter')
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('Param missing');

                done();
            });
    });

    it('should succeed if the parameter is present', (done) => {
        chai.request(testServer)
            .post('/successOnGivenParameter')
            .send({
                param: 'isGiven :)'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;

                done();
            });
    });

    it('should give default message on invalid parameter', (done) => {
        chai.request(testServer)
            .post('/defaultErrorOnInvalidParameter')
            .send({
                param: 'test'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('isInt failed');

                done();
            });
    });

    it('should give custom message on invalid parameter', (done) => {
        chai.request(testServer)
            .post('/customErrorOnInvalidParameter')
            .send({
                param: 'test'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('Param is not a integer');

                done();
            });
    });

    it('should give custom message on invalid parameter, simplified form   ', (done) => {
        chai.request(testServer)
            .post('/customErrorOnInvalidParameterSimpledForm')
            .send({
                param: 'test'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('Param is not a integer');

                done();
            });
    });

    it('should work with nested parameter', (done) => {
        chai.request(testServer)
            .post('/nestedParameters')
            .send({
                param: {
                    key: 'a',
                    value: '1'
                }
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;

                done();
            });
    });

    it('should work give message with nestedParameters', (done) => {
        chai.request(testServer)
            .post('/nestedParametersWithErrorMessage')
            .send({
                param: {
                    key: '123',
                    value: '1'
                }
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.message.should.equal('param.key can only be alpha characters');

                done();
            });
    });
});
