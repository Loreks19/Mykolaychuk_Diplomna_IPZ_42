import { supabase } from './supabaseClient'
import { createSlug } from '../pages/admin/helpers'
import type { GameUploadResponse } from '../pages/admin/types'

const gameUploadWorkerUrl = import.meta.env.VITE_GAME_UPLOAD_WORKER_URL as string | undefined

const getAdminAccessToken = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (sessionError || !accessToken) {
    throw new Error(sessionError?.message ?? 'Admin session was not found.')
  }

  return accessToken
}

export const uploadGameArchive = async (gameId: number, title: string, file: File) => {
  if (!gameUploadWorkerUrl) {
    throw new Error('VITE_GAME_UPLOAD_WORKER_URL is missing in .env.')
  }

  const formData = new FormData()
  formData.append('slug', createSlug(title) || `game-${gameId}`)
  formData.append('file', file)

  const response = await fetch(gameUploadWorkerUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getAdminAccessToken()}`,
    },
    body: formData,
  })
  const responseBody = await response.json().catch(() => ({} as GameUploadResponse)) as GameUploadResponse

  if (!response.ok) {
    throw new Error(responseBody.error ?? `Worker upload failed with status ${response.status}.`)
  }

  if (!responseBody.play_url) {
    throw new Error('Worker did not return play_url.')
  }

  return responseBody.play_url
}

export const deleteGameArchive = async (slug: string) => {
  if (!gameUploadWorkerUrl) {
    return { deletedCount: 0, skipped: true }
  }

  const response = await fetch(`${gameUploadWorkerUrl}?slug=${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${await getAdminAccessToken()}`,
    },
  })
  const responseBody = await response.json().catch(() => ({ error: undefined, deleted_count: 0 })) as {
    deleted_count?: number
    error?: string
  }

  if (!response.ok) {
    throw new Error(responseBody.error ?? `Worker delete failed with status ${response.status}.`)
  }

  return { deletedCount: responseBody.deleted_count ?? 0, skipped: false }
}
