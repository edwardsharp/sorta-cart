import type { NextApiRequest, NextApiResponse } from 'next'

import { Member } from '../../../types/supatypes'
import { createPayment } from '../../../services/square/payments'
import { defaultCorsMiddleware } from '../../../lib/cors-middleware'
import { getSupabaseServiceRoleClient } from '../../../services/supabase/supabase'
import { insertMember } from '../../../services/supabase/members'

type Data = {
  member: Member | null
  msg: string
  user?: any | null
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await defaultCorsMiddleware(req, res)

  // console.log('[api/members/register] req.body:', req.body)
  const { member: newMember, user: newUser, sourceId } = req.body

  try {
    const amountCents = Math.round(newMember.fees_paid * 100)
    const paymentResponse = await createPayment({
      sourceId,
      amountCents,
    })

    // console.log(
    //   '[api/members/register] square payment result:',
    //   paymentResponse
    // )

    const client = getSupabaseServiceRoleClient()

    const { data: user, error } = await client.auth.api.createUser({
      email: newUser.email,
    })

    // console.log('[api/members/register]  createUser error, user:', error, user)
    if (error || !user) {
      res.status(200).json({ member: null, msg: 'unable to create member!' })
      return
    }

    //const { data: updateUserData, error: updateUserError } =
    await client.auth.api.updateUserById(user.id, {
      user_metadata: { marsh_role: 'member' },
    })

    const { member, msg } = await insertMember(
      { ...newMember, UserId: user.id },
      client
    )
    // console.log(
    //   '[api/members/register] insertMember msg, member:',
    //   msg,
    //   member,
    //   user
    // )

    if (member) {
      res.status(200).json({ member, msg: 'ok', user })
    } else {
      res.status(200).json({ member: null, msg: 'unable to create member!' })
    }
  } catch (e) {
    console.warn('[/api/members/email-available] caught error! e:', e)
    res.status(200).json({ member: null, msg: `${e}` })
  }
}
