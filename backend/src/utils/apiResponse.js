/**
 * Standardised API Response helpers
 * All endpoints use these to ensure consistent response shape
 */

/**
 * @param {object} res  - Express response
 * @param {number} statusCode
 * @param {string} message
 * @param {*}      data
 * @param {object} meta - pagination / extra metadata
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (Object.keys(meta).length) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
