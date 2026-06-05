# sino-modern-vision — Arquitetura ponta a ponta (front + back)

> Documento de referência da migração **Supabase (Postgres + Edge Functions) →
> stack self-hosted (React SPA + API Hono/Node + MySQL)**.
> Inclui, no fim, uma **revisão de arquiteto** com os erros encontrados,
> ranqueados por severidade. Datado de 2026-06-04.

---

## 1. Topologia

```
┌──────────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR                                                                 │
│  React SPA (Vite) ── shim supabase ──┐                                     │
│  src/integrations/supabase/client.ts │  fetch(credentials:include)         │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                        │  /api/*
        DEV: http://localhost:4001      │      PROD: mesma origem (proxy)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  API — Hono + @hono/node-server  (server/)                                 │
│  /api/auth/*    better-auth (sessão por cookie)                            │
│  /api/data/*    CRUD genérico por recurso  (lib/crud.ts)                   │
│  /api/rpc/*     get_user_roles, is_admin                                   │
│  /api/feed/*    VRSync XML (Canal Pro / VivaReal / ZAP)                    │
│  /api/storage/* upload/serve de arquivos em disco                          │
│  /api/admin/*   criação de usuários                                        │
│  middleware attachSession → resolve sessão + papéis (user_roles)           │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                        │  mysql2 pool
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  MySQL 8 (docker-compose service `db`, porta 3307→3306)                    │
│  Tabelas do app: db/schema.sql  (Model B)                                  │
│  Tabelas do auth: criadas por `npm run auth:migrate` (better-auth)         │
│  Dados legados:   ETL scripts/import-imoveis-mysql.ts                      │
└──────────────────────────────────────────────────────────────────────────┘
```

**Princípio central:** o frontend não foi reescrito. Um **shim** mantém o objeto
global `supabase` (`.auth` / `.from()` / `.rpc()` / `.functions` / `.storage`)
com a mesma assinatura do `@supabase/supabase-js`, traduzindo cada chamada para
REST contra a API Node. Isso evita refatorar centenas de call sites — ao custo de
o shim ter de cobrir fielmente o subconjunto da API do supabase-js que o app usa.

---

## 2. Fluxo de dados, camada por camada

### 2.1 Frontend → API (o shim)

| Arquivo | Papel |
|---|---|
| `src/integrations/api/client.ts` | `fetch` base (`api.get/post/patch/delete/upload`), `authApi`, resolução da base da API. |
| `src/integrations/supabase/client.ts` | Objeto `supabase` falso. `.auth`, `.rpc`, `.functions`, `.storage`. |
| `src/integrations/supabase/query-builder.ts` | `SupaQuery` — traduz `.from().select().eq()...` em querystring REST. Thenable. |

- **Base da API** (`resolveApiBase`): `VITE_API_URL` → senão `http://localhost:4001`
  em dev → senão `""` (mesma origem) em prod.
- **Sessão**: cookie (`credentials: "include"`); o shim mantém `cachedSession` e um
  set de listeners para emular `onAuthStateChange`.

### 2.2 API — CRUD genérico (`server/src/lib/crud.ts` + `routes/data.ts`)

`makeCrudRouter(cfg)` gera, por tabela, as rotas `GET /`, `GET /:id`, `POST /`,
`PATCH /:id`, `DELETE /:id`. Características:

- **Whitelist de colunas** via `information_schema` (cacheada em `_colCache`) — só
  colunas reais entram em WHERE/SELECT/ORDER/INSERT/UPDATE; identificadores passam
  por regex `^[a-z_][a-z0-9_]*$` + backticks → **anti SQL-injection**.
- **Tradução de filtros** estilo PostgREST: `?col=eq.x`, `in.(a,b)`, `is.null`,
  `like/ilike` (= `LIKE`, MySQL é case-insensitive por collation).
