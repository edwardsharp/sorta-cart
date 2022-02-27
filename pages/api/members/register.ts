import type { NextApiRequest, NextApiResponse } from 'next'

import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { insertMember } from '../../../services/supabase/members'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'
import { Member } from '../../../types/supatypes'

type Data = {
  member: Member | null
  msg: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  // const { member, user, nonce } = req.body

  // #TODO: process payment, create user, assoc with member before insertMember

  try {
    const client = getSupabaseServiceRoleClient()
    const { member, msg } = await insertMember(req.body.member, client)
    if (member) {
      res.status(200).json({ member, msg })
    } else {
      res.status(200).json({ member: null, msg: 'unable to create member!' })
    }
  } catch (e) {
    console.warn('[/api/members/email-available] caught error! e:', e)
    res.status(200).json({ member: null, msg: `${e}` })
  }
}
