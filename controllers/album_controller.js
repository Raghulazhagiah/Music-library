const { verifyToken, extractToken } = require('../auth/auth');
const { sendResponse } = require('../utils/response');
const connector = require('../models/album_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const user_connector = require('../models/user_model')


const getAlbumById = async (req, res) => {
    try {
      console.log("Retrieve Album API called");
  
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
  
      console.log("Decoded Token:", decoded);
  
      // Get artist ID from request parameters
      const { id } = req.params;
  
      // Fetch artist details from the database
      const artist = await connector.getAlbumById(id);
  
      if (!artist) {
        return sendResponse(res, 404, null, "Album Not Found", null);
      }
  
      // Return success response
      sendResponse(res, 200, artist, "Album retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getting Album:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
  };

const deleteAlbum = async (req, res) => {
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
    const existingUser = await user_connector.getUserByEmail(email);

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
      return sendResponse(res, 400, null, "Bad Request. Missing album ID.", null);
    }

    const albumToDelete = await connector.getAlbumById(id);

    if (!albumToDelete) {
      return sendResponse(res, 404, null, "Album not found.", null);
    }

    const result = await connector.deleteAlbum(id);

    

    sendResponse(res, 200, { id }, "Album deleted successfully.", null);
  } catch (error) {
    console.error("Error in delete Album:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};  

const getAllAlbum = async (req, res) => {
    try {
      console.log("Get all album API called");
  
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
      const limit = parseInt(req.query.limit) || 5; 
      const offset = parseInt(req.query.offset) || 0;
      const artist_id = req.query.artist_id; // artist_id should be passed as query param
      const hidden = req.query.hidden === 'false' ? false : true; // hidden is a boolean, 

      const album = await connector.getAllAlbum(artist_id,hidden,limit,offset);
  
      if (!album) {
        return sendResponse(res, 404, null, "Bad Request", null);
      }
  
      // Return success response
      sendResponse(res, 200, album, "Album retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getAlbumById API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
}; 

const addAlbum = async (req, res) => {
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
    const existingUser = await user_connector.getUserByEmail(email); 
    const { role } = existingUser;
    console.log("role is",role)

    if (role !== 1) {
      return sendResponse(res, 401, null, "Forbidden Access. Only admins and editors can add artists.", null)      
    }

    const { artist_id, name, year, hidden } = req.body;

    if (!name || year === undefined || hidden === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.addAlbum(artist_id, name, year, hidden);  
      
   
       res.status(201).json({
         status: 201,
         data: null,
         message: "Album created successfully.",
         error: null,
       });

  } catch (error) {
    console.error("Error in Adding album:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};

const updateAlbum = async (req, res) => {
  try {
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
    const existingUser = await user_connector.getUserByEmail(email); 
    const { role } = existingUser;
    console.log("role is",role)

    if (role === 3) {
      return sendResponse(res, 401, null, "Forbidden Access. Only admins and editors can add artists.", null)      
    }

    const { id } = req.params;
    const { name, year, hidden } = req.body;

    if (!name === undefined || year === undefined || hidden === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.updateAlbum(name, year, hidden,id);  

     if (!result) {
      return sendResponse(res, 400, null, "Artist not found", null);
    }
      
   
       res.status(201).json({
         status: 201,
         data: null,
         message: "Artist updated successfully",
         error: null,
       });

  } catch (error) {
    console.error("Error in Adding album:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};

  module.exports = {getAlbumById, deleteAlbum, getAllAlbum, addAlbum, updateAlbum}