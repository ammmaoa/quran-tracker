// خادم بسيط لتشغيل الموقع على جهازك: node server.js
// ثم افتح في المتصفح: http://localhost:10000
var express = require("express");
var path = require("path");

var app = express();
var PORT = process.env.PORT || 10000;

app.use(express.static(__dirname));

app.get("/api/test", function (req, res) {
  res.json({ success: true, message: "Quran tracker server is running" });
});

app.listen(PORT, function () {
  console.log("الموقع يعمل على: http://localhost:" + PORT);
});
