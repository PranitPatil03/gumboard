import { db } from "@/lib/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, 
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          console.log(`📧 Sending magic link to: ${email}`);
          console.log(`🔗 Magic link URL: ${url}`);

          // In development, always log the magic link for easy testing
          if (process.env.NODE_ENV === 'development') {
            console.log('\n🚀 DEVELOPMENT MODE - Magic Link for Testing:');
            console.log(`🔗 ${url}`);
            console.log('💡 Copy and paste this URL in your browser to test the flow\n');
          }

          // Only attempt to send email if we have proper email configuration
          if (env.AUTH_RESEND_KEY && env.EMAIL_FROM) {
            const resendInstance = new Resend(env.AUTH_RESEND_KEY);

            const result = await resendInstance.emails.send({
              from: env.EMAIL_FROM,
              to: email,
              subject: "Sign in to Gumboard",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Sign in to Gumboard</h2>
                  <p>Click the link below to sign in to your account:</p>
                  <a href="${url}" 
                     style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Sign in to Gumboard
                  </a>
                  <p style="margin-top: 20px; color: #666;">
                    This link will expire in 5 minutes. If you didn't request this email, please ignore it.
                  </p>
                </div>
              `,
            });

            if (result.error) {
              console.error(`❌ Email sending failed:`, result.error);
              
              // In development, provide helpful guidance
              if (process.env.NODE_ENV === 'development') {
                console.log('\n🔧 DEVELOPMENT TROUBLESHOOTING:');
                console.log('1. Check your Resend API key in .env.local');
                console.log('2. Verify your domain at https://resend.com/domains');
                console.log('3. Use the magic link above for testing\n');
              }
            } else {
              console.log(`✅ Email sent successfully to ${email}`);
            }
          } else {
            console.log('⚠️ Email configuration missing - skipping email send');
            console.log('📧 Magic link URL (for testing):', url);
          }
        } catch (error) {
          console.error(`❌ Failed to send magic link:`, error);
          
          // Always show the magic link in development for testing
          if (process.env.NODE_ENV === 'development') {
            console.log('\n🔗 Magic link for testing:');
            console.log(url);
            console.log('\n💡 Use this URL to test the authentication flow\n');
          }
        }
      },
      expiresIn: 300, // 5 minutes
      disableSignUp: false, // Allow new users to sign up
    }),
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes("/invite/accept")) {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }
      if (url.startsWith("/")) return `${baseUrl}/dashboard`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});
