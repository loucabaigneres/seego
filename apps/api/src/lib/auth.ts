import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { admin, emailOTP } from 'better-auth/plugins';
import { env } from '../env.js';
import { db } from './db.js';
import { sendResetPasswordEmail, sendVerificationCode } from './email.js';

// Origins only reachable while developing the mobile app.
const devOrigins = [
  // Web en local, n'importe quel port
  'http://localhost:*',
  'http://127.0.0.1:*',
  // Expo Go
  'exp://',
  'exp://**',
  'exp://192.168.*.*:*/**',
  // Expo web preview.
  'http://localhost:8081',
];

export const isApiOverHttps = env.BETTER_AUTH_URL.startsWith('https://');

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  // Lets the mobile app send its session cookie and receive OAuth redirects on its deep link.
  plugins: [
    expo(),
    // Rôles et modération (colonnes `role`, `banned`, ... déjà présentes dans le schéma `user`).
    // Le rôle par défaut reste 'traveler' (défaut de la colonne) ; seul 'admin' ouvre le back-office.
    admin({
      defaultRole: 'traveler',
      adminRoles: ['admin'],
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      resendStrategy: 'reuse',
      sendVerificationOnSignUp: true,
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== 'email-verification') return;

        void sendVerificationCode(email, otp);
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    // Native iOS only: the app sends the identity token from Sign in with Apple and Better Auth
    // checks it against Apple's public keys, so no Services ID nor client secret is needed.
    // The browser redirect flow (web, Android) would need both: it stays off for now.
    apple: {
      clientId: env.APPLE_APP_BUNDLE_IDENTIFIER,
      appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
    },
  },
  // Le front (app.seego.fr / *.vercel.app) et l'API sont sur des sites différents :
  // le cookie de session doit être SameSite=None; Secure pour être renvoyé en cross-site.
  // En local (API en HTTP) on garde les valeurs par défaut. On se base sur l'URL de l'API
  // et non sur NODE_ENV, qui vaut 'development' par défaut s'il n'est pas défini sur l'hébergeur.
  ...(isApiOverHttps
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
  trustedOrigins: [
    'https://app.seego.fr',
    'https://seego-app.vercel.app',
    'https://seego-*-arthurgramonts-projects.vercel.app',
    // Back-office (apps/admin): production and the stable staging alias set by the CD.
    'https://admin.seego.fr',
    'https://admin-staging.seego.fr',
    env.FRONTEND_URL,
    // Mobile app scheme (`scheme` in apps/mobile/app.json).
    'seego://',
    ...(env.NODE_ENV === 'development' ? devOrigins : []),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail(user.email, url);
    },
  },
});
