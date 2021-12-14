import { loadEnvConfig } from '@next/env'

// so this just sources .env.test
// hmm, i guess supabase itself inlines its admin key?
// https://github.com/supabase/supabase/blob/master/tests/jest-env.js

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
