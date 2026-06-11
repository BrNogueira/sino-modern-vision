const AgendaPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Agenda</h1>
      <p className="text-sm text-muted-foreground">Compromissos e visitas agendadas</p>
    </div>
    <div className="bg-card border border-border rounded-xl p-6">
      <p className="text-muted-foreground text-sm">Nenhum compromisso agendado.</p>
    </div>
  </div>
);

export default AgendaPage;
