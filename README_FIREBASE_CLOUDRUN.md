Firebase + Cloud Run deployment steps

1. Enable required APIs in GCP Console:
   - Cloud Build
   - Cloud Run
   - Artifact Registry (or Container Registry)
   - Cloud Run Admin

2. Build and push image (using Cloud Build):
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   gcloud builds submit --config=cloudbuild.yaml .
   ```

3. Deploy image to Cloud Run (if not using cloudbuild step):
   ```bash
   gcloud run deploy nuevo2-service --image gcr.io/YOUR_PROJECT_ID/nuevo2:latest --region us-central1 --platform managed --allow-unauthenticated
   ```

4. Deploy Firebase Hosting rewrites (after setting `firebase.json` with the rewrite to Cloud Run):
   ```bash
   firebase deploy --only hosting
   ```

Notes:
- Ensure `firebase` CLI is installed and you're logged in: `firebase login`.
- Replace `YOUR_PROJECT_ID` with your GCP project id.
- `public` folder can contain static fallback assets; the rewrites send all traffic to Cloud Run.
