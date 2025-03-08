const { verifyToken, extractToken } = require('../auth/auth');
const { sendResponse } = require('../utils/response');
const connector = require('../models/artist_model');
const user_connector = require('../models/user_model')

const getArtistById = async (req, res) => {
    try {
      console.log("Retrieve Artist API called");
  
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
      const artist = await connector.getArtistById(id);
  
      if (!artist) {
        return sendResponse(res, 404, null, "Artist Not Found", null);
      }
  
      // Return success response
      sendResponse(res, 200, artist, "Artist retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getArtistById API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
  };
const deleteArtist = async (req, res) => {
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
      return sendResponse(res, 400, null, "Bad Request. Missing artist ID.", null);
    }

    const artistToDelete = await connector.getArtistById(id);

    if (!artistToDelete) {
      return sendResponse(res, 404, null, "Artist not found.", null);
    }

    const result = await connector.deleteArtist(id);

    if (result.affectedRows === 0) {
      return sendResponse(res, 500, null, "Internal Server Error. Could not delete artist.", null);
    }

    sendResponse(res, 200, { id }, "Artist deleted successfully.", null);
  } catch (error) {
    console.error("Error in deleteArtist:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};

const getAllArtist = async (req, res) => {
    try {
      console.log("Get all artist API called");
  
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
    const grammy = req.query.hidden === 'false' ? 'false' : 'true'; 
    let hidden = req.query.hidden === 'false' ? 'false' : 'true'; 
    console.log(limit,offset,grammy,hidden)
      
      const artist = await connector.getAllArtists(grammy,hidden,limit,offset);
  
      if (!artist) {
        return sendResponse(res, 400, null, "Bad Request", null);
      }
  
      // Return success response
      sendResponse(res, 200, artist, "Artist retrieved successfully.", null);
    } catch (error) {
      console.error("Error in getArtistById API:", error);
      sendResponse(res, 500, null, "Internal Server Error", error.message || null);
    }
}; 

const addArtist = async (req, res) => {
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

    const { name, year, hidden, artist_id } = req.body;

    if (!name || grammy === undefined || hidden === undefined || artist_id === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.addArtist(artist_id, name, year, hidden); 
     
   
       res.status(201).json({
         status: 201,
         data: null ,
         message: "Artist created successfully.",
         error: null,
       });

  } catch (error) {
    console.error("Error in Adding artist:", error);
    sendResponse(res, 500, null, "Internal Server Error.", error.message);
  }
};

const updateArtist = async (req, res) => {
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
    const { name, grammy, hidden } = req.body;

    if (!name === undefined || grammy === undefined || hidden === undefined) {
      return sendResponse(res, 400, null, "Bad Request. Missing required fields: name, grammy, hidden.", null)      

      
    }
     const result = await connector.updateArtist(name, grammy, hidden,id);  

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

module.exports = { getArtistById, deleteArtist, getAllArtist, addArtist, updateArtist};
