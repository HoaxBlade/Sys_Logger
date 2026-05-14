const path = require('path');

module.exports = {
  apps: [
    {
      name: "SysLoggerBackend",
      script: "sys_logger.py",
      cwd: path.join(__dirname, "backend"),
      interpreter: process.platform === 'win32' 
        ? path.join(__dirname, "backend", "venv", "Scripts", "python.exe") 
        : path.join(__dirname, "backend", "venv", "bin", "python3"),
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        PYTHONUNBUFFERED: "1",
        PORT: "5010"
      },
      windowsHide: true,
      error_file: path.join(__dirname, "backend", "backend_err.log"),
      out_file: path.join(__dirname, "backend", "backend_out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "SysLoggerFrontend",
      script: path.join(".next", "standalone", "server.js"),
      cwd: path.join(__dirname, "frontend"),
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      windowsHide: true,
      error_file: path.join(__dirname, "frontend", "frontend_err.log"),
      out_file: path.join(__dirname, "frontend", "frontend_out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    }
  ],
};
