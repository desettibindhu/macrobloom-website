# Macro Bloom - GitHub Pages Deployment Guide

This guide helps you publish the Macro Bloom landing page on GitHub Pages and connect it to the custom GoDaddy domain macrobloom.in.

## 1. Create a GitHub Repository

1. Sign in to GitHub.
2. Create a new repository named `macrobloom-website`.
3. Upload or push the contents of this project folder to the repository.

## 2. Upload Project Files

Make sure the repository contains:
- `index.html`
- `styles.css`
- `script.js`
- `CNAME`
- `robots.txt`
- `sitemap.xml`
- `README.md`

## 3. Enable GitHub Pages

1. Open your repository on GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Choose the `main` branch and the `/root` folder.
5. Click **Save**.

## 4. Add the Custom Domain

1. In **Settings** > **Pages**, enter `www.macrobloom.in` in the **Custom domain** field.
2. Save the changes.
3. GitHub will create or verify the `CNAME` file automatically.

## 5. Configure GoDaddy DNS

Add these DNS records in your GoDaddy domain dashboard:

### A Records
- Host: `@`
- Points to: `185.199.108.153`
- Host: `@`
- Points to: `185.199.109.153`
- Host: `@`
- Points to: `185.199.110.153`
- Host: `@`
- Points to: `185.199.111.153`

### CNAME Record
- Host: `www`
- Points to: `<your-github-username>.github.io`

Example:
- `www` → `yourusername.github.io`

## 6. Redirect `macrobloom.in` to `www.macrobloom.in`

Configure a redirect in GoDaddy so:
- `https://macrobloom.in` → `https://www.macrobloom.in`

You can use GoDaddy forwarding or DNS redirect settings depending on your plan.

## 7. Enable HTTPS

After DNS is configured and GitHub Pages recognizes the custom domain:
1. Return to **Settings** > **Pages**.
2. Enable **Enforce HTTPS**.

## 8. Verify DNS Propagation

Use a DNS checker or terminal command to confirm the records propagate:

```bash
dig www.macrobloom.in
nslookup www.macrobloom.in
```

It may take a few minutes to several hours for changes to fully propagate.

## Expected Final URLs

- https://www.macrobloom.in
- https://macrobloom.in
