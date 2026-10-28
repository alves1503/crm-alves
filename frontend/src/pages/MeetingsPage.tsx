import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { salesService } from "../services/salesService";
import type { Lead, SalesMeeting } from "../types/sales";

const meetingFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
});

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<SalesMeeting[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [nextMeetings, nextLeads] = await Promise.all([
        salesService.meetings(),
        salesService.leads(),
      ]);
      setMeetings(nextMeetings);
      setLeads(nextLeads);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao carregar agenda.",
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
      await salesService.schedule({
        leadId: Number(data.get("leadId")),
        startsAt: new Date(String(data.get("startsAt"))).toISOString(),
        durationMinutes: Number(data.get("durationMinutes")),
        notes: String(data.get("notes") || ""),
      });
      event.currentTarget.reset();
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao agendar reunião.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="sales-page-content">
      <div className="sales-page-heading">
        <div>
          <span className="eyebrow">AGENDA COMERCIAL</span>
          <h2>Reuniões</h2>
          <p>Reuniões registradas pela IA ou pela equipe.</p>
        </div>
      </div>
      {error && (
        <p className="sales-error" role="alert">
          {error}
        </p>
      )}
      <div className="meeting-layout">
        <form
          className="sales-form meeting-form"
          onSubmit={(event) => void submit(event)}
        >
          <h3>
            <CalendarDays size={17} /> Agendar reunião
          </h3>
          <label className="field">
            Lead *
            <select name="leadId" required defaultValue="">
              <option value="" disabled>
                Selecione um lead
              </option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.fullName || lead.phone} · {lead.phone}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Data e horário *
            <input name="startsAt" type="datetime-local" required />
          </label>
          <label className="field">
            Duração
            <select name="durationMinutes" defaultValue="30">
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1h30</option>
            </select>
          </label>
          <label className="field">
            Pauta
            <textarea name="notes" rows={3} maxLength={500} />
          </label>
          <button
            className="button button-primary"
            disabled={saving || !leads.length}
          >
            {saving ? "Agendando..." : "Confirmar reunião"}
          </button>
          {!leads.length && (
            <small className="field-hint">
              Cadastre um lead antes de marcar uma reunião.
            </small>
          )}
        </form>
        <div className="meeting-list">
          <h3>
            Agenda completa <span>{meetings.length}</span>
          </h3>
          {meetings.map((meeting) => (
            <article className="meeting-item" key={meeting.id}>
              <div className="meeting-date-icon">
                <CalendarDays size={18} />
              </div>
              <div className="meeting-item-main">
                <strong>{meeting.leadName || meeting.phone}</strong>
                <time>
                  {meetingFormatter.format(new Date(meeting.startsAt))}
                </time>
                <span>
                  {meeting.phone} · {meeting.durationMinutes} min
                </span>
                {meeting.notes && <p>{meeting.notes}</p>}
              </div>
              <span className="stage-pill stage-scheduled">
                {meeting.status}
              </span>
            </article>
          ))}
          {!meetings.length && (
            <div className="sales-empty-block">
              <Clock3 size={22} />
              <strong>Agenda vazia</strong>
              <span>
                As reuniões marcadas pela IA e pela equipe aparecerão aqui.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
