import { neon } from '@neondatabase/serverless';

// A integração da Vercel criou a variável com prefixo (DATABASE_URL_DATABASE_URL).
// Se ela não existir, usa a DATABASE_URL simples.
const url = process.env.DATABASE_URL_DATABASE_URL || process.env.DATABASE_URL;
export const sql = neon(url);
