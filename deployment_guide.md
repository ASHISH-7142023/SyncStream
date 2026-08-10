# SyncStream Production Deployment Guide

This guide walks you through deploying SyncStream to live production environments using **Vercel** (frontend), **Render** (backend JVM Docker service), **MongoDB Atlas** (database), and **Upstash Redis** (caching and Pub/Sub).

---

## Step 1: Provision the Production Databases

### A. MongoDB Atlas (Database)
1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free Shared Cluster (M0 tier) named `SyncStreamCluster`.
3. In **Database Access**, create a user (e.g. `syncstream_admin`) with a secure password and select "Read and write to any database".
4. In **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so that Render containers can connect.
5. Click **Connect** -> **Drivers**, and copy the connection string. It will look like:
   ```text
   mongodb+srv://syncstream_admin:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   *(Keep this string handy; replace `<password>` with your database user's password).*

### B. Upstash Redis (caching / Pub/Sub)
1. Sign up/log in at [Upstash Console](https://console.upstash.com).
2. Click **Create Database**.
3. Set name to `syncstream-redis`, choose a region near your Render deployment, and click **Create**.
4. Scroll to the **Details** section and note down:
   - **Host** (e.g. `shared-redis.upstash.io`)
   - **Port** (e.g. `6379`)
   - **Password**
   *(These will be passed to your Spring Boot environment variables).*

---

## Step 2: Deploy the Java Backend (Render)

We will use **Render** to run the Spring Boot Docker container. It automatically builds the code using the multi-stage `Dockerfile` in the `/backend` directory.

1. Sign up/log in at [Render](https://render.com).
2. Click **New** -> **Web Service**.
3. Choose **Build and deploy from a Git repository**, and select your repo `SyncStream`.
4. Configure the Web Service settings:
   - **Name**: `syncstream-backend`
   - **Root Directory**: `backend` *(CRITICAL: Tell Render to build from the /backend directory)*
   - **Language**: `Docker` *(Render will read your Dockerfile)*
   - **Instance Type**: `Web Service` (Free or Hobby)
5. Click **Advanced** and add the following **Environment Variables**:
   - `PORT` = `8080`
   - `SPRING_DATA_MONGODB_URI` = *(Your MongoDB Atlas connection string)*
   - `SPRING_DATA_REDIS_HOST` = *(Your Upstash Redis Host)*
   - `SPRING_DATA_REDIS_PORT` = *(Your Upstash Redis Port)*
   - `SPRING_DATA_REDIS_PASSWORD` = *(Your Upstash Redis Password)*
   - `JWT_SECRET` = *(Generate a secure 64-character hex or string value to satisfy HS256 constraints)*
   - `FRONTEND_URL` = `https://your-vercel-app-url.vercel.app` *(You will update this once the Vercel URL is generated)*
6. Click **Create Web Service**. Render will pull the repo, run Maven package inside the builder layer, and boot the JRE image.
7. Once successfully started, Render will provide a public URL (e.g. `https://syncstream-backend.onrender.com`).

---

## Step 3: Deploy the React Frontend (Vercel)

1. Sign up/log in at [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your `SyncStream` GitHub repository.
4. Configure the Project settings:
   - **Root Directory**: `frontend` *(CRITICAL: Tell Vercel to build from the /frontend directory)*
   - **Framework Preset**: `Vite`
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://syncstream-backend.onrender.com` *(Your Render Service URL)*
   - `VITE_WS_URL` = `wss://syncstream-backend.onrender.com/ws` *(Secure WSS endpoint)*
6. Click **Deploy**. Vercel will compile the assets and serve the SPA.
7. Once deployed, note down the frontend URL (e.g. `https://syncstream.vercel.app`), return to your **Render Dashboard**, and update the `FRONTEND_URL` environment variable to match it.

---

## Step 4: Final Production Verification

1. Open your Vercel URL in Browser A, register a user, and enter the `#general` chat room.
2. Open the URL in Browser B (incognito), login as another user, and join the same room.
3. Validate:
   - **Typing Indicator**: When typing in Browser A, Browser B shows "User is typing...".
   - **Real-Time Delivery**: Messages appear instantly.
   - **Presence**: The sidebar displays correct green/gray online/offline user states.
   - **Persistence**: Reloading Browser A preserves chat history.
