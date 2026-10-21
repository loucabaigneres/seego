import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { env } from '../env.js';
import { db } from './db.js';
import { sendTransactional } from './email.js';

// Origins only reachable while developing the mobile app.
const mobileDevOrigins = [
  // Expo Go
  'exp://',
  'exp://**',
  'exp://192.168.*.*:*/**',
  // Expo web preview.
  'http://localhost:8081',
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  // Lets the mobile app send its session cookie and receive OAuth redirects on its deep link.
  plugins: [expo()],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    // ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
    //   ? {
    //       apple: {
    //         clientId: process.env.APPLE_CLIENT_ID,
    //         clientSecret: process.env.APPLE_CLIENT_SECRET,
    //       },
    //     }
    //   : {}),
  },
  trustedOrigins: [
    'https://app.seego.fr',
    'https://seego-app.vercel.app',
    'https://seego-*-arthurgramonts-projects.vercel.app',
    env.FRONTEND_URL,
    // Mobile app scheme (`scheme` in apps/mobile/app.json).
    'seego://',
    ...(env.NODE_ENV === 'development' ? mobileDevOrigins : []),
  ],

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendTransactional({
        to: user.email,
        subject: 'Réinitialise ton mot de passe Seego',
        html: `<p>Bonjour,</p>
              <p>Clique ici pour choisir un nouveau mot de passe : <a href="${url}">Réinitialiser</a></p>
              <p>Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendTransactional({
        to: user.email,
        subject: 'Confirme ton adresse email',
        html: `<p>Bienvenue sur Seego !</p>
              <p><a href="${url}">Confirmer mon adresse</a></p>`,
      });
    },
  },
});
