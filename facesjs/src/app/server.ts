// server.ts
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import WebSocket, { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
// If "./watch" is your custom module, ensure it's also converted to TypeScript or correctly typed
require('./watch');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        // Serve the Next.js application on HTTP
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });

    // WebSocket server for live reloading
    const wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket as any, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    let connections: WebSocket[] = [];
    wss.on('connection', (ws: WebSocket) => {
        connections.push(ws);
        ws.on('message', (message: string) => {
            console.log(`Received message => ${message}`);
        });
        ws.on('close', () => {
            connections = connections.filter(conn => conn !== ws);
        });
    });

    // Use chokidar to watch for file changes and notify clients
    chokidar.watch(path.join(__dirname, 'pages'), { ignoreInitial: true }).on('all', () => {
        connections.forEach(ws => ws.send('reload'));
    });
});
