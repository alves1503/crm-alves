import type { components } from '../api/schema'

export type ConversationStatus = NonNullable<components['schemas']['Conversation']['status']>
export type Conversation = components['schemas']['Conversation']
export type ConversationMessage = components['schemas']['ConversationMessage']

export const statusLabels: Record<ConversationStatus, string> = {
  OPEN: 'Novo',
  IN_PROGRESS: 'Em atendimento',
  WAITING: 'Aguardando',
  CLOSED: 'Encerrado',
}
