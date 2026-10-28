import { useEffect, useState, type FormEvent } from "react";
import { BookOpenText, FilePlus2, Save, Trash2 } from "lucide-react";
import { aiService } from "../services/aiService";
import type { TrainingSource } from "../types/sales";

export function TrainingPage() {
  const [instructions, setInstructions] = useState("");
  const [sources, setSources] = useState<TrainingSource[]>([]);
  const [selected, setSelected] = useState<TrainingSource | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [configured, setConfigured] = useState(false);

  async function load() {
    try {
      const data = await aiService.training();
      setInstructions(data.instructions);
      setSources(data.sources);
      setConfigured(data.configured);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Falha ao carregar treinamento.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function saveInstructions() {
    setSaving(true);
    setNotice("");
    try {
      const data = await aiService.saveInstructions(instructions);
      setInstructions(data.instructions);
      setNotice("Instruções salvas.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar instruções.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await aiService.saveSource({
        ...(selected ? { id: selected.id } : {}),
        title,
        content,
      });
      setSelected(null);
      setTitle("");
      setContent("");
      await load();
      setNotice("Material salvo e indexado para busca semântica.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao indexar material.",
      );
    } finally {
      setSaving(false);
    }
  }

  function edit(source: TrainingSource) {
    setSelected(source);
    setTitle(source.title);
    setContent(source.content);
  }

  async function remove(source: TrainingSource) {
    if (!window.confirm(`Excluir "${source.title}" da base da IA?`)) return;
    try {
      await aiService.deleteSource(source.id);
      if (selected?.id === source.id) {
        setSelected(null);
        setTitle("");
        setContent("");
      }
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao excluir material.",
      );
    }
  }

  return (
    <section className="sales-page-content training-page">
      <div className="sales-page-heading">
        <div>
          <span className="eyebrow">CENTRAL DE CONHECIMENTO</span>
          <h2>Treinamento da IA</h2>
          <p>
            Defina o comportamento e as informações que a assistente pode
            consultar.
          </p>
        </div>
      </div>
      {error && (
        <p className="sales-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="sales-notice" role="status">
          {notice}
        </p>
      )}
      <div
        className={`ai-config-status ${configured ? "ai-config-ready" : ""}`}
      >
        <span />
        {configured
          ? "IA ativa: OpenAI configurada e pronta para atender."
          : "IA desativada: configure AI_ENABLED=true e OPENAI_API_KEY no .env e reinicie o backend."}
      </div>
      <div className="training-layout">
        <div className="training-main">
          <form
            className="training-section"
            onSubmit={(event) => {
              event.preventDefault();
              void saveInstructions();
            }}
          >
            <div className="training-section-heading">
              <span className="training-icon">
                <BookOpenText size={18} />
              </span>
              <div>
                <h3>Instruções de comportamento</h3>
                <p>Regras, tom e limites para todas as respostas.</p>
              </div>
            </div>
            <textarea
              className="training-textarea"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={8}
              maxLength={10000}
            />
            <div className="training-footer">
              <small>{instructions.length}/10.000 caracteres</small>
              <button
                className="button button-primary"
                type="submit"
                disabled={saving}
              >
                <Save size={14} /> Salvar instruções
              </button>
            </div>
          </form>
          <form
            className="training-section"
            onSubmit={(event) => void saveSource(event)}
          >
            <div className="training-section-heading">
              <span className="training-icon">
                <FilePlus2 size={18} />
              </span>
              <div>
                <h3>
                  {selected
                    ? "Editar material"
                    : "Adicionar material de conhecimento"}
                </h3>
                <p>
                  Propostas, escopo, diferenciais, políticas e perguntas
                  frequentes.
                </p>
              </div>
            </div>
            <label className="field">
              Título
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={180}
                placeholder="Ex.: Processo de desenvolvimento"
              />
            </label>
            <label className="field">
              Conteúdo
              <textarea
                className="training-textarea"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                required
                maxLength={50000}
                placeholder="Inclua informações que a IA deve consultar para responder com precisão."
              />
            </label>
            <div className="training-footer">
              <small>O conteúdo será dividido e indexado por embeddings.</small>
              <div className="training-actions">
                {selected && (
                  <button
                    className="button button-light"
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                >
                  {saving ? "Indexando..." : "Salvar material"}
                </button>
              </div>
            </div>
          </form>
        </div>
        <aside className="training-sources">
          <div className="training-section-heading">
            <div>
              <h3>Materiais indexados</h3>
              <p>{sources.length} fontes disponíveis para busca.</p>
            </div>
          </div>
          {sources.map((source) => (
            <article
              className={`training-source ${selected?.id === source.id ? "training-source-selected" : ""}`}
              key={source.id}
            >
              <button
                className="training-source-edit"
                onClick={() => edit(source)}
              >
                <strong>{source.title}</strong>
                <span>
                  {source.content.length.toLocaleString("pt-BR")} caracteres
                </span>
              </button>
              <button
                className="icon-button"
                onClick={() => void remove(source)}
                aria-label={`Excluir ${source.title}`}
                title="Excluir fonte"
              >
                <Trash2 size={14} />
              </button>
            </article>
          ))}
          {!sources.length && (
            <div className="training-empty">
              Ainda não há materiais na base.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
