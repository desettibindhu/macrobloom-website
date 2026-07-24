# Getting a Permanent WhatsApp Access Token

Meta provides temporary access tokens that expire after 24 hours. For production, you need a permanent token.

## Method 1: Using System User (Recommended)

### Step 1: Create System User

1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Click **Users** → **System Users**
3. Click **Add** to create new system user
4. Name: `WhatsApp Bot` (or any name)
5. Role: **Admin**
6. Click **Create System User**

### Step 2: Assign WhatsApp to System User

1. Click on your newly created system user
2. Click **Add Assets**
3. Select **Apps**
4. Find your WhatsApp app
5. Toggle **Full Control**
6. Click **Save Changes**

### Step 3: Generate Access Token

1. Still in the system user page
2. Click **Generate New Token**
3. Select your WhatsApp app
4. Permissions needed:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
5. Set expiration: **Never** (for permanent token)
6. Click **Generate Token**
7. **COPY AND SAVE THIS TOKEN IMMEDIATELY** (you can't see it again!)

### Step 4: Use Token in .env

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxx...
```

This token never expires and can be used in production.

---

## Method 2: Using App Access Token (Alternative)

### Step 1: Get App Token

```bash
curl -X GET "https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&grant_type=client_credentials"
```

Response:
```json
{
  "access_token": "YOUR_APP_ACCESS_TOKEN",
  "token_type": "bearer"
}
```

### Step 2: Exchange for Long-Lived Token

```bash
curl -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

**Note:** This method is more complex and System User method is recommended.

---

## Verify Your Token

Test if token is valid:

```bash
curl -X GET "https://graph.facebook.com/v18.0/me?access_token=YOUR_ACCESS_TOKEN"
```

Should return app information.

---

## Security Best Practices

1. **Never commit tokens to Git**
   - Always use `.env` file
   - Add `.env` to `.gitignore`

2. **Rotate tokens periodically**
   - Even permanent tokens should be rotated for security

3. **Use environment variables**
   - In Vercel: Dashboard → Settings → Environment Variables
   - In Netlify: Site Settings → Environment Variables

4. **Restrict token permissions**
   - Only grant necessary WhatsApp permissions
   - Don't give token more access than needed

---

## Token Expiration

- **Temporary tokens:** 24 hours
- **System User tokens (Never expire):** Permanent until manually revoked
- **User Access Tokens (60 days):** 60 days

For production, always use **System User tokens with "Never" expiration**.

---

## Troubleshooting

**Error: "Invalid OAuth access token"**
- Token might be expired
- Token might not have correct permissions
- Generate new token

**Error: "Permissions error"**
- Check token has `whatsapp_business_messaging` permission
- Verify app has WhatsApp product added

**Token works in test but not production:**
- Make sure you're using permanent token, not temporary one
- Verify token is from correct app
- Check phone number ID matches production number

---

## Next Steps

Once you have your permanent token:

1. Add to `.env` file locally
2. Add to hosting platform environment variables
3. Test thoroughly in production
4. Store token backup securely (password manager)
5. Document where token is used

---

**Important:** Keep your access token secret! Anyone with this token can send messages on behalf of your WhatsApp Business number.
