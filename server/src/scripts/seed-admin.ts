// ============================================================================
// Seed de admin. Cria (ou reutiliza) um usuário no Better-auth, espelha em
// profiles e atribui o papel 'admin' em user_roles.
//
// Uso (na pasta server/):
//   SEED_ADMIN_PASSWORD='suaSenha' npm run seed:admin
//   tsx --env-file=.env src/scripts/seed-admin.ts admin@x.com 'suaSenha' "Nome"
// ============================================================================
import { auth } from "../auth/index.js";
import { queryOne, exec } from "../lib/db-helpers.js";

const EMAIL = process.argv[2] ?? process.env.SEED_ADMIN_EMAIL ?? "admin@sinosimoveis.com.br";
const PASSWORD = process.argv[3] ?? process.env.SEED_ADMIN_PASSWORD ?? "";
const NAME = process.argv[4] ?? process.env.SEED_ADMIN_NAME ?? "Administrador";

if (!PASSWORD || PASSWORD.length < 8) {
  console.error("✗ Defina a senha (mín. 8 chars) via SEED_ADMIN_PASSWORD ou 2º argumento.");
  process.exit(1);
}

async function main() {
  console.log(`\n▶ Seed admin: ${EMAIL}`);

  let userId: string | null = null;
  try {
    const res = (await auth.api.signUpEmail({
      body: { email: EMAIL, password: PASSWORD, name: NAME },
    })) as { user?: { id?: string } };
    userId = res?.user?.id ?? null;
    console.log("  ✓ usuário criado no Better-auth");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/exist|already|unique|duplicate/i.test(msg)) console.log("  • já existe — reutilizando");
    else { console.error("  ✗ signUpEmail:", msg); process.exit(1); }
  }

  if (!userId) {
    const row = await queryOne<{ id: string }>(
      "SELECT id FROM `user` WHERE lower(email) = lower(?) LIMIT 1", [EMAIL],
    );
    userId = row?.id ?? null;
  }
  if (!userId) { console.error("  ✗ não resolvi o user_id"); process.exit(1); }
  console.log(`  user_id = ${userId}`);

  // Espelha em profiles
  await exec(
    `INSERT INTO profiles (id, full_name, email, active)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), active = 1`,
    [userId, NAME, EMAIL],
  );
  console.log("  ✓ profile criado/atualizado");

  // Papel admin
  await exec(
    `INSERT INTO user_roles (id, user_id, role)
     VALUES (UUID(), ?, 'admin')
     ON DUPLICATE KEY UPDATE role = role`,
    [userId],
  );
  console.log("  ✓ papel admin atribuído");

  console.log(`\n✅ Admin pronto: ${EMAIL}\n`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
