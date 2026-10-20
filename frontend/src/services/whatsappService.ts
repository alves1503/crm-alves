import { apiClient, unwrapApiResponse } from './api'

export const whatsappService = {
  status() {
    return unwrapApiResponse(apiClient.GET('/api/whatsapp/status'))
  },
  qrCode() {
    return unwrapApiResponse(apiClient.GET('/api/whatsapp/qr'))
  },
}
