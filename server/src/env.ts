import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),

  // Conexão MySQL: URL única (mysql://user:pass@host:port/db) OU as MYSQL_* abaixo.
  DATABASE_URL: z.string().optional(),
  MYSQL_HOST: z.string().default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default("root"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().default("sino"),
  MYSQL_SOCKET: z.string().optional(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter pelo menos 32 chars"),
  AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:8080"),
  APP_PUBLIC_URL: z.string().url().default("http://localhost:8080"),

  /** Diretório de uploads (storage de fotos novas). Volume persistente em prod. */
  UPLOADS_DIR: z.string().default("uploads"),
  /** Base pública para servir os uploads (ex.: https://api.site.com/uploads). */
  PUBLIC_UPLOADS_URL: z.string().default("/uploads"),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
