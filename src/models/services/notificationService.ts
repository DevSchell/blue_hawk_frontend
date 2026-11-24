import type { AppNotification } from '../notification'
import { apiGet, apiPost } from './apiClient'

export function listNotifications(page = 0, signal?: AbortSignal) {
  return apiGet<AppNotification[]>('/notifications', { page, size: 20 }, signal)
}

export function getUnreadCount(signal?: AbortSignal) {
  return apiGet<{ count: number }>('/notifications/unread-count', {}, signal)
}

export function markNotificationRead(id: string) {
  return apiPost<AppNotification>(`/notifications/${encodeURIComponent(id)}/read`, undefined)
}

export function markAllNotificationsRead() {
  return apiPost<{ count: number }>('/notifications/read-all', undefined)
}
