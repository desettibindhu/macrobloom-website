# MacroBloom WhatsApp Bot - Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Meta WhatsApp Cloud API Setup
- [ ] Created Meta App (Business type)
- [ ] Added WhatsApp product to app
- [ ] Created System User in Business Manager
- [ ] Generated permanent access token (never expires)
- [ ] Saved access token securely
- [ ] Noted Phone Number ID
- [ ] Noted App ID and App Secret
- [ ] Added and verified business phone number (not test number)
- [ ] Removed test phone number restriction

### 2. Environment Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Set `WHATSAPP_ACCESS_TOKEN` (permanent token)
- [ ] Set `WHATSAPP_PHONE_NUMBER_ID`
- [ ] Set `WHATSAPP_VERIFY_TOKEN` (random secure string)
- [ ] Set `META_APP_ID`
- [ ] Set `META_APP_SECRET`
- [ ] Set `NODE_ENV=production`

### 3. Google Sheets Setup (Optional)
- [ ] Created Google Cloud Project
- [ ] Enabled Google Sheets API
- [ ] Created Service Account
- [ ] Downloaded service account JSON key
- [ ] Created Google Spreadsheet for leads
- [ ] Shared spreadsheet with service account email
- [ ] Set `GOOGLE_SHEETS_ENABLED=true`
- [ ] Set `GOOGLE_SHEETS_ID`
- [ ] Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] Set `GOOGLE_PRIVATE_KEY`

### 4. Database Setup (Optional)
- [ ] Provisioned database (MongoDB, PostgreSQL, etc.)
- [ ] Created database schema/tables
- [ ] Tested database connection
- [ ] Set `DATABASE_URL`
- [ ] Implemented database logic in `database.service.js`

### 5. Local Testing
- [ ] Installed dependencies: `npm install`
- [ ] Tested locally: `npm run dev`
- [ ] Started ngrok tunnel
- [ ] Configured webhook with ngrok URL
- [ ] Sent test "hi" message
- [ ] Completed full conversation flow
- [ ] Verified lead saved to Google Sheets/database
- [ ] Tested error handling (invalid inputs)
- [ ] Tested conversation restart
- [ ] Tested multiple concurrent conversations
- [ ] Checked all logs for errors

---

## 🚀 Deployment Steps

### Option A: Deploy to Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd whatsapp-bot
vercel
```

#### Step 4: Configure Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_VERIFY_TOKEN`
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `GOOGLE_SHEETS_ENABLED` (if using)
   - `GOOGLE_SHEETS_ID` (if using)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` (if using)
   - `GOOGLE_PRIVATE_KEY` (if using)
   - `NODE_ENV=production`

#### Step 5: Redeploy
```bash
vercel --prod
```

#### Step 6: Note Production URL
Example: `https://macrobloom-whatsapp-bot.vercel.app`

---

### Option B: Deploy to Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login
```bash
netlify login
```

#### Step 3: Initialize
```bash
cd whatsapp-bot
netlify init
```

#### Step 4: Deploy
```bash
netlify deploy --prod
```

#### Step 5: Configure Environment Variables
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add each variable (same as Vercel list above)

#### Step 6: Note Production URL
Example: `https://macrobloom-whatsapp-bot.netlify.app`

---

### Option C: Deploy to Node.js Server

#### Step 1: Setup Server
```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Clone Repository
```bash
git clone <your-repo-url>
cd whatsapp-bot
npm install --production
```

#### Step 3: Create .env File
```bash
nano .env
# Paste environment variables
# Save: Ctrl+X, Y, Enter
```

#### Step 4: Start with PM2
```bash
pm2 start src/index.js --name macrobloom-bot
pm2 save
pm2 startup
```

#### Step 5: Setup Nginx Reverse Proxy
```bash
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/whatsapp-bot

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Setup SSL with Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 7: Note Production URL
Example: `https://your-domain.com`

---

## 🔗 Configure Webhook in Meta

