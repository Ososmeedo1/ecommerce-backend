export const validationMessages = (field) => {

  const fieldMessages = {
    "any.required": `${field} is required`,
    "string.min": `Min ${field} length is 3`,
    "string.max": `Max ${field} length is 20`,
    "string.base": `${field} must be string`,
    "string.email": `${field} is not valid`
  }


  return fieldMessages;
}