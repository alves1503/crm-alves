import { useEffect, useState, type FormEvent } from "react";
import { BriefcaseBusiness, Pencil, Plus } from "lucide-react";
import { salesService } from "../services/salesService";
import type { ServiceOffer } from "../types/sales";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function ServicesPage() {
  const [services, setServices] = useState<ServiceOffer[]>([]);
  const [editing, setEditing] = useState<ServiceOffer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setServices(await salesService.services());
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao carregar serviços.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);

  function startEdit(service?: ServiceOffer) {
    setEditing(service ?? null);
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await salesService.saveService({
        ...(editing ? { id: editing.id } : {}),
        name: String(data.get("name")),
        summary: String(data.get("summary")),
        description: String(data.get("description")),
        priceFrom: data.get("priceFrom") ? Number(data.get("priceFrom")) : null,
        priceTo: data.get("priceTo") ? Number(data.get("priceTo")) : null,
        deliveryEstimate: String(data.get("deliveryEstimate") || ""),
        active: data.get("active") === "on",
      });
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar serviço.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="sales-page-content">
      <div className="sales-page-heading">
        <div>
          <span className="eyebrow">PORTFÓLIO</span>
          <h2>Serviços</h2>
          <p>O catálogo exibido ao cliente pela IA e pela equipe.</p>
        </div>
        <button className="button button-primary" onClick={() => startEdit()}>
          <Plus size={15} /> Novo serviço
        </button>
      </div>
      {error && (
        <p className="sales-error" role="alert">
          {error}
        </p>
      )}
      {formOpen && (
        <form
          className="sales-form service-form"
          onSubmit={(event) => void submit(event)}
        >
          <label className="field">
            Nome *
            <input
              name="name"
              required
              maxLength={140}
              defaultValue={editing?.name ?? ""}
            />
          </label>
          <label className="field">
            Resumo *
            <input
              name="summary"
              required
              maxLength={300}
              defaultValue={editing?.summary ?? ""}
            />
          </label>
          <label className="field field-wide">
            Descrição *
            <textarea
              name="description"
              required
              rows={3}
              maxLength={5000}
              defaultValue={editing?.description ?? ""}
            />
          </label>
          <label className="field">
            Investimento inicial (R$)
            <input
              name="priceFrom"
              type="number"
              min="0"
              step="100"
              defaultValue={editing?.priceFrom ?? ""}
            />
          </label>
          <label className="field">
            Investimento final (R$)
            <input
              name="priceTo"
              type="number"
              min="0"
              step="100"
              defaultValue={editing?.priceTo ?? ""}
            />
          </label>
          <label className="field">
            Prazo estimado
            <input
              name="deliveryEstimate"
              maxLength={120}
              defaultValue={editing?.deliveryEstimate ?? ""}
            />
          </label>
          <label className="service-active">
            <input
              name="active"
              type="checkbox"
              defaultChecked={editing?.active ?? true}
            />{" "}
            Ativo para apresentação pela IA
          </label>
          <div className="sales-form-actions">
            <button
              className="button button-light"
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            >
              Cancelar
            </button>
            <button className="button button-primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar serviço"}
            </button>
          </div>
        </form>
      )}
      <div className="service-grid">
        {services.map((service) => (
          <article
            className={`service-item ${service.active ? "" : "service-inactive"}`}
            key={service.id}
          >
            <div className="service-item-head">
              <span className="service-icon">
                <BriefcaseBusiness size={18} />
              </span>
              <button
                className="icon-button"
                onClick={() => startEdit(service)}
                aria-label={`Editar ${service.name}`}
                title="Editar serviço"
              >
                <Pencil size={15} />
              </button>
            </div>
            <div className="service-status">
              {service.active ? "ATIVO" : "INATIVO"}
            </div>
            <h3>{service.name}</h3>
            <p className="service-summary">{service.summary}</p>
            <p className="service-description">{service.description}</p>
            <div className="service-meta">
              <strong>
                {service.priceFrom != null
                  ? currency.format(service.priceFrom)
                  : "Sob consulta"}
                {service.priceTo != null
                  ? ` a ${currency.format(service.priceTo)}`
                  : ""}
              </strong>
              <span>{service.deliveryEstimate || "Prazo sob avaliação"}</span>
            </div>
          </article>
        ))}
        {!services.length && (
          <div className="sales-empty-block">
            <BriefcaseBusiness size={22} />
            <strong>Seu catálogo começa aqui</strong>
            <span>
              Cadastre seus serviços para a IA apresentar informações corretas.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
