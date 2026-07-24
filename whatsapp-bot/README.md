# MacroBloom WhatsApp Bot 🌱

A production-ready WhatsApp Cloud API integration for MacroBloom that provides personalized nutrition calculations through an interactive WhatsApp chatbot.

## Features ✨

- 🤖 **Automated WhatsApp Conversations** - Interactive step-by-step nutrition calculator
- 📊 **Nutrition Calculations** - BMR, TDEE, and personalized macro targets
- 💾 **Lead Capture** - Save user data to database and Google Sheets
- 🔒 **Secure** - Webhook verification and environment-based secrets
- 🚀 **Deployment Ready** - Configured for Vercel, Netlify, or standalone Node.js

## How It Works 🔄

1. User sends "hi" to WhatsApp number
2. Bot asks for fitness goal (Weight Loss, Maintenance, or Muscle Gain)
3. Bot collects user information:
   - Age
   - Gender
   - Height (cm)
   - Weight (kg)
   - Activity Level
4. Bot calculates personalized targets:
   - Daily Calories
   - Protein (grams)
   - Fiber (grams)
   - Healthy Fats (grams)
   - Complex Carbs (grams)
5. Results are sent to user and saved to database/Google Sheets

## Quick Start 🚀

### 1. Prerequisites

- Node.js 18+ installed
- WhatsApp Business Account
- Meta Developer Account
- WhatsApp Cloud API access

### 2. Installation

```bash
cd whatsapp-bot
npm install
```

### 3. Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
```

### 4. Run Locally

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 5. Test Webhook Locally

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Use the ngrok URL for webhook configuration in Meta App Dashboard.

## Meta WhatsApp Cloud API Setup 📱

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Business** as app type
4. Fill in app details and create

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Follow the setup wizard

### Step 3: Get Credentials

**Phone Number ID:**
- Go to WhatsApp → Getting Started
- Copy the **Phone Number ID** from the test number (or your own number)

**Access Token:**
- Go to WhatsApp → Getting Started
- Click **Generate Token** (this is temporary)
- For production, create a **System User** and generate permanent token:
  1. Go to Business Settings → System Users
  2. Create new system user
  3. Add WhatsApp permissions
  4. Generate token (save it securely!)

**App ID & Secret:**
- Go to Settings → Basic
- Copy **App ID** and **App Secret**

### Step 4: Configure Webhook

1. Go to WhatsApp → Configuration
2. Click **Edit** in Webhook section
3. Set **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
4. Set **Verify Token**: Create a random string (same as in your `.env`)
5. Subscribe to webhook fields:
   - `messages`
   - `message_status`

### Step 5: Add Phone Number

1. Go to WhatsApp → API Setup
2. Add your business phone number
3. Verify with code sent via SMS
4. Complete registration

## Environment Variables 🔐

| Variable | Description | Required |
|----------|-------------|----------|
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token from Meta | ✅ Yes |
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp Business phone number ID | ✅ Yes |
| `WHATSAPP_VERIFY_TOKEN` | Custom token for webhook verification | ✅ Yes |
| `META_APP_ID` | Meta App ID | ✅ Yes |
| `META_APP_SECRET` | Meta App Secret | ✅ Yes |
| `GOOGLE_SHEETS_ENABLED` | Enable Google Sheets integration (`true`/`false`) | ❌ No |
| `GOOGLE_SHEETS_ID` | Google Spreadsheet ID | ❌ No |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | ❌ No |
| `GOOGLE_PRIVATE_KEY` | Service account private key | ❌ No |
| `DATABASE_URL` | Database connection string | ❌ No |
| `NODE_ENV` | Environment (`development`/`production`) | ❌ No |

## Google Sheets Integration 📊

### Setup Instructions

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project

2. **Enable Google Sheets API**
   - Go to APIs & Services → Library
   - Search for "Google Sheets API"
   - Enable it

3. **Create Service Account**
   - Go to APIs & Services → Credentials
   - Create Credentials → Service Account
   - Download JSON key file

4. **Configure Environment**
   ```env
   GOOGLE_SHEETS_ENABLED=true
   GOOGLE_SHEETS_ID=your_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. **Share Spreadsheet**
   - Open your Google Sheet
   - Click Share
   - Add service account email with Editor access

## Deployment 🌍

### Deploy to Vercel

```bash
npm run deploy:vercel
```

Or use Vercel CLI:

```bash
vercel
```

**Set Environment Variables:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add all required variables

### Deploy to Netlify

```bash
netlify deploy --prod
```

**Set Environment Variables:**
1. Go to Netlify Dashboard → Your Site
2. Site Settings → Environment Variables
3. Add all required variables

### Deploy to Node.js Server

1. Clone repository to server
2. Install dependencies: `npm install`
3. Create `.env` file with credentials
4. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name macrobloom-bot
   pm2 save
   pm2 startup
   ```

## API Endpoints 🛠️

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/whatsapp/webhook` | Webhook verification |
| `POST` | `/api/whatsapp/webhook` | Receive WhatsApp messages |
| `GET` | `/api/whatsapp/health` | Health check |
| `GET` | `/api/whatsapp/stats` | Conversation statistics |

## Project Structure 📁

