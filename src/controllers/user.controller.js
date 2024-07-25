import { asyncHandeler } from "../utils/asynchandler.js";

const registerUser = asyncHandeler(async (req, res) => {
  res.status(200).json({
    message: "OK",
  });
});

export { registerUser };
