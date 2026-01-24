export const validationMessages = (field, type, min = null, max = null, custom = null) => {
  
  
  const baseMessages = {
    "any.required": `${field} is required`,
    "any.empty": `${field} must not be empty`,
    "any.only": custom ? custom : `${field} must match the allowed value`,
    "any.invalid": `${field} contains invalid value`,
  };

  
  const typeMessages = {
    string: {
      "string.base": `${field} must be a string`,
      "string.empty": `${field} must not be empty`,
      ...(min && { "string.min": `Minimum ${field} length is ${min}` }),
      ...(max && { "string.max": `Maximum ${field} length is ${max}` }),
      "string.email": `${field} must be a valid email`,
      "string.pattern.base": custom || `${field} format is invalid`,
      "string.alphanum": `${field} must contain only letters and numbers`,
      "string.uri": `${field} must be a valid URL`,
    },

    number: {
      "number.base": `${field} must be a number`,
      ...(min && { "number.min": `${field} must be at least ${min}` }),
      ...(max && { "number.max": `${field} must be at most ${max}` }),
      "number.integer": `${field} must be an integer`,
    },

    boolean: {
      "boolean.base": `${field} must be true or false`,
    },

    date: {
      "date.base": `${field} must be a valid date`,
      ...(min && { "date.min": `${field} must not be before ${min}` }),
      ...(max && { "date.max": `${field} must not be after ${max}` }),
    },

    array: {
      "array.base": `${field} must be an array`,
      ...(min && { "array.min": `${field} must contain at least ${min} items` }),
      ...(max && { "array.max": `${field} must not contain more than ${max} items` }),
    },

    object: {
      "object.base": `${field} must be an object`,
      "object.unknown": `${field} contains unknown keys`
    }
  };

  const selectedTypeMessages = typeMessages[type] || {};

  
  return {
    ...selectedTypeMessages,
    ...baseMessages,
  };
};

