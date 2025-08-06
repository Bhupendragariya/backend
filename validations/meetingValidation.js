import Joi from "joi"

export const addMeetingSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  //---
});

export const addMeetingTypeSchema = Joi.object({
  name: Joi.string().required(),
});

