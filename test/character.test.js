'use strict';

const app = require('../server');
const request = require('supertest')(app);
const { expect } = require('chai');
const debug = require('debug')('app:test/character');
require('../lib/mongoose-connect');
const helper = require('./test-helper');

const User = require('../model/user');
const Character = require('../model/character');
const Stats = require('../model/stats');
const Skills = require('../model/skills');
const Saves = require('../model/save');
const Spells = require('../model/spells');
const Attacks = require('../model/attack');

const exampleCharacter = {
  name: 'dustinyschild'
};

describe('Character Routes',function(){
  beforeEach(function(){
    return User.createUser(helper.user)
      .then(user => this.testUser = user)
      .then(user => user.generateToken())
      .then(token => this.testToken = token);
  });
  beforeEach(function(){
    return User.createUser(helper.hacker)
      .then(hacker => this.hacker = hacker)
      .then(hacker => hacker.generateToken())
      .then(token => this.hackerToken = token);
  });
  afterEach(function(){
    return helper.kill();
  });
  describe('GET /api/character/:id', function(){
    beforeEach(function (){
      exampleCharacter.userId = this.testUser._id;
      return Character.createCharacter(exampleCharacter)
        .then(character => this.testCharacter = character);
    });
    beforeEach(function(){
      return helper.addSpell(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addSkill(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addStat(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addSave(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addAttack(this.testCharacter.id,this.testUser._id);
    });
    it('should return a character populated with skills, stats, etc.', function(){
      return request
        .get(`/api/character/${this.testCharacter._id}`)
        .set({'Authorization': `Bearer ${this.testToken}`})
        .expect(200)
        .expect(res => {
          debug(res.body);
          expect(res.body.name).to.equal(exampleCharacter.name);
        });
    });
    describe('GET /api/characters',function(){
      beforeEach(async function(){
        await Character.createCharacter({name: 'Character2',userId: this.testUser._id})
          .then(character => this.testCharacter2 = character);
        await Character.createCharacter({name: 'Character3',userId: this.testUser._id})
          .then(character => this.testCharacter3 = character);
      });
      it('should return all characters for user',function(){
        return request.get('/api/characters')
          .set({Authorization: `Bearer ${this.testToken}`})
          .expect(200)
          .expect(res => {
            expect(res.body.length).to.equal(3);
            expect(res.body[0].name).to.equal('dustinyschild');
            expect(res.body[1].name).to.equal('Character2');
            expect(res.body[2].name).to.equal('Character3');
          });
      });
      it('should return the characterIds',function(){
        return request.get('/api/characters')
          .set({Authorization: `Bearer ${this.testToken}`})
          .expect(200)
          .expect(res => {
            expect(res.body[0].characterId).to.equal(this.testCharacter._id.toString());
            expect(res.body[1].characterId).to.equal(this.testCharacter2._id.toString());
            expect(res.body[2].characterId).to.equal(this.testCharacter3._id.toString());
          });
      });
    });
  });
  describe('POST /api/character',function(){
    it('should return 200 if it saves a new character',function(){
      return request.post(`/api/character`)
        .send(exampleCharacter)
        .set({'Authorization': `Bearer ${this.testToken}`})
        .expect(200)
        .expect(res => {
          debug(res.body.name);
          expect(res.body.name).to.equal('dustinyschild');
        });
    });
    it('should return 401 if no body is provided',function(){
      return request.post('/api/character')
        .send()
        .set({'Authorization': `Bearer ${this.testToken}`})
        .expect(400);
    });
    //TODO: add validation checks for Auth headers
  });

  describe('PUT /api/character/:id', function() {
    beforeEach(function (){
      exampleCharacter.userId = this.testUser._id;
      return Character.createCharacter(exampleCharacter)
        .then(character => this.testCharacter = character);
    });
    beforeEach(function(){
      return helper.addSpell(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addSkill(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addStat(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addSave(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addAttack(this.testCharacter.id,this.testUser._id);
    });

    it('should return updated character', function() {
      return request
        .put(`/api/character/${this.testCharacter._id}`)
        .set({Authorization: `Bearer ${this.testToken}`})
        .send({
          name: 'XxKillerxX',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.name).to.equal('XxKillerxX');
        });
    });

    it('should return 400 with invalid body', function() {
      return request
        .put(`/api/character/${this.testCharacter._id}`)
        .set({ 'Authorization': `Bearer ${this.testToken}`})
        .send()
        .expect(400);
    });

    it('should return 401 for invalid user',function(){
      debug('this is the token',this.hackerToken);
      return request
        .put(`/api/character/${this.testCharacter._id}`)
        .set({'Authorization': `Bearer ${this.hackerToken}`})
        .expect(401);
    });
  });

  describe('DELETE /api/character/:id',function(){
    beforeEach(function (){
      exampleCharacter.userId = this.testUser._id;
      return Character.createCharacter(exampleCharacter)
        .then(character => this.testCharacter = character);
    });
    beforeEach(function(){
      return helper.addSpell(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addSkill(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      Promise.all([
        helper.addStat(this.testCharacter.id,this.testUser._id),
        helper.addStat(this.testCharacter.id,this.testUser._id),
        helper.addStat(this.testCharacter.id,this.testUser._id),
      ]);
    });
    beforeEach(function(){
      return helper.addSave(this.testCharacter.id,this.testUser._id);
    });
    beforeEach(function(){
      return helper.addAttack(this.testCharacter.id,this.testUser._id);
    });

    it('should return 204',function(){
      return request.delete(`/api/character/${this.testCharacter._id}`)
        .set({ 'Authorization': `Bearer ${this.testToken}`})
        .expect(204)
        .then(res => {
          return Character.findById(res.body._id)
            .then(deleted => {
              debug('deleted character', deleted);
              expect(deleted).to.be.null;
            });
        })
        .then(() => {
          return Stats.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        })
        .then(() => {
          return Skills.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        })
        .then(() => {
          return Saves.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        })
        .then(() => {
          return Stats.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        })
        .then(() => {
          return Spells.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        })
        .then(() => {
          return Attacks.find({characterId : this.testCharacter._id})
            .then(deleted => {
              debug('deleted', deleted);
              expect(deleted.length).to.equal(0);
            });
        });
    });
    it('should return 401 for invalid user',function(){
      debug('this is the token',this.hackerToken);
      return request.delete(`/api/character/${this.testCharacter._id}`)
        .set({'Authorization': `Bearer ${this.hackerToken}`})
        .expect(401);
    });
  });
});
