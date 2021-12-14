import { loadEnvConfig } from '@next/env'

// so this just sources .env.test
export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
