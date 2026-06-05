# Banco de dados — sino-modern-vision (Model B / MySQL)

Migração Supabase (Postgres) → **MySQL self-hosted** (espelho local da TurboCloud).
Fonte da verdade do schema: `db/schema.sql` (derivado do schema VIVO em
`src/integrations/supabase/types.ts`; o "Model A" legacy foi descartado).

## Arquivos

| Arquivo | Papel |
|---|---|
| `db/schema.sql` | Tabelas do app (imoveis, categorias, leads, profiles, user_roles, …). Auto-carregado no 1º boot do container. |
| `db/views.sql` | Views de compatibilidade Model A (`imoveis_completo`, `imoveis_imagens`) que o site público consome. Read-only. Auto-carregado após o schema. |
| `scripts/import-imoveis-mysql.ts` | ETL: dump legado `sinos7596_maya.sql` → tabela `imoveis`. Idempotente por `codigo_imovel`. |
| `server/src/scripts/auth-migrate.ts` | Cria as tabelas do Better-auth (`user`, `account`, `session`, `verification`). |
| `server/src/scripts/seed-admin.ts` | Cria o admin (Better-auth + `profiles` + papel em `user_roles`). |

## Bootstrap (do zero)

Pré-requisitos: Docker Desktop com integração WSL, Node 18+ no host.

```bash
# 1. Sobe o MySQL (carrega db/schema.sql automaticamente no 1º boot)
docker compose up -d db

# 2. Tabelas do Better-auth (rode dentro de server/)
cd server && npm install && npm run auth:migrate

# 3. Admin inicial
SEED_ADMIN_PASSWORD='trocar-depois' npm run seed:admin
cd ..

# 4. ETL dos imóveis legados (na raiz). Confira antes com --dry-run:
npx tsx scripts/import-imoveis-mysql.ts --dry-run
npx tsx scripts/import-imoveis-mysql.ts
```

> **Imagens:** o ETL reconstrói as URLs das fotos como
> `${LEGACY_IMG_BASE}/<pasta>/<arquivo>`. Defina `LEGACY_IMG_BASE` no `.env` raiz
> apontando para os uploads do site antigo; sem ela as URLs ficam relativas.

## Reaplicar o schema

O `db/schema.sql` só roda no **primeiro** boot (volume `sino_mysql_data` vazio).
Para recarregar após editar o schema:

```bash
docker compose down            # mantém o volume
# para zerar de vez (apaga os dados):
docker compose down -v && docker compose up -d db
```

Ou aplicar manualmente sem derrubar:

```bash
docker exec -i sino-mysql mysql -uroot -psino_root sino < db/schema.sql
docker exec -i sino-mysql mysql -uroot -psino_root sino < db/views.sql   # views (idempotente)
```

> As views (`db/views.sql`) são `CREATE OR REPLACE` — reaplique-as sempre que
> editar o schema da tabela `imoveis`, sem precisar zerar o volume.

## Conexão (dev)

`server/.env` e `.env` raiz já apontam para `127.0.0.1:3307` / db `sino` / `root`
/ `sino_root` — em sincronia com o serviço `db` do `docker-compose.yml`.
