# Netlify Deployment Guide

Everything is configured and your first git commit is ready. Follow these steps to deploy.

---

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., `ai-roadmap`)
3. Set it to **Private** (your Supabase keys are in env vars, but private is safer)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)

## Step 2: Push Your Code to GitHub

Run these commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-roadmap.git
git branch -M main
git push -u origin main
```

> [!NOTE]
> Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign up / log in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify to access your repos
4. Select the `ai-roadmap` repository
5. Netlify will auto-detect the settings from your `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `build/client`
6. Before clicking "Deploy", go to **"Advanced build settings"** and add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

7. Click **"Deploy site"**

> [!IMPORTANT]
> Your app uses `NEXT_PUBLIC_` prefix for env vars (configured in `vite.config.ts`). Make sure to use exactly these variable names on Netlify.

## Step 4: Update Supabase Auth Redirect URL

After Netlify assigns your site URL (e.g., `https://your-site.netlify.app`):

1. Go to your **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Redirect URLs**:
   ```
   https://your-site.netlify.app
   https://your-site.netlify.app/**
   ```
3. This ensures Google OAuth redirects work on the deployed site

---

## Adding Future Features (Continuous Deployment)

Since Netlify is connected to your GitHub repo, every push to `main` will **auto-deploy**. Your workflow for new features:

```bash
# 1. Create a feature branch
git checkout -b feature/my-new-feature

# 2. Make your changes, then commit
git add -A
git commit -m "Add my new feature"

# 3. Push to GitHub
git push origin feature/my-new-feature

# 4. Create a Pull Request on GitHub (optional but recommended)
# Netlify will create a "Deploy Preview" for each PR automatically!

# 5. Merge to main (via GitHub PR or direct push)
git checkout main
git merge feature/my-new-feature
git push origin main
# → Netlify auto-deploys in ~30 seconds
```

> [!TIP]
> Netlify creates **Deploy Previews** for every Pull Request. This lets you test changes on a temporary URL before merging to production. Perfect for reviewing new features!

---

## Project Structure Recap

```
ai-roadmap/
├── netlify.toml          ← Netlify build config
├── react-router.config.ts ← SPA mode (ssr: false)
├── package.json          ← build script added
├── .gitignore            ← env files, node_modules, build excluded
├── src/                  ← Your app code
└── supabase/             ← Database schema & seed data
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Check that env vars are set in Netlify dashboard |
| 404 on page refresh | The `[[redirects]]` in `netlify.toml` handles this (SPA fallback) |
| Google login not working | Add your Netlify URL to Supabase Auth redirect URLs |
| Build fails | Check Netlify build logs; ensure Node 20 is being used |
