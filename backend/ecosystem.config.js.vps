module.exports = {
  apps: [
    {
      name: "sys-logger",
      script: "/root/Sys_Logger/backend/venv/bin/gunicorn",
      args: "--worker-class eventlet -w 1 --bind 0.0.0.0:5010 sys_logger:app",
      cwd: "/root/Sys_Logger/backend",
      interpreter: "none",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        PYTHONUNBUFFERED: "1",
        PORT: "5010"
      }
    },
  ],
};
