const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Quran Tracker Server is working"
    });
});

app.listen(PORT, "0.0.0.0", function () {
    console.log("Server is running on port " + PORT);
});