/**
 * express-validator result handler
 * Use after validation chains: router.post('/', [...validators], validate, controller)
 */
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, messages[0], errors.array());
  }
  next();
};

module.exports = validate;
