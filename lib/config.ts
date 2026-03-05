export const POLL_INTERVAL_MS = 3_000
export const MAX_MESSAGE_CHARS = 500
export const MAX_STORED_MESSAGES = 200
export const MESSAGE_GROUP_THRESHOLD_MS = 90_000

export const LINE_API_PUSH_URL = 'https://api.line.me/v2/bot/message/push'
export const LINE_API_PROFILE_URL = 'https://api.line.me/v2/bot/profile'

// NOTE: Only call getLineServerConfig() inside API route handlers.
//       Never import it in client components — it reads server-only env vars.
export function getLineServerConfig() {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const channelSecret = process.env.LINE_CHANNEL_SECRET

  if (!channelAccessToken || !channelSecret) {
    throw new Error(
      'Missing LINE environment variables. ' +
        'Ensure LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET are set in .env.local'
    )
  }

  return { channelAccessToken, channelSecret }
}
