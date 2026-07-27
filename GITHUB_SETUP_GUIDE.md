# GitHub Repository & CI/CD Deployment Guide

This guide details how to link your local workspace to GitHub, push the code, and configure GitHub Pages to run your automated build, deployment, and Selenium test suites.

---

## 📦 Step 1: Link and Push Code to GitHub

1. Open your terminal in the `final app` directory.
2. Run the following commands to add, commit, and push your code:
   ```powershell
   # Add all files to staging (including workflows and E2E frameworks)
   git add .

   # Commit the changes
   git commit -m "feat: integrate 4-digit static mPIN login, POM testing framework, and CI/CD pipelines"

   # Set your default branch to main
   git branch -M main

   # Add your GitHub remote (Replace <username> and <repository-name> with yours)
   git remote add origin https://github.com/<username>/<repository-name>.git

   # Push to GitHub
   git push -u origin main
   ```

---

## ⚙️ Step 2: Configure GitHub Repository Settings

For the CI/CD pipeline to deploy successfully, you must configure two settings in your GitHub repository:

### 1. Enable GitHub Pages via Actions
1. Go to your repository page on GitHub.
2. Click on the **Settings** tab (the gear icon on the top menu).
3. In the left-hand sidebar under "Code and automation", click **Pages**.
4. Under **Build and deployment** -> **Source**, click the dropdown and select **GitHub Actions**.

### 2. Enable Read and Write Permissions for Workflows
1. Inside **Settings**, click **Actions** -> **General** from the left-hand sidebar.
2. Scroll to the bottom of the page to find **Workflow permissions**.
3. Select **Read and write permissions**.
4. Click **Save**.

---

## 🚀 Step 3: Trigger the Pipeline

Once the settings are configured and the code is pushed:
1. Go to the **Actions** tab on your GitHub repository.
2. You will see the **Deploy and E2E Test Pipeline** trigger automatically!
3. After the run finishes:
   * Your application will be live at: `https://<github-username>.github.io/<repository-name>/`
   * Excel and HTML test reports, logs, and screenshots will be available as downloadable zip files in the **Artifacts** section of the run details page!
   * The complete E2E execution metrics will be printed directly in the **Workflow Run Summary**!
