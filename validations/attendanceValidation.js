import Joi from 'joi';

export const editAttendanceSchema = Joi.object({
  date: Joi.date().optional(),

  status: Joi.string().valid('Present', 'Absent', 'On Leave', 'WFH').optional(),

  //  HH:MM format =19:30
  punchInTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/).optional(),
  punchOutTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/).optional(),

  locationType: Joi.string().valid('Online', 'Offline', 'N/A').optional(),

  notes: Joi.string().optional(),
})

// (/^([0-1][0-9] | 2[0-3]    ) : ([0-5][0-9])$/)
// (  (hour 00-19 | hour 20-23) : (min 00-59)   )