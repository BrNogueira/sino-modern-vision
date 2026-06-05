import mysql from "mysql2/promise";
import { env } from "../env.js";

// Pool MySQL. Aceita DATABASE_URL (mysql://...) ou as MYSQL_* discretas.
export const pool = env.DATABASE_URL
  ? mysql.createPool({
      uri: env.DATABASE_URL,
      connectionLimit: 15,
      charset: "utf8mb4",
      timezone: "Z",
      namedPlaceholders: false,
      // DECIMAL volta como number (não string) → preco/lat/long batem com o front.
      decimalNumbers: true,
    })
  : mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      connectionLimit: 15,
      charset: "utf8mb4",
      timezone: "Z",
      decimalNumbers: true,
    });

/** Nome do banco conectado (para consultas ao information_schema). */
export const DB_NAME =
  env.DATABASE_URL?.split("/").pop()?.split("?")[0] ?? env.MYSQL_DATABASE;
