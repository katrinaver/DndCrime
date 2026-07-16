// pm2 process definitions, mirroring the two deployments on the host:
// prod (~/DndCrime) and staging (~/DndCrimeStaging). CI rsyncs this file
// alongside backend/server (see .github/workflows/*), so the host copy is
// always current. PORT and the rest of the config come from backend/.env.
// Start/adopt: pm2 startOrReload ecosystem.config.js --only <name> && pm2 save
module.exports = {
  apps: [
    {
      name: "dnd-crime-api",
      cwd: "/home/gistrec/DndCrime/backend",
      script: "/home/gistrec/DndCrime/backend/server",
      interpreter: "none",
      autorestart: true,
    },
    {
      name: "dnd-crime-api-staging",
      cwd: "/home/gistrec/DndCrimeStaging/backend",
      script: "/home/gistrec/DndCrimeStaging/backend/server",
      interpreter: "none",
      autorestart: true,
    },
  ],
};
