const fs = require('fs')
const path = require('path')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return env

      const index = trimmed.indexOf('=')
      if (index === -1) return env

      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim()
      env[key] = value.replace(/^['"]|['"]$/g, '')
      return env
    }, {})
}

const backendDir = path.join(__dirname, 'backend')

module.exports = {
  apps: [
    {
      name: 'dnd-crime-api',
      cwd: backendDir,
      script: './server',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        ...loadEnv(path.join(backendDir, '.env')),
      },
    },
  ],
}
