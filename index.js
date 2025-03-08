const express = require("express");
const bodyParser = require("body-parser");
const artistRoutes = require("./routes/artist_routes");
const userRoutes = require("./routes/user_routes");
const albumRoutes = require("./routes/album_routes")
const trackRoutes = require("./routes/track_routes")
const settingRoutes = require("./routes/setting_routes")
const favoriteRoutes = require("./routes/favourite_routes")
const { sendResponse } = require("./utils/response");

const app = express();
const PORT = 3001;

// app.use((req, res, next) => {
//     console.log('Middleware is working');
//     next();
// });

// Middleware
app.use(bodyParser.json());
app.use(sendResponse);

// Routes
app.use("/artists", artistRoutes);
app.use("/user", userRoutes)
app.use("/albums", albumRoutes)
app.use("/tracks", trackRoutes)
app.use("/favorites",favoriteRoutes)
app.use("/",settingRoutes)

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
