const fs = require("fs");
const http = require("http");
const path = require("path");

const port = 3000;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript"
};
const sendFile = (res, filename) => {
  const filepath = path.join(__dirname, "..", "viewer", filename);
  if (!fs.existsSync(filepath)) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("404");
    return;
  }

  const ext = path.extname(filename);
  if (mimeTypes.hasOwnProperty(ext)) {
    res.writeHead(200, { "Content-Type": mimeTypes[ext] });
  } else {
    console.log(`Unknown mime type for extension ${ext}`);
  }

  fs.createReadStream(filepath).pipe(res);
};

const showStatic = (req, res) => {
  sendFile(res, req.url.substr(1));
};
const showIndex = (req, res) => {
  sendFile(res, "index.html");
};

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    showIndex(req, res);
  } else {
    showStatic(req, res);
  }
});

server.listen(port, "localhost", () => {
  console.log(`faces.js viewer running at http://localhost:${port}`);

  require("./watch");
});
