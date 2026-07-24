# MacroBloom WhatsApp Bot - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Get Meta WhatsApp Cloud API Access

1. Go to https://developers.facebook.com/
2. Create a Meta App (Business type)
3. Add WhatsApp product
4. Note down:
   - Phone Number ID
   - Access Token (temporary for now)
   - App ID
   - App Secret

### Step 2: Install Dependencies

```bash
cd whatsapp-bot
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
WHATSAPP_ACCESS_TOKEN=EAAxxxx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=my_secret_token_123
META_APP_ID=1234567890
META_APP_SECRET=abc123def456
```

### Step 4: Run Locally with Tunnel

Terminal 1 - Start server:
```bash
npm run dev
```

Terminal 2 - Start ngrok:
```bash
ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 5: Configure Webhook in Meta

1. Go to WhatsApp → Configuration in Meta App
2. Edit Webhook
3. Callback URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
4. Verify Token: `my_secret_token_123` (same as in .env)
5. Subscribe to: `messages`
6. Save

### Step 6: Test!

Send "hi" to your WhatsApp test number from your phone.

Bot should respond! 🎉

---

## 📱 Testing the Bot

### Test Messages:

1. **Start Conversation:**
   ```
   hi
   ```

2. **Choose Goal:**
   ```
   1
   ```
   (for Weight Loss)

3. **Enter Age:**
   ```
   25
   ```

4. **Enter Gender:**
   ```
   1
   ```
   (for Male)

5. **Enter Height:**
   ```
   175
   ```
   (in cm)

6. **Enter Weight:**
   ```
   70
   ```
   (in kg)

7. **Choose Activity:**
   ```
   3
   ```
   (for Moderately Active)

Bot will calculate and send your personalized nutrition targets!

---

## 🌐 Deploy to Production

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts and set environment variables in Vercel dashboard.

### Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Set environment variables in Netlify dashboard.

---

## 🔧 Common Issues

**Webhook verification fails:**
- Check VERIFY_TOKEN matches in both .env and Meta dashboard
- Ensure ngrok URL is HTTPS
- Try re-entering the webhook URL

**Messages not received:**
- Check webhook is subscribed to `messages` field
- Verify phone number is added to test numbers
- Check server logs for errors

**Messages not sending:**
- Verify ACCESS_TOKEN is valid
- Check PHONE_NUMBER_ID is correct
- Review API errors in logs

---

## 📊 Optional: Google Sheets Integration

1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account and download JSON
4. Add service account email to your spreadsheet
5. Update .env:
   ```env
   GOOGLE_SHEETS_ENABLED=true
   GOOGLE_SHEETS_ID=your_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

---

## 🎯 Production Checklist

- [ ] Get permanent access token (create System User)
- [ ] Add verified business phone number
- [ ] Deploy to Vercel/Netlify
- [ ] Update webhook URL to production domain
- [ ] Test full conversation flow
- [ ] Enable Google Sheets (optional)
- [ ] Set up monitoring

---

## 💡 Next Steps

- Customize welcome message
- Add more conversation flows
- Integrate with your CRM
- Add payment processing
- Create admin dashboard
- Set up analytics

---

Need help? Check the full README.md for detailed documentation.
