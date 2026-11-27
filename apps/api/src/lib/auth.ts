import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { admin, emailOTP } from 'better-auth/plugins';
import { env } from '../env.js';
import { db } from './db.js';
import { appleClientSecretProvider } from './apple/clientSecret.js';
import { resolveAppleEmail } from './apple/email.js';
import { findUserByAppleSubject, upgradeApplePlaceholder } from './apple/knownUser.js';
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

/** Client secret of the Apple redirect flow, signed with the Sign in with Apple key. */
const appleClientSecret = appleClientSecretProvider(
  { teamId: env.APPLE_TEAM_ID, keyId: env.APPLE_KEY_ID, privateKey: env.APPLE_PRIVATE_KEY },
  env.APPLE_CLIENT_ID,
);

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
    // Two flows (https://www.better-auth.com/docs/authentication/apple):
    // - redirect (web, later Android): the browser goes to Apple, which posts back to
    //   `<BETTER_AUTH_URL>/api/auth/callback/apple`; the code is exchanged with the Services ID
    //   (`clientId`) and the client secret;
    // - native iOS: the app sends Apple's identity token, whose audience is the bundle ID.
    //   `audience` lists both clients so either kind of token is accepted.
    // Async, as in the Better Auth docs: the client secret is signed (jose) before the provider
    // is set up. A key that cannot be read leaves the redirect flow off without breaking the rest
    // of auth: the native iOS flow does not need the secret.
    apple: async () => {
      try {
        await appleClientSecret.init();
      } catch (err) {
        console.error('[apple] could not sign the client secret, web sign-in is off:', err);
      }
      return {
        clientId: env.APPLE_CLIENT_ID,
        // Getter: read at each call to Apple, so the secret is renewed before its 6 months expire.
        get clientSecret() {
          return appleClientSecret.current();
        },
        appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
        audience: [env.APPLE_APP_BUNDLE_IDENTIFIER, env.APPLE_CLIENT_ID],
        // Apple may send a token without e-mail (see `resolveAppleEmail`), and an account created
        // that way gets the e-mail and name once Apple shares them (`upgradeApplePlaceholder`).
        mapProfileToUser: async (profile) => {
          if (typeof profile.sub === 'string' && profile.email) {
            await upgradeApplePlaceholder(db, profile.sub, {
              email: profile.email,
              emailVerified: profile.email_verified,
              name: profile.name,
            });
          }
          return resolveAppleEmail(profile, (sub) => findUserByAppleSubject(db, sub));
        },
      };
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
    // Apple posts the redirect flow's result to the callback (`response_mode=form_post`).
    'https://appleid.apple.com',
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
