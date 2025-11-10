const { exec } = require('child_process');
const fs = require('fs');

exec('git rev-parse --short HEAD', (error, stdout, stderr) => {
  const commitHash = stdout.trim();

  const now = new Date();
  const buildNumber = `V1.0.${commitHash}.${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getDate()}:${(now.getMonth() + 1)}:${now.getFullYear()}`;

  const contents = `export const BUILD_INFO = {
    buildNumber: '${buildNumber}'
  };
  `;

  fs.writeFileSync('./src/app/build-info.ts', contents);
});
