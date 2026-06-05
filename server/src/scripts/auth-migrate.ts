// ============================================================================
// Cria/atualiza as tabelas do Better-auth (user, account, session, verification)
// no MySQL configurado, usando a própria config do app (authOptions).
// Uso (na pasta server/):  npm run auth:migrate
// ============================================================================
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "../auth/index.js";

async function main() {
  console.log("\n▶ Better-auth: verificando schema…");
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(authOptions);
  const created = toBeCreated.map((t) => t.table);
  const added = toBeAdded.map((t) => t.table);

  if (created.length === 0 && added.length === 0) {
    console.log("  • schema já está atualizado — nada a fazer");
    process.exit(0);
  }
  if (created.length) console.log("  tabelas a criar:", created.join(", "));
  if (added.length) console.log("  colunas a adicionar em:", added.join(", "));

  await runMigrations();
  console.log("  ✓ migração aplicada\n");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
