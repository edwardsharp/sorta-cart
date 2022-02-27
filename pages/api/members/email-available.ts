import type { NextApiRequest, NextApiResponse } from 'next'

import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { checkIfEmailAvailable } from '../../../services/supabase/members'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'

type Data = {
  ok: boolean
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  const { email } = req.body

  try {
    const client = getSupabaseServiceRoleClient()
    const ok = await checkIfEmailAvailable(email, client)
    res.status(200).json({ ok })
  } catch (e) {
    console.warn('[/api/members/email-available] caught error! e:', e)
    res.status(200).json({ ok: false })
  }
}
