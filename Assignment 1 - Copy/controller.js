const connector = require("./query");

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

require('dotenv').config();

// sign up

const signup = async (req, res, next) => {
  try {
    console.log("Signup API called");

    // Extract user data from the request body
    const { email, password } = req.body;
    console.log("req body", req.body);

    // Check for missing fields
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing Field(s): ${missingFields.join(", ")}`,
        error: null,
      });
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Invalid email format.",
        error: null,
      });
    }

    // Check if the email already exists
    const existingUser = await connector.getUserByEmail(email);
    console.log("existing user", existingUser);
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Email already exists.",
        error: null,
      });
    }

    // Hash the password using Node.js crypto module
    const hashedPassword = crypto
      .createHash('sha256') // Using SHA-256 algorithm
      .update(password)
      .digest('hex'); // Converts the hash to a hexadecimal string
    console.log("The data is hashed password", hashedPassword);

    // Save the user data into the database
    await connector.createUser(email, hashedPassword);

    // Success response
    res.status(201).json({
      status: 201,
      data: null,
      message: "User created successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in signup API:", error);

    // Catch-all error response
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

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
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing Field(s): ${missingFields.join(", ")}`,
        error: null,
      });
    }

    // Check if the email exists
    const existingUser = await connector.getUserByEmail(email);
    console.log("existing user", existingUser);
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    // Validate password (Here we're comparing hashed password, so make sure to hash the input password)
    const hashedPassword = crypto
      .createHash('sha256') // Using SHA-256 algorithm
      .update(password)
      .digest('hex'); // Converts the hash to a hexadecimal string

    if (hashedPassword !== existingUser.password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Invalid password.",
        error: null,
      });
    }

    // Generate JWT token (You can replace this with your preferred JWT library)
    const token = jwt.sign({ email: existingUser.email_id, id: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Success response
    res.status(200).json({
      status: 200,
      data: {
        token,
      },
      message: "Login successful.",
      error: null,
    });
  } catch (error) {
    console.error("Error in login API:", error);

    // Catch-all error response
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const getAllArtists = async (req, res, next) => {
  try {
    console.log("getAllArtists controller called");

    const results = await connector.getAllArtists();
    const Admin_verification = "artist_verification";
    console.log(results, "results");

    if (typeof results === "number") {
      return next(results);
    }

    const responseData = {
      results,
      Admin_verification,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in getAllArtists:", error);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token after "Bearer "

    if (!token) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing token.",
        error: null,
      });
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    const email = decoded.email; // Assuming email is part of the payload
    console.log("Decoded Mail", decoded)
    console.log("getAll Users controller called");

    const existingUser = await connector.getUserByEmail(email);
    console.log("existing user", existingUser);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    const results = await connector.getAllUsers();
    const Admin_verification = "artist_verification";
    console.log(results, "results");

    if (typeof results === "number") {
      return next(results);
    }

    const responseData = {
      results,
      Admin_verification,
    };

    res.status(200).json({
      status: 200,
      data: responseData,
      message: "Users retrieved successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const getArtistById = async (req, res, next) => {
  try {
    console.log("Retrieve Artist API called");

    // Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    // Verify token and decode payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded",decoded)
    } catch (error) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access",
        error: "Invalid token or signature",
      });
    }

    // Extract artist ID from request parameters
    const { id } = req.params;

    // Fetch artist details from the database
    const artist = await connector.getArtistById(id); // Assuming `connector.getArtistById` fetches artist data
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist Not Found",
        error: null,
      });
    }

    // Return success response
    res.status(200).json({
      status: 200,
      data: artist,
      message: "Artist retrieved successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in getArtistById API:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const getAlbumById = async (req, res, next) => {
  try {
    console.log("Retrieve Album API called");

    // Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    // Verify token and decode payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded",decoded)
    } catch (error) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access",
        error: "Invalid token or signature",
      });
    }

    // Extract artist ID from request parameters
    const { id } = req.params;

    // Fetch artist details from the database
    const artist = await connector.getAlbumsById(id); // Assuming `connector.getArtistById` fetches artist data
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album Not Found",
        error: null,
      });
    }

    // Return success response
    res.status(200).json({
      status: 200,
      data: artist,
      message: "Album retrieved successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in getArtistById API:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const getTrackById = async (req, res, next) => {
  try {
    console.log("Retrieve Track API called");

    // Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    // Verify token and decode payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded",decoded)
    } catch (error) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access",
        error: "Invalid token or signature",
      });
    }

    // Extract artist ID from request parameters
    const { id } = req.params;

    // Fetch artist details from the database
    const artist = await connector.getTrackById(id); // Assuming `connector.getArtistById` fetches artist data
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track Not Found",
        error: null,
      });
    }

    // Return success response
    res.status(200).json({
      status: 200,
      data: artist,
      message: "Track retrieved successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in getArtistById API:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};


const addUser = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming email is part of the payload
    console.log("Decoded Mail", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Only admins can add users.",
        error: null,
      });
    }

    // Extract new user data from the request body
    const { email_id, password, role: newUserRole } = req.body;

    // Validate request body
    if (!email_id || !password || !newUserRole) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing required fields.",
        error: null,
      });
    }
    

    // Add the new user
    const result = await connector.insertUser(email_id, password, newUserRole);

    console.log("New user added:", result);

    res.status(201).json({
      status: 201,
      data: { id: result.insertId, email_id },
      message: "User created successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in addUser:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming email is part of the payload
    console.log("Decoded Mail:", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Only admins can delete users.",
        error: null,
      });
    }

    // Get user ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing user ID.",
        error: null,
      });
    }

    // Check if the user exists
    const userToDelete = await connector.getUserById(id);

    if (!userToDelete) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    // Delete the user
    const result = await connector.deleteUser(id);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not delete user.",
        error: null,
      });
    }

    console.log("User deleted:", result);

    res.status(200).json({
      status: 200,
      data: { id },
      message: "User deleted successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email
    console.log("Decoded Email:", decoded);

    // Fetch the user by email
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { id: userId, password: existingPassword } = existingUser;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: Missing old or new password.",
        error: null,
      });
    }

    // Verify the old password
    const isPasswordMatch = await bcrypt.compare(old_password, existingPassword);
    if (!isPasswordMatch) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Incorrect old password.",
        error: null,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password
    const result = await connector.updatePassword(userId, hashedPassword);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not update password.",
        error: null,
      });
    }

    console.log("Password updated successfully:", result);

    res.status(204).send(); // No content for successful update
  } catch (error) {
    console.error("Error in updateUserPassword:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message || null,
    });
  }
};

