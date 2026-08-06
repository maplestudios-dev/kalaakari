/**
 * PM2 process definition for the KALAAKAARI API.
 *
 * Usage on the server:
 *   pm2 start scripts/deploy/ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup     # follow the printed command once to enable boot-time start
 *
 * Logs:
 *   pm2 logs kalaakaari-api
 *   pm2 status
 */
module.exports = {
  apps: [
    {
      name:         'kalaakaari-api',
      cwd:          './apps/api',         // relative to repo root
      script:       'src/index.js',
      exec_mode:    'fork',                // single process — flip to 'cluster' + instances:'max' if you outgrow it
      instances:    1,
      autorestart:  true,
      watch:        false,
      // Page uploads stream to disk and are streamed back out, so RSS stays
      // flat regardless of page size — this is headroom, not a working set.
      // Changing it needs `pm2 delete` + `pm2 start`; a reload won't pick it up.
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production'
        // Real secrets come from apps/api/.env (loaded by dotenv inside src/index.js)
      },
      // log files (PM2 default location: ~/.pm2/logs)
      out_file:   '~/.pm2/logs/kalaakaari-api-out.log',
      error_file: '~/.pm2/logs/kalaakaari-api-error.log',
      merge_logs: true,
      time:       true
    }
  ]
}
