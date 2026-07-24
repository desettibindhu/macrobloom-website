# Testing Your WhatsApp Bot

## Local Testing with ngrok

### 1. Start Your Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Expose with ngrok

```bash
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### 3. Configure Webhook

1. Go to Meta App Dashboard → WhatsApp → Configuration
2. Edit Webhook
3. Callback URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
4. Verify Token: Your `WHATSAPP_VERIFY_TOKEN` from .env
5. Subscribe to `messages` field

### 4. Send Test Message

From your phone, send "hi" to the test WhatsApp number.

---

## Testing Conversation Flow

### Full Test Conversation

1. **User:** `hi`
   - **Bot:** Welcome message with goal options

2. **User:** `1` (Weight Loss)
   - **Bot:** Asks for age

3. **User:** `25`
   - **Bot:** Asks for gender

4. **User:** `1` (Male)
   - **Bot:** Asks for height

5. **User:** `175`
   - **Bot:** Asks for weight

6. **User:** `70`
   - **Bot:** Asks for activity level

7. **User:** `3` (Moderately Active)
   - **Bot:** Sends calculated nutrition targets

### Test Different Goals

**Weight Loss:**
```
hi → 1 → 25 → 1 → 175 → 70 → 3
```

**Maintenance:**
```
hi → 2 → 30 → 2 → 165 → 60 → 2
```

**Muscle Gain:**
```
hi → 3 → 22 → 1 → 180 → 75 → 4
```

### Test Invalid Inputs

**Invalid Age:**
```
User: hi
Bot: Welcome...
User: 1
Bot: Age?
User: 999
Bot: ❌ Please enter a valid age between 14 and 100.
```

**Invalid Gender:**
```
User: xyz
Bot: ❌ Please enter "male" or "female" (or 1/2).
```

**Invalid Height:**
```
User: 50
Bot: ❌ Please enter a valid height between 100 and 250 cm.
```

---

## Testing API Endpoints

### 1. Health Check

```bash
curl http://localhost:3000/api/whatsapp/health
```

Expected:
```json
{
  "status": "ok",
  "service": "MacroBloom WhatsApp Bot",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Stats Endpoint

```bash
curl http://localhost:3000/api/whatsapp/stats
```

Expected:
```json
{
  "activeConversations": 2,
  "cacheStats": {...},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Webhook Verification

```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=TEST123"
```

Expected response: `TEST123`

### 4. Send Test Message (via Meta API)

```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE_NUMBER",
    "type": "text",
    "text": {
      "body": "Test message from API"
    }
  }'
```

---

## Debugging

### Check Server Logs

Watch the console output when testing:

```bash
npm run dev
```

You should see:
- `📥 Received from +1234567890: hi`
- `✅ Message sent to +1234567890: Welcome...`
- `💾 Lead saved to database`
- `📊 Lead saved to Google Sheets`

### Common Log Messages

**Success:**
```
✅ Webhook verified successfully
✅ Message sent to +1234567890
📖 Message abc123 marked as read
💾 Lead saved to database: +1234567890
```

**Warnings:**
```
⚠️ Database URL not configured. Skipping database save.
⚠️ Google Sheets integration not enabled. Skipping.
```

**Errors:**
```
❌ Error sending message: Invalid OAuth access token
❌ Error saving to Google Sheets: Permission denied
❌ Webhook verification failed: Invalid token
```

### Debug Mode

Add detailed logging to see all requests:

Edit `src/routes/webhook.routes.js` and uncomment logging lines.

---

## Testing Google Sheets Integration

### 1. Enable in .env

```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. Complete Test Conversation

Send full conversation flow to bot.

### 3. Check Google Sheet

Open your Google Sheet and verify new row was added with:
- Timestamp
- Phone Number
- Age, Gender, Height, Weight
- Activity Level, Goal
- Calculated values (BMR, TDEE, Calories, Macros)

---

## Testing Database Integration

### 1. Configure Database

```env
DATABASE_URL=mongodb://localhost:27017/macrobloom
# or
DATABASE_URL=postgresql://user:pass@localhost:5432/macrobloom
```

### 2. Implement Database Logic

Edit `src/services/database.service.js` and add your database insert logic.

### 3. Test Lead Capture

Complete conversation and check database for new record.

---

## Load Testing

### Test Multiple Conversations

Use multiple phones or WhatsApp Web sessions to test concurrent conversations.

### Verify State Management

1. Start conversation from Phone 1
2. Start conversation from Phone 2
3. Both should maintain separate states
4. Complete both independently

---

## Production Testing Checklist

Before going live:

- [ ] Test webhook verification
- [ ] Test full conversation flow
- [ ] Test all 3 goal types (loss, maintenance, gain)
- [ ] Test invalid inputs for each step
- [ ] Test conversation restart (send "hi" mid-conversation)
- [ ] Test concurrent conversations (2+ users)
- [ ] Verify leads save to database
- [ ] Verify leads save to Google Sheets
- [ ] Test with real phone number (not test number)
- [ ] Test on different devices (iOS, Android)
- [ ] Verify message formatting displays correctly
- [ ] Check response times
- [ ] Monitor for errors in logs
- [ ] Test rate limiting behavior

---

## Monitoring in Production

### Vercel

1. Dashboard → Your Project
2. Deployments → Latest Deployment
3. Functions → Click function
4. View logs in real-time

### Netlify

1. Dashboard → Your Site
2. Functions
3. Click function name
4. View logs

### Custom Monitoring

Add services like:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for APM
- **New Relic** for performance

---

## Troubleshooting Test Issues

**Messages not received:**
1. Check ngrok is running
2. Verify webhook URL is correct
3. Check subscription to `messages` field
4. Review Meta app status (not in sandbox mode)

**Webhook verification fails:**
1. Verify VERIFY_TOKEN matches
2. Check URL format is correct
3. Try re-entering webhook URL

**Bot doesn't respond:**
1. Check server is running
2. Review server logs for errors
3. Verify ACCESS_TOKEN is valid
4. Check PHONE_NUMBER_ID is correct

**Calculations seem wrong:**
1. Review test inputs
2. Check calculator formulas
3. Test with known values
4. Compare with online calculators

---

## Test Cases Spreadsheet

| Test Case | Input | Expected Result | Status |
|-----------|-------|----------------|--------|
| Valid conversation | hi → 1 → 25 → 1 → 175 → 70 → 3 | Results sent | ✅ |
| Invalid age | 999 | Error message | ✅ |
| Invalid height | 50 | Error message | ✅ |
| Invalid weight | 300 | Error message | ✅ |
| Restart conversation | hi (mid-flow) | New conversation | ✅ |
| Google Sheets save | Complete flow | Row added | ✅ |
| Database save | Complete flow | Record created | ✅ |

---

Happy Testing! 🧪
