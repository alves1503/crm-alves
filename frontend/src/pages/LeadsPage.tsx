import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search, UserRound } from "lucide-react";
import { salesService } from "../services/salesService";
import type { Lead } from "../types/sales";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setLeads(await salesService.leads());
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao carregar leads.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await salesService.saveLead({
        phone: String(data.get("phone")),
        fullName: String(data.get("fullName") || ""),
        email: String(data.get("email") || "") || undefined,
        company: String(data.get("company") || ""),
        interest: String(data.get("interest") || ""),
        notes: String(data.get("notes") || ""),
      });
      event.currentTarget.reset();
      setFormOpen(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar lead.",
      );
    } finally {
      setSaving(false);
    }
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleLeads = leads.filter((lead) =>
    [lead.fullName, lead.phone, lead.email, lead.company, lead.interest].some(
      (value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    ),
  );

  return (
    <section className="sales-page-content">
      <div className="sales-page-heading">
        <div>
          <span className="eyebrow">PIPELINE COMERCIAL</span>
          <h2>Leads</h2>
          <p>Contatos identificados pela IA e pela equipe.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setFormOpen((open) => !open)}
        >
          <Plus size={15} /> Novo lead
        </button>
      </div>
      {formOpen && (
        <form className="sales-form" onSubmit={(event) => void submit(event)}>
          <label className="field">
            Telefone *
            <input
              name="phone"
              required
              maxLength={30}
              placeholder="5511999999999"
            />
          </label>
          <label className="field">
            Nome
            <input name="fullName" maxLength={160} />
          </label>
          <label className="field">
            E-mail
            <input name="email" type="email" maxLength={180} />
          </label>
          <label className="field">
            Empresa
            <input name="company" maxLength={180} />
          </label>
          <label className="field field-wide">
            Interesse
            <input
              name="interest"
              maxLength={500}
              placeholder="O que precisa desenvolver?"
            />
          </label>
          <label className="field field-wide">
            Observações
            <textarea name="notes" rows={2} maxLength={5000} />
          </label>
          <div className="sales-form-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </button>
            <button className="button button-primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar lead"}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="sales-error" role="alert">
          {error}
        </p>
      )}
      <div className="sales-toolbar">
        <label className="crm-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar nome, empresa ou telefone"
          />
        </label>
        <span>{visibleLeads.length} contatos</span>
      </div>
      <div className="sales-table-wrap">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Contato</th>
              <th>Empresa</th>
              <th>Interesse</th>
              <th>Observações</th>
              <th>Etapa</th>
              <th>Adicionado</th>
            </tr>
          </thead>
          <tbody>
            {visibleLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="sales-contact">
                    <span className="sales-avatar">
                      <UserRound size={16} />
                    </span>
                    <span>
                      <strong>{lead.fullName || "Sem nome"}</strong>
                      <small>
                        {lead.phone}
                        {lead.email ? ` · ${lead.email}` : ""}
                      </small>
                    </span>
                  </div>
                </td>
                <td>{lead.company || "—"}</td>
                <td>{lead.interest || "—"}</td>
                <td>{lead.notes || "—"}</td>
                <td>
                  <span
                    className={`stage-pill stage-${lead.stage.toLowerCase()}`}
                  >
                    {lead.stage.replace(/_/g, " ")}
                  </span>
                </td>
                <td>{dateFormatter.format(new Date(lead.createdAt))}</td>
              </tr>
            ))}
            {!visibleLeads.length && (
              <tr>
                <td className="sales-empty" colSpan={6}>
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
