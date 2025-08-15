# Magic Link Authentication Testing

This document explains how to test the magic link authentication flow in Gumboard.

## Overview

The magic link authentication allows users to sign in by clicking a link sent to their email address. This is implemented using Better Auth's magic link plugin.

## Testing the Complete Flow

### 1. Development Mode Testing

In development mode, the magic link URL is automatically logged to the console for easy testing:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/test-magic-link
   ```

3. **Enter an email address and click "Send Magic Link"**

4. **Check the console output** - you'll see something like:
   ```
   📧 Sending magic link to: test@example.com
   🔗 Magic link URL: http://localhost:3000/api/auth/magic-link/verify?token=...
   
   🚀 DEVELOPMENT MODE - Magic Link for Testing:
   🔗 http://localhost:3000/api/auth/magic-link/verify?token=...
   💡 Copy and paste this URL in your browser to test the flow
   ```

5. **Copy the magic link URL from the console and paste it in your browser**

6. **You should be redirected to the dashboard** after successful authentication

### 2. Production Testing

For production testing, you need to configure email sending:

1. **Set up Resend (or another email provider):**
   - Get an API key from [Resend](https://resend.com)
   - Verify your domain
   - Add the API key to your environment variables

2. **Configure environment variables:**
   ```env
   AUTH_RESEND_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Test the flow:**
   - Go to `/auth/signin`
   - Enter your email
   - Check your email for the magic link
   - Click the link to authenticate

## Environment Variables

Required environment variables for magic link authentication:

```env
# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Email (for production)
AUTH_RESEND_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

## Troubleshooting

### Email Not Sending

If emails are not being sent in development:

1. **Check console logs** - the magic link URL will be logged for testing
2. **Verify environment variables** are set correctly
3. **Check Resend configuration** if using production email

### Magic Link Not Working

1. **Check token expiration** - links expire after 5 minutes
2. **Verify the URL** is correct and complete
3. **Check server logs** for any errors

### Development vs Production

- **Development**: Magic link URLs are logged to console for easy testing
- **Production**: Emails are sent via configured email provider

## API Endpoints

The magic link flow uses these endpoints:

- `POST /api/auth/sign-in/magic-link` - Request a magic link
- `GET /api/auth/magic-link/verify` - Verify the magic link token

## Security Notes

- Magic links expire after 5 minutes
- Tokens are cryptographically secure
- Links are single-use only
- Rate limiting is applied to prevent abuse 