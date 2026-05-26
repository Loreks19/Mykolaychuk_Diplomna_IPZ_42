import { unzipSync } from 'fflate'

type R2Bucket = {
  put: (
    key: string,
    value: Uint8Array,
    options?: {
      httpMetadata?: {
        contentType?: string
        cacheControl?: string
      }
    },
  ) => Promise<unknown>
}

type Env = {
  GAME_BUCKET: R2Bucket
  PUBLIC_GAMES_BASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

type SupabaseUserResponse = {
  id?: string
  error?: string
  msg?: string
}

const MAX_ZIP_SIZE = 95 * 1024 * 1024
const ALLOWED_ORIGIN = '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

const cleanPath = (path: string) =>
  path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')

const createSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0430-\u044f\u0456\u0457\u0454\u0491\s-]/giu, '')
    .replace(/\s+/g, '-')

const getContentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'html':
    case 'htm':
      return 'text/html; charset=utf-8'
    case 'js':
    case 'mjs':
      return 'application/javascript; charset=utf-8'
    case 'css':
      return 'text/css; charset=utf-8'
    case 'json':
      return 'application/json; charset=utf-8'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'ico':
      return 'image/x-icon'
    case 'mp3':
      return 'audio/mpeg'
    case 'ogg':
      return 'audio/ogg'
    case 'wav':
      return 'audio/wav'
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'wasm':
      return 'application/wasm'
    case 'ttf':
      return 'font/ttf'
    case 'otf':
      return 'font/otf'
    case 'woff':
      return 'font/woff'
    case 'woff2':
      return 'font/woff2'
    default:
      return 'application/octet-stream'
  }
}

const verifyAdmin = async (request: Request, env: Env) => {
  const authorization = request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing authorization token.' }
  }

  const accessToken = authorization.slice('Bearer '.length)
  const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!userResponse.ok) {
    return { ok: false, status: 401, message: 'Invalid authorization token.' }
  }

  const user = await userResponse.json() as SupabaseUserResponse

  if (!user.id) {
    return { ok: false, status: 401, message: 'User was not found.' }
  }

  const adminResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!adminResponse.ok) {
    return { ok: false, status: 403, message: 'Could not verify user role.' }
  }

  const isAdmin = await adminResponse.json() as boolean

  if (!isAdmin) {
    return { ok: false, status: 403, message: 'Only admins can upload games.' }
  }

  return { ok: true, status: 200, message: 'OK' }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405)
    }

    const adminCheck = await verifyAdmin(request, env)

    if (!adminCheck.ok) {
      return json({ error: adminCheck.message }, adminCheck.status)
    }

    const contentLength = Number(request.headers.get('Content-Length') ?? 0)

    if (contentLength > MAX_ZIP_SIZE) {
      return json({ error: 'ZIP file is too large. Maximum size is 95 MB.' }, 413)
    }

    const formData = await request.formData()
    const slugValue = formData.get('slug')
    const zipValue = formData.get('file')

    if (typeof slugValue !== 'string') {
      return json({ error: 'Game slug is required.' }, 400)
    }

    if (!(zipValue instanceof File)) {
      return json({ error: 'ZIP file is required.' }, 400)
    }

    if (zipValue.size > MAX_ZIP_SIZE) {
      return json({ error: 'ZIP file is too large. Maximum size is 95 MB.' }, 413)
    }

    const slug = createSlug(slugValue)

    if (!slug) {
      return json({ error: 'Game slug is invalid.' }, 400)
    }

    let files: Record<string, Uint8Array>

    try {
      files = unzipSync(new Uint8Array(await zipValue.arrayBuffer()))
    } catch {
      return json({ error: 'Could not unzip archive.' }, 400)
    }

    const entries = Object.entries(files)
      .map(([path, bytes]) => [cleanPath(path), bytes] as const)
      .filter(([path]) => path && !path.startsWith('__MACOSX/') && !path.endsWith('.DS_Store'))

    const indexEntry = entries.find(([path]) => path.toLowerCase().endsWith('/index.html'))
      ?? entries.find(([path]) => path.toLowerCase() === 'index.html')

    if (!indexEntry) {
      return json({ error: 'index.html was not found in ZIP archive.' }, 400)
    }

    const rootPrefix = indexEntry[0].replace(/index\.html$/i, '')
    const uploadRoot = `games/${slug}`
    let uploadedCount = 0

    for (const [path, bytes] of entries) {
      const relativePath = rootPrefix && path.startsWith(rootPrefix)
        ? path.slice(rootPrefix.length)
        : path

      if (!relativePath) {
        continue
      }

      await env.GAME_BUCKET.put(`${uploadRoot}/${relativePath}`, bytes, {
        httpMetadata: {
          contentType: getContentType(relativePath),
          cacheControl: 'public, max-age=31536000',
        },
      })

      uploadedCount += 1
    }

    const baseUrl = env.PUBLIC_GAMES_BASE_URL.replace(/\/+$/, '')
    const playUrl = `${baseUrl}/${uploadRoot}/index.html`

    return json({
      play_url: playUrl,
      uploaded_count: uploadedCount,
    })
  },
}
