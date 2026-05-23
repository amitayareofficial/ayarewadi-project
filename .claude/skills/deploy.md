# deploy

Build the client and deploy it to Vercel.

## Steps

1. Build the client:
   ```bash
   cd /home/amit/Music/website/aw-project/client && npm run build
   ```
   Report any build errors before proceeding.

2. Deploy to Vercel from the client directory:
   ```bash
   cd /home/amit/Music/website/aw-project/client && vercel --prod
   ```

3. Report the deployment URL from Vercel's output.

## Notes

- The server runs separately (not deployed here); only the React/Vite client is deployed.
- If the user hasn't linked the project yet (`vercel link`), prompt them to run `! vercel link` first.
- Do not push or deploy unless the build succeeds cleanly.
