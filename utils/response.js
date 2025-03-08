const sendResponse = (res, statusCode, data, message, error) => {
    res.status(statusCode).json({
      status: statusCode,
      data,
      message,
      error,
    });
  };
  
  module.exports = { sendResponse };
  