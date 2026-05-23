# dev

Start the client and server in development mode.

## Steps

1. Start the Express server:
   ```bash
   cd /home/amit/Music/website/aw-project/server && node index.js
   ```
   Run this in the background (use `run_in_background: true`).

2. Start the Vite dev server:
   ```bash
   cd /home/amit/Music/website/aw-project/client && npm run dev
   ```
   Run this in the background as well.

3. Tell the user both servers are running:
   - Client: http://localhost:5173
   - Server: http://localhost:3000 (or whatever port the server logs)

Monitor the output of both processes and report any startup errors immediately.