### Step 1: Go to Meta App Dashboard
1. Visit [Meta for Developers](https://developers.facebook.com/apps/)
2. Select your app
3. Go to WhatsApp → Configuration

### Step 2: Edit Webhook
1. Click **Edit** button in Webhook section
2. **Callback URL:** `https://your-production-url.com/api/whatsapp/webhook`
   - Vercel: `https://macrobloom-whatsapp-bot.vercel.app/api/whatsapp/webhook`
   - Netlify: `https://macrobloom-whatsapp-bot.netlify.app/api/whatsapp/webhook`
   - Custom: `https://your-domain.com/api/whatsapp/webhook`
3. **Verify Token:** Your `WHATSAPP_VERIFY_TOKEN` from .env
4. Click **Verify and Save**

### Step 3: Subscribe to Webhook Fields
Check these boxes:
- ✅ `messages`
- ✅ `message_status` (optional but recommended)

### Step 4: Test Verification
Meta will send GET request to verify webhook. Check deployment logs for:
```
✅ Webhook verified successfully
```

---

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-production-url.com/api/whatsapp/health
```

Expected:
```json
{
  "status": "ok",
  "service": "MacroBloom WhatsApp Bot",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test Message Flow
1. Send "hi" to your business WhatsApp number
2. Bot should respond immediately
3. Complete full conversation
4. Verify results received
5. Check Google Sheets for new row (if enabled)
6. Check database for new record (if enabled)

### 3. Check Logs
**Vercel:**
- Dashboard → Deployments → Latest → Functions → View Logs

**Netlify:**
- Dashboard → Functions → Click function → Logs

**Node.js Server:**
```bash
pm2 logs macrobloom-bot
```

Look for:
```
✅ Message sent to +1234567890
💾 Lead saved to database
📊 Lead saved to Google Sheets
```

### 4. Test Error Handling
Send invalid inputs and verify bot responds with error messages.

### 5. Test Concurrent Conversations
Use 2-3 different phone numbers simultaneously to test state management.

---

## 🔧 Troubleshooting

### Webhook Verification Failed
- ✅ Check `WHATSAPP_VERIFY_TOKEN` matches in both .env and Meta
- ✅ Ensure URL is correct (https://)
- ✅ Check deployment logs for errors
- ✅ Try re-entering webhook URL in Meta

### Messages Not Received
- ✅ Verify webhook subscribed to `messages` field
- ✅ Check deployment is running (health check)
- ✅ Review logs for incoming requests
- ✅ Ensure phone number is not test-restricted

### Messages Not Sending
- ✅ Verify `WHATSAPP_ACCESS_TOKEN` is permanent token
- ✅ Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- ✅ Review API error responses in logs
- ✅ Check Meta app is not in restricted mode

### Google Sheets Not Saving
- ✅ Verify service account has Editor access to sheet
- ✅ Check `GOOGLE_PRIVATE_KEY` includes `\n` line breaks
- ✅ Ensure Google Sheets API is enabled
- ✅ Review error logs for specific API errors

---

## 🎯 Go-Live Checklist

### Final Checks Before Launch
- [ ] Tested full conversation flow in production
- [ ] Verified all environment variables set correctly
- [ ] Confirmed webhook configured and verified
- [ ] Tested error handling and edge cases
- [ ] Verified Google Sheets integration (if enabled)
- [ ] Verified database integration (if enabled)
- [ ] Checked response times are acceptable
- [ ] Reviewed all logs - no errors
- [ ] Tested with real phone numbers (iOS & Android)
- [ ] Prepared customer support documentation
- [ ] Set up monitoring/alerting
- [ ] Created incident response plan

### Launch Activities
- [ ] Announce to internal team
- [ ] Update website with WhatsApp number
- [ ] Create promotional materials
- [ ] Train customer support team
- [ ] Monitor first 50 conversations closely
- [ ] Collect initial user feedback
- [ ] Fix any immediate issues

### Post-Launch (Week 1)
- [ ] Monitor error rates daily
- [ ] Track conversation completion rates
- [ ] Review drop-off points in flow
- [ ] Analyze lead quality
- [ ] Optimize messaging based on feedback
- [ ] Document common issues
- [ ] Plan first improvements

---

## 📊 Monitoring Setup

### Recommended Tools
- **Error Tracking:** Sentry, Rollbar
- **Analytics:** Mixpanel, Amplitude
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Logs:** Logtail, Papertrail
- **APM:** New Relic, DataDog

### Key Metrics to Track
- Conversation start rate
- Completion rate (finished all steps)
- Average conversation duration
- Error rate
- Response time
- Lead capture success rate
- Daily active conversations

---

## 🔄 Rollback Plan

### If Issues Arise

**Vercel:**
```bash
# Rollback to previous deployment
vercel rollback
```

**Netlify:**
1. Dashboard → Deploys
2. Find working deployment
3. Click **Publish deploy**

**Node.js:**
```bash
# Stop current version
pm2 stop macrobloom-bot

# Revert code
git checkout <previous-commit>
npm install

# Restart
pm2 restart macrobloom-bot
```

### Emergency Contacts
- Meta Support: https://business.facebook.com/business/help
- Hosting Support: Vercel/Netlify docs
- Internal escalation: [Your team contact]

---

## 🎉 Deployment Complete!

Once all checklist items are done:

✅ **Production WhatsApp bot is live!**

Your MacroBloom WhatsApp bot is now:
- Receiving messages 24/7
- Calculating personalized nutrition targets
- Capturing leads automatically
- Ready to help users achieve their fitness goals

**Next:** Monitor, optimize, and iterate based on user feedback!

---

**Questions?** Refer to:
- [README.md](README.md) - Complete documentation
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Testing procedures
- [ACCESS_TOKEN_GUIDE.md](docs/ACCESS_TOKEN_GUIDE.md) - Token management
- [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) - System architecture

**Good luck! 🚀**
