// Define the asyncHandler function with a named function `reser`
function asyncHandler(requestHandler) {
  return function reser(req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
}

// Define an asynchronous function that may throw an error
async function myAsyncFunction(req, res, next) {
  // Simulate an async operation
  const data = await someAsyncOperation();
  return data; // Simulate sending data as response
}

// Define a function to simulate async operation
async function someAsyncOperation() {
  // Simulate an async operation that throws an error
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Something went wrong"));
    }, 1000);
  });
}

// Define an error handler function
function errorHandler(err) {
  console.error("Error:", err.message);
}

// Use asyncHandler to wrap the asynchronous function
const handler = asyncHandler(myAsyncFunction);

// Simulate a request handling scenario
handler(null, null, errorHandler);