- **Política de acesso por recurso** (substitui a RLS): `publicRead`, `publicInsert`,
  `anonReadFilter`, `writeRoles`. Definida em `routes/data.ts`:

  | tabela | leitura | escrita |
  |---|---|---|
  | imoveis | pública (`ativo=1`) | admin/gerente/corretor |
  | categorias / condominios / site_settings | pública | admin (+gerente) |
  | leads | — (autenticada) | insert público; gestão pela equipe |
  | profiles / user_roles / role_permissions | autenticada | admin |

- **PK gerada na aplicação** (`crypto.randomUUID()`) porque MySQL não tem
  `RETURNING` — o insert é seguido de um `SELECT` pela PK.

### 2.3 Autenticação e RBAC

- `server/src/auth/index.ts`: **better-auth** sobre o mesmo pool MySQL,
  email+senha, sessão por cookie (30 dias), IDs em UUID.
- `middleware/auth.ts`: `attachSession` (não bloqueante) resolve a sessão e
  carrega `roles` de `user_roles`; `requireAuth` / `requireRole` protegem rotas.
- **RBAC** vive em `user_roles` (admin/gerente/corretor/financeiro) e a matriz de
  permissões por módulo em `role_permissions` (seed no `schema.sql`).
- `/api/rpc/get_user_roles` e `is_admin` reimplementam as funções Postgres.

### 2.4 Storage, Feed, Admin

- **Storage** (`routes/storage.ts`): upload multipart para `UPLOADS_DIR`, serve com
  cache, `safeJoin` contra path-traversal. Substitui o Supabase Storage.
- **Feed** (`routes/feed.ts`): gera o XML VRSync de todos os imóveis ativos — porta
  da edge function `canal-pro-feed`.
- **Admin** (`routes/admin.ts`): `POST /users` cria usuário (better-auth) + espelha
  em `profiles` + atribui papel. Porta da edge function `create-user`.

### 2.5 Banco — Model B

`db/schema.sql` é a fonte da verdade (derivado do schema VIVO do Supabase). Tabelas:
`categorias`, `condominios`, **`imoveis`** (principal), `leads`, `profiles`,
`user_roles`, `role_permissions`, `site_settings`. Conversões Postgres→MySQL:
`UUID()`/`CHAR(36)`, `DATETIME` (UTC), `DECIMAL`, `TINYINT(1)`, `JSON`, `ENUM`,
busca via `FULLTEXT`. Tabelas do better-auth ficam fora (migração separada).

Ver `db/README.md` para a sequência de bootstrap.

---

## 3. Deploy

- **Frontend**: `Dockerfile` (build Vite → nginx estático), serviço `web` no
  `docker-compose.yml`.
- **Banco**: serviço `db` (MySQL 8) no `docker-compose.yml`, com `db/schema.sql`
  auto-carregado no 1º boot.
