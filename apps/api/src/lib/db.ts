import { createClient } from '@seego/database';
import { env } from '../env.js';

export const db = createClient(env.DATABASE_URL);
