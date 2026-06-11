const PreCadastrosPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Pré Cadastros</h1>
      <p className="text-sm text-muted-foreground">Cadastros pendentes de aprovação</p>
    </div>
    <div className="bg-card border border-border rounded-xl p-6">
      <p className="text-muted-foreground text-sm">Nenhum pré cadastro encontrado.</p>
    </div>
  </div>
);

export default PreCadastrosPage;
