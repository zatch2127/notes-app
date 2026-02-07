const Joi = require('joi');

// Reusable validation schemas
const schemas = {
  user: {
    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().min(2).max(255).required(),
      role: Joi.string().valid('admin', 'editor', 'viewer').optional()
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },
  note: {
    create: Joi.object({
      title: Joi.string().min(1).max(500).required(),
      content: Joi.string().allow('').optional()
    }),
    update: Joi.object({
      title: Joi.string().min(1).max(500).optional(),
      content: Joi.string().allow('').optional()
    }).min(1)
  },
  collaborator: {
    add: Joi.object({
      userId: Joi.string().uuid().required(),
      permission: Joi.string().valid('editor', 'viewer').required()
    }),
    update: Joi.object({
      permission: Joi.string().valid('editor', 'viewer').required()
    })
  },
  search: {
    query: Joi.object({
      q: Joi.string().min(1).required(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional()
    })
  }
};

// Validation middleware factory (reusable)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateQuery
};
