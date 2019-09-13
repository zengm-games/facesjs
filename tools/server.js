const chokidar = require("chokidar");
const fs = require("fs");
const http = require("http");
const open = require("open");
const path = require("path");
const WebSocket = require("ws");
require("./watch");

const runHTTPServer = () => {
  const port = 3000;

  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript"
  };
  const sendFile = (res, filename) => {
    const filepath = path.join(__dirname, "..", "public", filename);
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

  server.listen(port, "localhost", async () => {
    console.log(`faces.js running at http://localhost:${port}`);
    await open(`http://localhost:${port}/editor.html`);
  });
};

// Reload page on change
const runWebSocketServer = () => {
  const wss = new WebSocket.Server({ port: 3001 });

  let connections = [];
  wss.on("connection", connection => {
    connections.push(connection);
    connection.send("foo");
    connection.on("close", () => {
      connections = connections.filter(
        connection2 => connection2 !== connection
      );
    });
  });

  chokidar
    .watch(path.join(__dirname, "..", "public"), {
      ignoreInitial: true
    })
    .on("all", (event, path) => {
      // Ignore this, it'll be included in bundle and trigger another one
      if (path.includes("public/bundle.js")) {
        return;
      }

      for (connection of connections) {
        connection.send("reload");
      }
    });
};

runWebSocketServer();
runHTTPServer();
