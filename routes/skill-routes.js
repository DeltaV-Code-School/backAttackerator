'use strict';

const Router = require('express');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const Skill = require('../model/skills');
const Character = require('../model/character');
const debug = require('debug')('app:routes/skill');

const router = module.exports = new Router();

router.post('/api/skill/:characterId',jsonParser,(req,res,next) => {
  debug(`/api/skill/${req.params.characterId}`);
  req.body.userId = req.user._id;
  req.body.characterId = req.params.characterId;
  Character.findById(req.params.characterId)
    .then(character => {
      return Skill.createSkill(req.body)
        .then(skill => {
          debug(skill);
          character.skills.push(skill._id);
          character.save();
          res.json(skill);
<<<<<<< f1a8f008a87859e84448141d67dae1da428aa371
=======
          character.save();
>>>>>>> wrote skills PUT route and tested
        });
    })
    .catch(next);
});

router.get('/api/skill/:skillId',function(req,res,next){
  debug(`/api/skill/${req.params.skillId}`);

  return Skill.findById(req.params.skillId)
    .then(skill => {
      if (skill.userId.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${skill.userID})`);
        return next(createError(401, 'permission denied'));
      }
      return res.json(skill);
    });
});

router.put('/api/skill/:skillId',jsonParser,function(req,res,next){
  debug(`/api/skill/${req.params.skillId}`);
  debug(req.body);
  return Skill.findByIdAndUpdate(req.params.skillId,req.body,{ new: true })
    .then(updatedSkill => {
      if (updatedSkill.userId.toString() !== req.user._id.toString()) {
        debug(`permission denied for ${req.user._id} (owner: ${updatedSkill.userID})`);
        return next(createError(401, 'permission denied'));
      }
      debug(updatedSkill);
      res.json(updatedSkill);
    })
    .catch(next);
});