const addArtist = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email
    console.log("Decoded Token Payload:", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Only admins can add artists.",
        error: null,
      });
    }

    // Extract artist details from the request body
    const { name, grammy, hidden } = req.body;

    if (!name || grammy === undefined || hidden === undefined) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing required fields: name, grammy, hidden.",
        error: null,
      });
    }

    // Add the artist to the database
    const result = await connector.addArtist(name, grammy, hidden);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not add artist.",
        error: null,
      });
    }

    res.status(201).json({
      status: 201,
      data: { id: result.insertId, name, grammy, hidden },
      message: "Artist created successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in addArtist:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};

const addAlbum = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email
    console.log("Decoded Token Payload:", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Only admins can add albums.",
        error: null,
      });
    }

    // Extract album details from the request body
    const { artist_id, name, year, hidden } = req.body;

    if (!artist_id || !name || !year || hidden === undefined) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing required fields: artist_id, name, year, hidden.",
        error: null,
      });
    }

    // Verify if the artist exists
    const artist = await connector.getArtistById(artist_id);

    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist. Artist not found.",
        error: null,
      });
    }

    // Add the album to the database
    const result = await connector.addAlbum(artist_id, name, year, hidden);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not add album.",
        error: null,
      });
    }

    res.status(201).json({
      status: 201,
      data: { id: result.insertId, artist_id, name, year, hidden },
      message: "Album created successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in addAlbum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};

const addTrack = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      // Decode the token
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email
    console.log("Decoded Token Payload:", decoded);

    // Verify if the token belongs to an admin user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '1' is for admin
    if (role !== 1) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Only admins can add tracks.",
        error: null,
      });
    }

    // Extract track details from the request body
    const { artist_id, album_id, name, duration, hidden } = req.body;

    if (!artist_id || !album_id || !name || !duration || hidden === undefined) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing required fields: artist_id, album_id, name, duration, hidden.",
        error: null,
      });
    }

    // Verify if the artist exists
    const artist = await connector.getArtistById(artist_id);

    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist. Artist not found.",
        error: null,
      });
    }

    // Verify if the album exists
    const album = await connector.getAlbumById(album_id);

    if (!album) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist. Album not found.",
        error: null,
      });
    }

    // Add the track to the database
    const result = await connector.addTrack(artist_id, album_id, name, duration, hidden);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not add track.",
        error: null,
      });
    }

    res.status(201).json({
      status: 201,
      data: { id: result.insertId, artist_id, album_id, name, duration, hidden },
      message: "Track created successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in addTrack:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};


const deleteAlbum = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email

    // Verify if the token belongs to a valid user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '3' is restricted (e.g., regular user)
    if (role === 3) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Users with role 3 cannot delete albums.",
        error: null,
      });
    }

    // Get album ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing album ID.",
        error: null,
      });
    }

    // Check if the album exists
    const albumToDelete = await connector.getAlbumById(id);

    if (!albumToDelete) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    // Delete the album
    const result = await connector.deleteAlbum(id);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not delete album.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: { id },
      message: "Album deleted successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in deleteAlbum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};


const deleteTrack = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email

    // Verify if the token belongs to a valid user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '3' is restricted (e.g., regular user)
    if (role === 3) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Users with role 3 cannot delete tracks.",
        error: null,
      });
    }

    // Get track ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing track ID.",
        error: null,
      });
    }

    // Check if the track exists
    const trackToDelete = await connector.getTrackById(id);

    if (!trackToDelete) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    // Delete the track
    const result = await connector.deleteTrack(id);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not delete track.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: { id },
      message: "Track deleted successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in deleteTrack:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};

const deleteArtist = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Missing token.",
        error: null,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    } catch (err) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Unauthorized Access. Invalid or expired token.",
        error: null,
      });
    }

    const email = decoded.email; // Assuming the token payload includes the email

    // Verify if the token belongs to a valid user
    const existingUser = await connector.getUserByEmail(email);

    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const { role } = existingUser;

    // Role checking - assuming '3' is restricted (e.g., regular user)
    if (role === 3) {
      return res.status(403).json({
        status: 403,
        data: null,
        message: "Forbidden Access. Users with role 3 cannot delete artists.",
        error: null,
      });
    }

    // Get artist ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request. Missing artist ID.",
        error: null,
      });
    }

    // Check if the artist exists
    const artistToDelete = await connector.getArtistById(id);

    if (!artistToDelete) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    // Delete the artist
    const result = await connector.deleteArtist(id);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: "Internal Server Error. Could not delete artist.",
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: { id },
      message: "Artist deleted successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Error in deleteArtist:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error.",
      error: error.message || null,
    });
  }
};











  

module.exports = { getAllArtists, signup, login, getAllUsers, getArtistById, getAlbumById, getTrackById };