```
whatsapp-bot/
├── src/
│   ├── config/
│   │   └── index.js              # Configuration management
│   ├── handlers/
│   │   └── message.handler.js    # Message processing logic
│   ├── routes/
│   │   └── webhook.routes.js     # Webhook endpoints
│   ├── services/
│   │   ├── whatsapp.service.js   # WhatsApp API client
│   │   ├── conversation.service.js # State management
│   │   └── database.service.js   # Database & Sheets integration
│   ├── utils/
│   │   ├── calculator.js         # Nutrition calculations
│   │   └── logger.js             # Logging utilities
│   └── index.js                  # Express app entry point
├── netlify/
│   └── functions/
│       └── index.js              # Netlify Functions wrapper
├── .env.example                  # Environment template
├── .gitignore
├── netlify.toml                  # Netlify configuration
├── package.json
├── vercel.json                   # Vercel configuration
└── README.md
```

## Conversation Flow 💬

```
User: hi
Bot: Welcome to MacroBloom 👋
     Choose your goal:
     1️⃣ Weight Loss
     2️⃣ Weight Maintenance
     3️⃣ Muscle Gain

User: 1
Bot: Great! Now, please tell me your age (in years):

User: 25
Bot: What is your gender?
     1️⃣ Male
     2️⃣ Female

User: 1
Bot: What is your height in centimeters (cm)?

User: 175
Bot: What is your weight in kilograms (kg)?

User: 80
Bot: What is your activity level?
     1️⃣ Sedentary
     2️⃣ Lightly Active
     3️⃣ Moderately Active
     4️⃣ Very Active

User: 3
Bot: 🌱 Your MacroBloom Daily Targets
     
     🟢 Protein: 160g
     🌲 Fiber: 30g
     🟠 Healthy Fats: 58g
     🟡 Complex Carbs: 215g
     
     📊 Total Calories: 2000 kcal/day
     ...
```

## Nutrition Calculation Formulas 🧮

### BMR (Mifflin-St Jeor Equation)
```
Male:   BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
```

### TDEE
```
TDEE = BMR × Activity Multiplier
```

Activity Multipliers:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725

### Target Calories
```
Weight Loss:  TDEE - (250 to 750)
Maintenance:  TDEE
Muscle Gain:  TDEE + (250 to 750)
```

### Macros
```
Protein:      Weight × (1.6 to 2.2) g/kg
Fiber:        14g per 1000 calories (min: 25-30g)
Healthy Fats: 28% of total calories
Complex Carbs: Remaining calories after protein and fats
```

## Error Handling ⚠️

The bot handles:
- Invalid numeric inputs
- Out-of-range values
- Missing conversation state
- API failures
- Rate limiting
- Network errors

All errors are logged and users receive friendly error messages.

## Security 🔒

- ✅ Environment variables for all secrets
- ✅ Webhook signature verification
- ✅ Request payload validation
- ✅ HTTPS only in production
- ✅ CORS configured
- ✅ Rate limiting (implement via middleware if needed)

## Monitoring & Debugging 🔍

### View Logs

**Local:**
```bash
npm run dev
# Logs will appear in console
```

**Vercel:**
- Dashboard → Your Project → Deployments → View Function Logs

**Netlify:**
- Dashboard → Your Site → Functions → View Logs

### Statistics Endpoint

```bash
curl https://your-domain.com/api/whatsapp/stats
```

Returns:
```json
{
  "activeConversations": 5,
  "cacheStats": {...},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing 🧪

### Test Webhook Verification

```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=CHALLENGE_STRING"
```

Expected response: `CHALLENGE_STRING`

### Test Message Handling

Send a WhatsApp message to your business number with "hi"

### Manual API Testing

Use Meta's WhatsApp API Test tool:
1. Go to WhatsApp → API Setup
2. Use "Send Message" to test receiving
3. Use "curl" examples to test sending

## Troubleshooting 🔧

### Webhook Not Receiving Messages

1. Check webhook URL is correct in Meta dashboard
2. Verify webhook is subscribed to `messages` field
3. Check HTTPS is enabled (required for production)
4. Review webhook verification logs

### Messages Not Sending

1. Verify `WHATSAPP_ACCESS_TOKEN` is valid (check expiration)
2. Check `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Review API response errors in logs
4. Ensure phone numbers are in E.164 format

### Google Sheets Not Saving

1. Verify service account email has Editor access to sheet
2. Check `GOOGLE_PRIVATE_KEY` includes `\n` line breaks
3. Ensure Google Sheets API is enabled in Cloud Console
4. Review error logs for specific API errors

## Rate Limits ⏱️

WhatsApp Cloud API rate limits:
- **Free tier**: 1,000 conversations/month
- **Paid tier**: Variable based on plan
- **Messaging rate**: 80 messages/second per phone number

## Production Checklist ✅

Before going live:

- [ ] Replace test phone number with verified business number
- [ ] Generate permanent access token (not temporary)
- [ ] Set all environment variables in hosting platform
- [ ] Enable HTTPS on production domain
- [ ] Configure webhook with production URL
- [ ] Test all conversation flows end-to-end
- [ ] Set up database for lead persistence
- [ ] Configure Google Sheets (if using)
- [ ] Set up monitoring and alerts
- [ ] Add error tracking (Sentry, etc.)
- [ ] Review and test security measures
- [ ] Prepare customer support workflow

## Support & Resources 📚

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Help Center](https://business.facebook.com/business/help)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

## License 📄

MIT License - MacroBloom

---

Built with ❤️ for MacroBloom by [Your Team]
