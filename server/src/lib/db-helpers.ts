import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db/client.js";

/** Retorna a primeira linha ou null. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return ((rows[0] as T) ?? null) as T | null;
}

/** Retorna todas as linhas. */
export async function queryMany<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as T[];
}

/** Executa INSERT/UPDATE/DELETE e retorna o header (affectedRows, insertId). */
export async function exec(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [res] = await pool.query<ResultSetHeader>(sql, params);
  return res;
}
