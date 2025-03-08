const { verifyToken, extractToken } = require('../auth/auth');
const { sendResponse } = require('../utils/response');
const connector = require('../models/track_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const user_connector = require('../models/user_model')


const getTrackById = async (req, res) => {
    try {
      console.log("Retrieve Track API called");
  
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
      const track = await connector.getTrackById(id);
  
      if (!track) {
        return sendResponse(res, 404, null, "Track Not Found", null);
      }
  
      // Return success response
      sendResponse(res, 200, track, "Track retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getTrackID API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
  };

const deleteTrack = async (req, res) => {
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
    if (role === 3) {
      return sendResponse(res, 403, null, "Forbidden Access. Users with role 3 cannot delete artists.", null);
    }

    const { id } = req.params;

    if (!id) {
      return sendResponse(res, 400, null, "Bad Request. Missing album ID.", null);
    }

    const artistToDelete = await connector.getTrackById(id);

    if (!artistToDelete) {
      return sendResponse(res, 404, null, "Track not found.", null);
    }

    const result = await connector.deleteTrack(id);

    

    sendResponse(res, 200, {artist_id: id} , "Track deleted successfully.", null);
  } catch (error) {
    console.error("Error in delete Track:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};  

const getAllTrack = async (req, res) => {
    try {
      console.log("Get all track API called");
  
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
      let hidden = req.query.hidden === 'false' ? 'false' : 'true';
      const artistId = req.query.artist_id;
      const albumId = req.query.album_id;
      
      const track = await connector.getAllTrack(hidden,limit,offset,artistId,albumId);
  
      if (!track) {
        return sendResponse(res, 404, null, "Bad Request", null);
      }
  
      // Return success response
      sendResponse(res, 200, track, "Track retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getTrackById API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
}; 

const addTrack = async (req, res) => {
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
      return sendResponse(res, 401, null, "Forbidden access. Only admins and editors can add artists.", null)      
    }

    const { artist_id, album_id, name, duration, hidden } = req.body;

    if (!name || artist_id === undefined || album_id === undefined || name === undefined || duration === undefined || hidden === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.addTrack(artist_id, album_id, name, duration, hidden);
   
      
   
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

const updateTrack = async (req, res) => {
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
    const { name, duration, hidden } = req.body;

    if (!name === undefined || duration === undefined || hidden === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.updateTrack(name, duration, hidden,id);  

     if (!result) {
      return sendResponse(res, 400, null, "Track not found", null);
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


  module.exports = {getTrackById, deleteTrack, getAllTrack, addTrack, updateTrack}