- **API**: hoje roda só via `npm run dev` em `server/` — **ainda não há serviço no
  compose nem Dockerfile próprio** (ver achado #2).

---

## 4. Revisão de arquiteto — achados

Severidade: 🔴 bloqueia produção · 🟠 funcional/segurança · 🟡 robustez/dívida.

### ✅ C1. O read-model do site público ainda aponta para o "Model A" morto — RESOLVIDO via views
`src/hooks/useImoveis.ts` consulta `from("imoveis_completo")` com colunas
`transacao`, `preco`, `valor_aluguel`, `legacy_id`, `titulo`, `descricao`,
`dormitorios`, `imagem_principal`, `corretor_*`… (interface `ImovelDB`, linhas
11–60). **Nada disso existe no Model B** (`imoveis`: `codigo_imovel`,
`titulo_imovel`, `preco_venda`, `fotos` JSON, `qtd_dormitorios`…), e
`imoveis_completo` **não está registrado** em `routes/data.ts` (`DATA_RESOURCES`).
Resultado: `GET /api/data/imoveis_completo` → **404**; a listagem, busca e detalhe
do site público não funcionam contra a API nova.
→ **Feito (opção VIEW):** `db/views.sql` cria `imoveis_completo` e `imoveis_imagens`
projetando o Model B (`imoveis` + `profiles`, com `JSON_TABLE` para explodir
`fotos`) no shape do Model A; registradas como recursos read-only públicos em
`routes/data.ts`; `enc()` do query-builder passou a mandar booleanos como `1/0`
(senão `ativo`/`destaque`/`lancamento` não casariam no `TINYINT`).
**Pendente irmão:** `useCategorias` ainda pede `titulo/grupo/posicao/legacy_id`
em `categorias` (Model B usa `nome/ordem`) — mesma classe de problema, próximo alvo.

### 🔴 C2. Produção não tem como alcançar a API (sem proxy `/api`)
Em produção `resolveApiBase()` retorna `""` (mesma origem), então o front chama
`/api/...` no nginx. Mas `nginx.conf` **não tem `location /api`** — tudo cai no
SPA fallback e devolve `index.html`. Além disso o `docker-compose.yml` não sobe a
API. → **Ação:** adicionar serviço `api` (Dockerfile do `server/`) ao compose e um
`location /api/ { proxy_pass http://api:4001; }` no nginx (repassando cookies e
`Host`). Sem isso, só o dev (cross-origin :4001) funciona.

### 🟠 C3. Vazamento de PII do proprietário na leitura pública de imóveis
`imoveis` tem `proprietario_nome/telefone/email/documento`. O recurso é
`publicRead`, e o CRUD faz `SELECT *` por padrão (`buildSelect` → `"*"`). Um
visitante anônimo pode ler esses campos — inclusive filtrando por eles
(`?proprietario_telefone=eq...`). → **Ação:** adicionar à `ResourceConfig` uma
whitelist de colunas para leitura anônima (`publicColumns`) e aplicá-la tanto no
SELECT quanto na validação de filtros quando `anon === true`.

### 🟠 C4. `UPDATE`/`DELETE` por coluna ≠ `id` falham silenciosamente (404)
O `query-builder` só reconhece o filtro literal `"id"` para virar `PATCH/DELETE
/:id`; qualquer outro vira `PATCH /api/data/<t>?<filtro>` — e o CRUD **não tem
rota PATCH/DELETE no nível da coleção**. Call sites quebrados confirmados:
- `src/components/HeroSection.tsx:50` e `AdminCategorias.tsx:74,88`:
  `.update().eq("key","hero_banner")` em `site_settings` (cuja PK é `key`, não `id`).
- `src/pages/admin/AdminUsuarios.tsx:79`:
  `.delete().eq("user_id", …)` em `user_roles`.
→ **Ação (uma das duas):** (a) no `query-builder`, quando houver exatamente um
filtro `eq` na PK do recurso, rotear para `/:valor`; **e/ou** (b) implementar no
CRUD `PATCH /` e `DELETE /` por filtro (com guarda exigindo ≥1 filtro, para nunca
afetar a tabela inteira). A opção (b) é a mais fiel ao supabase-js.

### 🟠 C5. Busca textual (`.or()`) é descartada silenciosamente
`useImoveis.ts:186` faz `.or("titulo.ilike…,descricao.ilike…,bairro…,cidade…")`
para o campo de busca livre. O shim implementa `.or()` como **no-op com
`console.warn`** (`query-builder.ts:49`). A busca retorna a lista inteira sem
filtrar. → **Ação:** expor o índice `FULLTEXT ft_imoveis` via um parâmetro
dedicado (ex.: `?q=` → `MATCH(...) AGAINST(? IN BOOLEAN MODE)`) no CRUD de imóveis,
e mapear `.or()`/busca do front para ele.

### 🟠 C6. `baseURL` do better-auth aponta para o frontend, não para a API
`auth/index.ts` usa `baseURL: env.APP_PUBLIC_URL` (= `http://localhost:8080`).
O handler do better-auth vive em `/api/auth/*` na **API (:4001)**. Em dev
cross-origin, URLs/callbacks e validação de origem do better-auth são montados
sobre a origem errada. → **Ação:** introduzir `API_PUBLIC_URL` (a origem onde
`/api` é servido) e usá-la como `baseURL`; manter `APP_PUBLIC_URL` só para
trusted origins/CORS. Em prod (mesma origem via proxy) coincidem; em dev, não.

### 🟠 C7. Reset de senha / verificação de email sem provedor de email
`emailAndPassword` está habilitado e o shim expõe `resetPasswordForEmail`, mas
`authOptions` não configura envio de email (`sendResetPassword`/`emailVerification`).
O fluxo de "esqueci a senha" não entrega nada. → **Ação:** configurar um
transporte (SMTP/Resend) ou esconder o fluxo de reset na UI até existir.

### 🟡 R8. Insert anônimo de `leads` sem whitelist de colunas
`publicInsert: true` aceita qualquer coluna existente (`status`, `corretor_id`…).
Um visitante pode forjar `status='ganho'` ou vincular corretor. → **Ação:**
`insertColumns` permitidas para inserts anônimos.

### 🟡 R9. Auto-UUID assume PK chamada de forma genérica
No `POST` do CRUD, se `allowed.has(pk)` e o valor vem vazio, gera `randomUUID()`.
Para `site_settings` (pk = `key`), inserir sem `key` produziria uma key UUID
aleatória em vez de erro. → **Ação:** só auto-gerar UUID quando a PK for de tipo
UUID/`id`; caso contrário exigir o valor.

### 🟡 R10. `attachSession` faz I/O de sessão + roles em **toda** requisição
Inclui navegação pública (cada `GET imoveis` dispara `getSession` + query de
roles). → **Ação:** curto-circuito quando não há cookie de sessão; opcional cache
curto de roles por usuário.

### 🟡 R11. Diferenças de contrato com o supabase-js que podem confundir call sites
- `.delete()` devolve `{ok:true}`, não as linhas removidas (supabase devolve linhas
  com `.select()`).
- `single()` devolve `null` em 0 linhas (200) em vez de erro `PGRST116`.
- `.contains()` é no-op.
- Insert/post não é transacional no loop multi-linha (falha parcial deixa linhas).
→ **Ação:** alinhar onde algum call site depende do comportamento antigo; documentar
o subconjunto suportado no topo do `query-builder.ts`.

### 🟡 R12. `@supabase/supabase-js` ainda é dependência
Mantido por tipos (`User`, `Session` em `AdminAuthContext.tsx`) e pelo peso
histórico. → **Ação:** extrair os poucos tipos usados para `api/client.ts` e
remover o pacote, evitando confusão sobre qual cliente é real.

### 🟡 R13. ETL: filtro rígido `r.length === 57`
`import-imoveis-mysql.ts:336` descarta qualquer `produtos` cujo nº de colunas ≠ 57.
Se o dump variar (export parcial), todos os registros somem sem aviso. Também não
mapeia `area_total/area_util/qtd_banheiros/qtd_vagas/bairro` (ficam nulos).
→ **Ação:** tolerância + log das linhas descartadas; completar campos quando o
legado tiver.

---

## 5. Roadmap priorizado

1. **C1** — alinhar o read-model do site (`useImoveis`/`useImovel` → `imoveis`
   Model B, ou VIEW `imoveis_completo`). *Sem isso o site não lista nada.*
2. **C2** — serviço `api` no compose + proxy `/api` no nginx. *Sem isso não há prod.*
3. **C4 + C5** — corrigir update/delete por PK e a busca textual. *Admin e busca.*
4. **C3 + R8** — fechar PII e inserts anônimos. *Segurança/privacidade.*
5. **C6 + C7** — `baseURL` correto e email de auth. *Login/reset confiáveis.*
6. **R9–R13** — robustez e limpeza de dívida.

> Observação de método: este documento foi escrito a partir da leitura do código
> (front shim, rotas da API, schema e ETL). Os itens C1, C2, C4 e C5 estão
> confirmados por inspeção dos call sites citados; os demais são riscos de
> arquitetura a validar em runtime quando o stack subir (Docker/MySQL não estavam
> disponíveis no ambiente onde este doc foi gerado).
