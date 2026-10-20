import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { CheckCheck, ChevronDown, Headphones, LogOut, MessageCircle, Search, Send, Users, X } from 'lucide-react'
import Swal from 'sweetalert2'
import type { User } from '../types/auth'
import { conversationService } from '../services/conversationService'
import { whatsappService } from '../services/whatsappService'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { Conversation, ConversationMessage, ConversationStatus } from '../types/conversation'
import { statusLabels } from '../types/conversation'

type Filter = ConversationStatus | 'ALL'

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

const filters: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'OPEN', label: 'Novas' },
  { id: 'IN_PROGRESS', label: 'Em atendimento' },
  { id: 'WAITING', label: 'Aguardando' },
  { id: 'CLOSED', label: 'Encerradas' },
]

function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

function formatDay(value: string) {
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Hoje'
  return dateFormatter.format(date)
}

function initials(value: string) {
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function InboxPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [messagesForConversationId, setMessagesForConversationId] = useState<number | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [listError, setListError] = useState('')
  const [messageError, setMessageError] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [whatsappState, setWhatsappState] = useState('connecting')
  const [qrOpen, setQrOpen] = useState(false)
  const [qrBase64, setQrBase64] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  const conversationsRequestId = useRef(0)
  const messagesGeneration = useRef(0)
  const messagesRequestId = useRef(0)

  const loadConversations = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    const requestId = ++conversationsRequestId.current
    try {
      const result = await conversationService.list({
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(filter !== 'ALL' ? { status: filter } : {}),
      })
      if (requestId !== conversationsRequestId.current) return
      setConversations(result)
      setListError('')
      setSelectedId((current) => {
        if (current && result.some((conversation) => conversation.id === current)) return current
        return result[0]?.id ?? null
      })
    } catch (cause) {
      if (requestId === conversationsRequestId.current) {
        setListError(cause instanceof Error ? cause.message : 'Não foi possível carregar os atendimentos.')
      }
    } finally {
      if (requestId === conversationsRequestId.current) setLoading(false)
    }
  }, [debouncedSearch, filter])

  useEffect(() => { void loadConversations(true) }, [loadConversations])
  useEffect(() => {
    let timeout = 0
    const refresh = async () => {
      await loadConversations()
      timeout = window.setTimeout(() => void refresh(), 5000)
    }
    timeout = window.setTimeout(() => void refresh(), 5000)
    return () => window.clearTimeout(timeout)
  }, [loadConversations])

  useEffect(() => {
    let active = true
    const loadStatus = async () => {
      try {
        const status = await whatsappService.status()
        if (active) {
          setWhatsappConnected(status.connected)
          setWhatsappState(status.state)
        }
      } catch {
        if (active) {
          setWhatsappConnected(false)
          setWhatsappState('unavailable')
        }
      }
    }
    void loadStatus()
    const interval = window.setInterval(() => void loadStatus(), 10000)
    return () => { active = false; window.clearInterval(interval) }
  }, [])

  useEffect(() => {
    const generation = ++messagesGeneration.current
    if (!selectedId) {
      setMessages([])
      setMessagesForConversationId(null)
      setMessagesLoading(false)
      return
    }
    let active = true
    setMessages([])
    setMessagesForConversationId(selectedId)
    setMessagesLoading(true)
    setMessageError('')
    const loadMessages = async () => {
      const requestId = ++messagesRequestId.current
      try {
        const result = await conversationService.messages(selectedId)
        if (active && generation === messagesGeneration.current && requestId === messagesRequestId.current) {
          setMessages(result)
          setMessageError('')
        }
      } catch (cause) {
        if (active && generation === messagesGeneration.current && requestId === messagesRequestId.current) {
          setMessageError(cause instanceof Error ? cause.message : 'Não foi possível carregar as mensagens.')
        }
      } finally {
        if (active && generation === messagesGeneration.current && requestId === messagesRequestId.current) {
          setMessagesLoading(false)
        }
      }
    }
    let timeout = 0
    const refresh = async () => {
      await loadMessages()
      if (active) timeout = window.setTimeout(() => void refresh(), 4000)
    }
    void refresh()
    return () => { active = false; window.clearTimeout(timeout) }
  }, [selectedId])

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  )
  const visibleMessages = messagesForConversationId === selectedId ? messages : []
  const visibleMessagesLoading = messagesLoading || messagesForConversationId !== selectedId
  const latestMessageId = visibleMessages[visibleMessages.length - 1]?.id
  const openCount = conversations.filter((conversation) => conversation.status !== 'CLOSED').length
  const whatsappLabel = whatsappConnected
    ? 'WhatsApp conectado'
    : whatsappState === 'connecting' ? 'Aguardando QR Code' : 'WhatsApp desconectado'
  const messageSignature = `${user.displayName}\nAgente de atendimento | Alves.CRM`
  const suggestedFirstMessage = selected
    ? 'Olá! Entendo que no momento vocês estão ocupados com atendimentos. Quando estiverem disponíveis para conversar sobre como a Alves.CRM pode ajudar com soluções sob medida, fico à disposição. Se preferirem, podemos agendar uma reunião para entender melhor suas necessidades. É só me avisar!'
    : ''

  useEffect(() => {
    timelineRef.current?.scrollTo({ top: timelineRef.current.scrollHeight, behavior: 'smooth' })
  }, [selectedId, latestMessageId])

  async function openQrCode() {
    setQrOpen(true)
    setQrLoading(true)
    setQrError('')
    try {
      setQrBase64((await whatsappService.qrCode()).base64)
    } catch (cause) {
      setQrError(cause instanceof Error ? cause.message : 'Não foi possível carregar o QR Code.')
    } finally {
      setQrLoading(false)
    }
  }

  async function retryMessages(conversationId: number) {
    const generation = messagesGeneration.current
    const requestId = ++messagesRequestId.current
    setMessageError('')
    setMessagesLoading(true)
    try {
      const result = await conversationService.messages(conversationId)
      if (generation === messagesGeneration.current
        && requestId === messagesRequestId.current
        && selectedId === conversationId) setMessages(result)
    } catch (cause) {
      if (generation === messagesGeneration.current
        && requestId === messagesRequestId.current
        && selectedId === conversationId) {
        setMessageError(cause instanceof Error ? cause.message : 'Não foi possível carregar as mensagens.')
      }
    } finally {
      if (generation === messagesGeneration.current && requestId === messagesRequestId.current) {
        setMessagesLoading(false)
      }
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !draft.trim()) return
    const messageBody = draft.trim()
    const signedMessage = messageBody.startsWith(`${messageSignature}\n\n`)
      ? messageBody
      : `${messageSignature}\n\n${messageBody}`
    setSending(true)
    try {
      await conversationService.reply(selected.id, signedMessage)
      setDraft('')
      setMessages(await conversationService.messages(selected.id))
      void loadConversations()
    } catch (cause) {
      await Swal.fire({ icon: 'error', title: 'Mensagem não enviada', text: cause instanceof Error ? cause.message : 'Confira a conexão do WhatsApp.' })
    } finally {
      setSending(false)
    }
  }

  async function changeStatus(status: ConversationStatus) {
    if (!selected || selected.status === status) return
    if (status === 'CLOSED') {
      const result = await Swal.fire({
        title: 'Encerrar atendimento?',
        text: 'Uma mensagem padrão de encerramento será enviada ao cliente.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Encerrar e avisar',
        cancelButtonText: 'Voltar',
        reverseButtons: true,
        customClass: { popup: 'alves-swal', confirmButton: 'swal-confirm', cancelButton: 'swal-cancel' },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return
    }
    try {
      await conversationService.updateStatus(selected.id, status)
      await loadConversations()
      setMessages(await conversationService.messages(selected.id))
      if (status === 'CLOSED') {
        await Swal.fire({ icon: 'success', title: 'Atendimento encerrado', text: 'A mensagem padrão foi enviada ao cliente.', timer: 1800, showConfirmButton: false })
      }
    } catch (cause) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível alterar o status', text: cause instanceof Error ? cause.message : 'Tente novamente.' })
    }
  }

  return (
    <main className="crm-app">
      <aside className="crm-sidebar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>Alves<span className="brand-period">.CRM</span></span>
        </a>
        <div className="crm-workspace"><span className="workspace-avatar">A</span><span><strong>Alves.CRM</strong><small>Atendimento</small></span><ChevronDown size={15} /></div>
        <span className="crm-nav-label">ATENDIMENTO</span>
        <button className="crm-nav-active"><MessageCircle size={18} />Caixa de entrada<span>{openCount}</span></button>
        <button className={`crm-side-note ${whatsappConnected ? '' : 'crm-side-note-action'}`} onClick={() => !whatsappConnected && void openQrCode()} disabled={whatsappConnected}>
          <div className="whatsapp-mark">◉</div><strong>{whatsappLabel}</strong><span>{whatsappConnected ? 'Mensagens sincronizadas' : 'Clique para conectar seu telefone'}</span><i className={whatsappConnected ? '' : 'connection-pending'} />
        </button>
        <div className="crm-side-bottom">
          <div className="crm-user">
            <div className="crm-user-avatar">{initials(user.displayName)}</div>
            <span><strong>{user.displayName}</strong><small>Agente de atendimento</small></span>
            <button className="icon-button" onClick={onLogout} aria-label="Sair"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <section className="inbox-shell">
        <header className="crm-topbar">
          <div className="crm-top-title"><button className="mobile-back" onClick={() => setMobileListOpen(true)}><Users size={18} /></button><div><span className="eyebrow">RELACIONAMENTO</span><h1>Caixa de entrada</h1></div></div>
          <div className="crm-top-actions"><button className={`crm-sync ${whatsappConnected ? 'sync-connected' : 'sync-disconnected'}`} onClick={() => !whatsappConnected && void openQrCode()}><i />{whatsappLabel}</button></div>
        </header>
        <div className={`inbox-grid ${mobileListOpen ? 'show-list-mobile' : ''}`}>
          <section className="conversation-list">
            <div className="list-heading"><div><h2>Conversas <span>{conversations.length}</span></h2><p>Atendimentos recentes</p></div></div>
            <label className="crm-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar conversas..." /></label>
            <div className="filter-scroll">{filters.map((item) => <button key={item.id} className={`filter-pill ${filter === item.id ? 'filter-selected' : ''}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
            <div className="conversation-items">
              {loading ? <div className="inbox-empty"><span className="spinner" />Carregando conversas...</div>
                : listError && conversations.length === 0 ? <div className="inbox-empty inbox-error">{listError}<button onClick={() => void loadConversations(true)}>Tentar novamente</button></div>
                  : conversations.length === 0 ? <div className="inbox-empty"><div className="empty-icon"><MessageCircle size={20} /></div><strong>Nenhuma conversa ainda</strong><span>As mensagens enviadas para o WhatsApp conectado aparecerão aqui.</span></div>
                    : conversations.map((conversation, index) => (
                      <button key={conversation.id} className={`conversation-item ${selectedId === conversation.id ? 'conversation-selected' : ''}`} onClick={() => { setSelectedId(conversation.id); setMobileListOpen(false) }}>
                        <div className={`contact-avatar contact-color-${index % 5}`}>{initials(conversation.contactName)}</div>
                        <div className="conversation-preview"><div className="preview-top"><strong>{conversation.contactName}</strong><time>{formatTime(conversation.lastMessageAt)}</time></div><div className="preview-bottom"><span>{conversation.lastMessage || 'Iniciou uma conversa'}</span>{conversation.status === 'OPEN' && <i className="unread-dot" />}</div></div>
                      </button>
                    ))}
            </div>
          </section>

          <section className="chat-panel">
            {selected ? <>
              <header className="chat-header">
                <div className="chat-contact"><div className="contact-avatar contact-color-2">{initials(selected.contactName)}</div><div><strong>{selected.contactName}</strong><span><span className="whatsapp-small">◉</span> +{selected.phone}</span></div></div>
                <div className="chat-header-actions"><label className={`status-control status-${selected.status.toLowerCase()}`}><span /> <select aria-label="Status do atendimento" value={selected.status} onChange={(event) => void changeStatus(event.target.value as ConversationStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={14} /></label></div>
              </header>
              <div className="message-timeline" ref={timelineRef}>
                <div className="day-divider"><span />{visibleMessages[0] ? formatDay(visibleMessages[0].createdAt) : formatDay(selected.createdAt)}<span /></div>
                {visibleMessagesLoading && <div className="chat-loading"><span className="spinner" />Carregando mensagens...</div>}
                {messageError && <div className="chat-load-error" role="alert">{messageError}<button type="button" onClick={() => void retryMessages(selected.id)}>Tentar novamente</button></div>}
                {visibleMessages.map((message) => {
                  const hasSignature = message.direction === 'OUTBOUND'
                    && message.body.startsWith(`${messageSignature}\n\n`)
                  const messageText = hasSignature
                    ? message.body.slice(messageSignature.length + 2)
                    : message.body
                  return (
                    <article key={message.id} className={`message-row ${message.direction === 'OUTBOUND' ? 'message-outgoing' : ''}`}>
                      {message.direction === 'INBOUND' && <div className="message-avatar">{initials(selected.contactName)}</div>}
                      <div className="message-content">
                        <div className="message-bubble">
                          {hasSignature && <span className="message-signature"><strong>{user.displayName}</strong><span>Agente de atendimento | Alves.CRM</span></span>}
                          <span>{messageText}</span>
                        </div>
                        <div className="message-meta">{formatTime(message.createdAt)}{message.direction === 'OUTBOUND' && <CheckCheck size={13} />}</div>
                      </div>
                    </article>
                  )
                })}
                {!visibleMessagesLoading && !messageError && visibleMessages.length === 0 && selected.status !== 'CLOSED' && <div className="first-message-card">
                  <div className="first-message-heading">
                    <div className="message-avatar">{initials(user.displayName)}</div>
                    <div><strong>{user.displayName}</strong><span>Agente de atendimento · Alves.CRM</span></div>
                  </div>
                  <p>{suggestedFirstMessage}</p>
                  <button type="button" className="suggestion-button" onClick={() => { setDraft(suggestedFirstMessage); composerRef.current?.focus() }}>Usar como primeira mensagem</button>
                </div>}
                {!visibleMessagesLoading && !messageError && visibleMessages.length === 0 && selected.status === 'CLOSED' && <div className="start-conversation"><strong>Atendimento encerrado</strong><span>Reabra o atendimento para retomar a conversa com uma nova mensagem.</span></div>}
              </div>
              <form className="message-composer" onSubmit={(event) => void submitMessage(event)}>
                {selected.status === 'CLOSED' ? <div className="closed-banner">Este atendimento foi encerrado. Altere o status para reabrir a conversa.</div> : <>
                  <textarea ref={composerRef} aria-label="Escreva uma mensagem" rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Escreva sua mensagem..." />
                  <div className="composer-bottom"><span className="composer-signature">No início da mensagem: {user.displayName} · Agente de atendimento | Alves.CRM</span><button className="send-button" type="submit" disabled={sending || !draft.trim()}>{sending ? 'Enviando...' : 'Enviar'}<Send size={14} /></button></div>
                </>}
              </form>
            </> : <div className="no-selection"><div className="empty-icon"><Headphones size={21} /></div><h2>Seu atendimento começa aqui</h2><p>Selecione uma conversa para ver as mensagens e responder ao cliente.</p></div>}
          </section>
        </div>
      </section>
      {qrOpen && <div className="qr-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setQrOpen(false)}>
        <section className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-title">
          <button className="icon-button qr-close" onClick={() => setQrOpen(false)} aria-label="Fechar"><X size={18} /></button>
          <div className="login-icon"><MessageCircle size={21} /></div>
          <span className="eyebrow">CONECTE SEU WHATSAPP</span>
          <h2 id="qr-title">Leia o QR Code</h2>
          <p>Abra o WhatsApp no celular, vá em <strong>Aparelhos conectados</strong> e escaneie este código.</p>
          <div className="qr-image-area">{qrLoading ? <span className="spinner" /> : qrBase64 ? <img src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`} alt="QR Code de conexão do WhatsApp" /> : <span className="qr-error">{qrError}</span>}</div>
          <button className="button button-light qr-refresh" onClick={() => void openQrCode()} disabled={qrLoading}>Atualizar QR Code</button>
          <small>O código expira. Se isso acontecer, solicite um novo.</small>
        </section>
      </div>}
    </main>
  )
}
