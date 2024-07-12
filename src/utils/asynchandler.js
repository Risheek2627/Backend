//  we will be using this everywere

const asyncHandeler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandeler };

/*
const asyncHandeler = (func) => async (req, res, next) => {
  //This is a higher-order function that takes a function func as an argument and returns a new asynchronous function.

  try {
    await func(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  } //higer order function
};
*/
