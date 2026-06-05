// ============================================================================
// Query-builder compatível com supabase-js, traduzindo para a camada REST por
// recurso (/api/data/<tabela>). Mantém os call sites .from() intactos.
//
// Suporta: select/insert/update/delete/upsert + eq/neq/gt/gte/lt/lte/in/is/like/
// ilike/match/filter/not(is) + order/limit/range + single/maybeSingle. Thenable.
// ============================================================================
import { api } from "../api/client";

type Op = "select" | "insert" | "update" | "delete" | "upsert";
interface Result { data: any; error: Error | null; count: number | null; }

export class SupaQuery implements PromiseLike<Result> {
  private op: Op = "select";
  private body: unknown = undefined;
  private filters: Array<[string, string]> = [];
  private selectCols = "*";
  private orderParts: string[] = [];
  private limitN: number | null = null;
  private offsetN = 0;
  private _single: "one" | "maybe" | null = null;

  constructor(private table: string) {}

  select(cols = "*") { if (this.op === "select") this.selectCols = cols || "*"; return this; }
  insert(rows: unknown) { this.op = "insert"; this.body = rows; return this; }
  upsert(rows: unknown) { this.op = "upsert"; this.body = rows; return this; }
  update(values: unknown) { this.op = "update"; this.body = values; return this; }
  delete() { this.op = "delete"; return this; }

  private add(col: string, opval: string) { this.filters.push([col, opval]); return this; }
  eq(c: string, v: unknown) { return this.add(c, `eq.${enc(v)}`); }
  neq(c: string, v: unknown) { return this.add(c, `neq.${enc(v)}`); }
  gt(c: string, v: unknown) { return this.add(c, `gt.${enc(v)}`); }
  gte(c: string, v: unknown) { return this.add(c, `gte.${enc(v)}`); }
  lt(c: string, v: unknown) { return this.add(c, `lt.${enc(v)}`); }
  lte(c: string, v: unknown) { return this.add(c, `lte.${enc(v)}`); }
  like(c: string, v: unknown) { return this.add(c, `like.${enc(v)}`); }
  ilike(c: string, v: unknown) { return this.add(c, `ilike.${enc(v)}`); }
  in(c: string, arr: unknown[]) { return this.add(c, `in.(${arr.map(enc).join(",")})`); }
  is(c: string, v: unknown) { return this.add(c, v === null ? "is.null" : `is.${enc(v)}`); }
  not(c: string, op: string, v: unknown) {
    if (op === "is" && v === null) return this.add(c, "is.not.null");
    return this.add(c, `${op}.${enc(v)}`);
  }
  match(obj: Record<string, unknown>) { for (const [k, v] of Object.entries(obj)) this.add(k, `eq.${enc(v)}`); return this; }
  filter(c: string, op: string, v: unknown) { return this.add(c, `${op}.${enc(v)}`); }
  contains(c: string, _v: unknown) { console.warn(`[shim] .contains('${c}') não suportado`); return this; }
  or(_expr: string) { console.warn("[shim] .or() não suportado pela camada REST"); return this; }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderParts.push(`${col}.${opts?.ascending === false ? "desc" : "asc"}`);
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.offsetN = from; this.limitN = to - from + 1; return this; }
  single() { this._single = "one"; return this; }
  maybeSingle() { this._single = "maybe"; return this; }

  private buildQuery(forMutation: boolean): string {
    const p = new URLSearchParams();
    for (const [k, v] of this.filters) p.append(k, v);
    if (!forMutation) {
      if (this.selectCols && this.selectCols !== "*") p.set("select", this.selectCols);
      if (this.orderParts.length) p.set("order", this.orderParts.join(","));
      if (this.limitN !== null) p.set("limit", String(this.limitN));
      if (this.offsetN) p.set("offset", String(this.offsetN));
      if (this._single) p.set("single", "true");
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  private async run(): Promise<Result> {
    const base = `/api/data/${this.table}`;
    try {
      let data: unknown;
      if (this.op === "select") {
        data = await api.get(`${base}${this.buildQuery(false)}`);
      } else if (this.op === "insert" || this.op === "upsert") {
        data = await api.post(base, this.body);
        if (this._single && Array.isArray(data)) data = data[0] ?? null;
      } else if (this.op === "update") {
        // update por id: usa o filtro eq.id se houver; senão PATCH por query.
        const idFilter = this.filters.find(([k, v]) => k === "id" && v.startsWith("eq."));
        if (idFilter) {
          const id = idFilter[1].slice(3);
          data = await api.patch(`${base}/${encodeURIComponent(id)}`, this.body);
        } else {
          data = await api.patch(`${base}${this.buildQuery(true)}`, this.body);
        }
        if (this._single && Array.isArray(data)) data = data[0] ?? null;
      } else {
        const idFilter = this.filters.find(([k, v]) => k === "id" && v.startsWith("eq."));
        if (idFilter) {
          const id = idFilter[1].slice(3);
          data = await api.delete(`${base}/${encodeURIComponent(id)}`);
        } else {
          data = await api.delete(`${base}${this.buildQuery(true)}`);
        }
        if (this._single && Array.isArray(data)) data = data[0] ?? null;
      }
      return { data, error: null, count: Array.isArray(data) ? data.length : null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)), count: null };
    }
  }

  then<R1 = Result, R2 = never>(
    onfulfilled?: ((v: Result) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

function enc(v: unknown): string {
  if (v === null || v === undefined) return "";
  // Colunas booleanas viram TINYINT(1) no MySQL: `eq.true` nunca casa (vira 0).
  if (typeof v === "boolean") return v ? "1" : "0";
  return String(v);
}
