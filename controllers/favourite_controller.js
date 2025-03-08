const { verifyToken, extractToken } = require('../auth/auth');
const { sendResponse } = require('../utils/response');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connector = require('../models/favourite_model')
const user_connector = require('../models/user_model')

const addFavorite = async (req, res) => {
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
  
      const decoded = verifyToken(token); // Validate the token
      if (!decoded) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized Access. Invalid or expired token.",
          data: null,
          error: null,
        });
      }
  
      const email = decoded.email; // Extract the email from the token
      const { category, item_id } = req.body;
  
      if (!category || !item_id) {
        return res.status(400).json({
          status: 400,
          message: "Bad Request. Missing required fields: category or item_id.",
          data: null,
          error: null,
        });
      } 
     
  
      // Add the favorite to the database
      const result = await connector.addFavorite(email, category, item_id);
  
      res.status(201).json({
        status: 201,
        message: "Favorite item added successfully.",
        data: result,
        error: null,
      });
    } catch (error) {
      console.error("Error in adding favorite:", error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error.",
        data: null,
        error: error.message,
      });
    }
  };


const removeFavorite = async (req, res) => {
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

    
    

    const { favorite_id } = req.params;
    

    const favoriteToRemove = await connector.getFavoriteById(favorite_id);

    if (!favoriteToRemove) {
      return sendResponse(res, 404, null, "Track not found.", null);
    }

    const result = await connector.deleteTrack(favorite_id);

    

    sendResponse(res, 200, {favorite_id: favorite_id} , "Favorite deleted successfully.", null);
  } catch (error) {
    console.error("Error in delete Track:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};  

const getFavorites = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Extract token
  
      if (!token) {
        return res.status(400).json({
          status: 400,
          message: "Unauthorized Access",
          data: null,
          error: null,
        });
      }
  
      const decoded = verifyToken(token); // Validate the token
      if (!decoded) {
        return res.status(401).json({
          status: 401,
          message: "Forbidden Access.",
          data: null,
          error: null,
        });
      }
  
      const email = decoded.email; // Extract user email from the token
      const { category } = req.params; // Get category from path params
      const limit = parseInt(req.query.limit, 10) || 5; // Default limit to 5
      const offset = parseInt(req.query.offset, 10) || 0; // Default offset to 0  
      
  
      // Fetch the favorites from the database
      const result = await connector.getFavoritesByCategory(email, category, limit, offset);

      if(!result){
        return res.status(401).json({
            status: 404,
            message: " Resource Doesn't Exist.",
            data: null,
            error: null,
          });
      }
  
      res.status(200).json({
        status: 200,
        message: "Favorites retrieved successfully.",
        data: result,
        error: null,
      });
    } catch (error) {
      console.error("Error in retrieving favorites:", error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error.",
        data: null,
        error: error.message,
      });
    }
  };
  


  module.exports = {addFavorite, removeFavorite, getFavorites}
  