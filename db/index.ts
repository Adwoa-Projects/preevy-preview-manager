import { drizzle } from 'drizzle-orm/neon-http';
import { previews } from './schema';

export const db = drizzle(process.env.DATABASE_URL!);
export { previews };
