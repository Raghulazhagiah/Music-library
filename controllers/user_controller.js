const { verifyToken, extractToken } = require('../auth/auth');
const { sendResponse } = require('../utils/response');
const connector = require('../models/user_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require("bcrypt");

const login = async (req, res, next) => {
    try {
      console.log("Login API called");
  
      // Extract user data from the request body
      const { email, password } = req.body;
      console.log("req body", req.body);
  
      // Check for missing fields
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
  
      if (missingFields.length > 0) {
        return sendResponse(res, 400, null, `Bad Request, Reason: Missing Field(s): ${missingFields.join(", ")}`, "null");
        
      }
  
      // Check if the email exists
      const existingUser = await connector.getUserByEmail(email);
      console.log("existing user", existingUser);
      if (!existingUser) {
        return sendResponse(res, 404, null, "User not found.", "null");
        
      }
  
      // Validate password (Here we're comparing hashed password, so make sure to hash the input password)
      const hashedPassword = crypto
        .createHash('sha256') // Using SHA-256 algorithm
        .update(password)
        .digest('hex'); // Converts the hash to a hexadecimal string
  
      if (password !== existingUser.password) {
        return sendResponse(res, 400, null, "Bad Request, Reason: Invalid password.", "null");
        
      }
  
      // Generate JWT token (You can replace this with your preferred JWT library)
      const token = jwt.sign({ email: existingUser.email_id, id: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const addToken = await connector.insert_token(token); 
      // Success response
      return sendResponse(res, 200, token, "Login successful.", "null");
      
    } catch (error) {
      console.error("Error in login API:", error);
  
      // Catch-all error response
      return sendResponse(res, 500, null, "Internal Server Error", error.message || null);
      
    }
  };

const getAllUser = async (req, res) => {
    try {
      console.log("Get all user API called");
  
      // Extract token
      const token = extractToken(req.headers.authorization);
  
      if (!token) {
        return sendResponse(res, 401, null, "Unauthorized Access", null);
      }  
      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return sendResponse(res, 403, null, "Forbidden Access", "Invalid token or signature");
      }

       const email = decoded.email;
          const existingUser = await connector.getUserByEmail(email);
      
          if (!existingUser) {
            return sendResponse(res, 404, null, "User not found.", null);
          }
      
          const { role } = existingUser;
      
          // Role checking - assuming '3' is restricted (e.g., regular user)
          if (role !== 1) {
            return sendResponse(res, 403, null, "Forbidden Access. Users with role 3 or 2 cannot delete artists.", null);
          }
      
      const users = await connector.getAllUsers();
  
      if (!users) {
        return sendResponse(res, 404, null, "Bad Request", null);
      }
  
      // Return success response
      sendResponse(res, 200, users, "Users retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getAlbumById API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
};   

const addUser = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return sendResponse(res, 401, null, "Unauthorized Access. Missing token.", null);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendResponse(res, 401, null, "Unauthorized Access. Invalid or expired token.", null);
    }

    const email = decoded.email; // Assuming the token payload includes the email
    console.log("Decoded Token Payload:", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email); 
    const { role } = existingUser;
    console.log("role is",role)

    if (role !== 1) {
      return sendResponse(res, 401, null, "Forbidden Access. Only admins and editors can add artists.", null)      
    }

    const { email_id, password, role_id } = req.body;

    if (!email_id === undefined ) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields:", null)      

      
    }
     const result = await connector.insertUser_by_admin(email_id,password,role_id);
   
       
   
       res.status(201).json({
         status: 201,
         data: null,
         message: "Track created successfully.",
         error: null,
       });

  } catch (error) {
    console.error("Error in Adding album:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return sendResponse(res, 401, null, "Unauthorized Access. Missing token.", null);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendResponse(res, 401, null, "Unauthorized Access. Invalid or expired token.", null);
    }

    const email = decoded.email;
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return sendResponse(res, 404, null, "User not found.", null);
    }

    const { role } = existingUser;

    // Role checking - assuming '3' is restricted (e.g., regular user)
    if (role !== 1) {
      return sendResponse(res, 403, null, "Forbidden Access. Users with role 3 cannot delete artists.", null);
    }

    const { id } = req.params;

    if (!id) {
      return sendResponse(res, 400, null, "Bad Request. Missing user ID.", null);
    }

    const userToDelete = await connector.getUserById(id);

    if (!userToDelete) {
      return sendResponse(res, 404, null, "User not found.", null);
    }

    const result = await connector.deleteUser(id);

    

    sendResponse(res, 200, { id }, "User deleted successfully.", null);
  } catch (error) {
    console.error("Error in delete User:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
}; 

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Missing token.",
        data: null,
        error: null,
      });
    }

    console.log("Token to invalidate:", token);

    // Call deleteToken with the token to invalidate it
    const result = await connector.deleteToken(token);

    if (!result) {
      return res.status(404).json({
        status: 404,
        message: "Token not found.",
        data: null,
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "User logged out successfully.",
      data: null,
      error: null,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
      data: null,
      error: error.message,
    });
  }
};


const signupUser = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    // Validate request body
    if (!email_id || !password) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Missing required fields: email and password.",
        data: null,
        error: null,
      });
    }

    // Check if the email already exists
    const existingUser = await connector.getUserByEmail(email_id);
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Conflict. Email already exists.",
        data: null,
        error: null,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const newUser = await connector.insertUser(email_id, hashedPassword);

    return res.status(201).json({
      status: 201,
      message: "User created successfully.",
      data: {
        id: newUser.id,
        email: newUser.email_id,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
      data: null,
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized Access. Missing token.",
        data: null,
        error: null,
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized Access. Invalid or expired token.",
        data: null,
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token includes the user's email
    const { old_password, new_password } = req.body;

    // Validate request body
    if (!old_password || !new_password) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request. Missing required fields: old_password and new_password.",
        data: null,
        error: null,
      });
    }

    // Get user details from the database
    const user = await connector.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found.",
        data: null,
        error: null,
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden Access. Incorrect old password.",
        data: null,
        error: null,
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password in the database
    const result = await connector.updatePassword(email, hashedNewPassword);

    if (!result) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error. Could not update password.",
        data: null,
        error: null,
      });
    }

    return res.status(204).send(); // No content, password updated successfully
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
      data: null,
      error: error.message,
    });
  }
};






  


  module.exports = { login, getAllUser, addUser, deleteUser, logoutUser, signupUser, updatePassword  };
