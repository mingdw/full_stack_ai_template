const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DEV_URL = 'http://127.0.0.1:5173';
const isWin = process.platform === 'win32';

/** @type {import('child_process').ChildProcess | null} */
let viteProc = null;
/** @type {import('child_process').ChildProcess | null} */
let tscProc = null;
/** @type {import('child_process').ChildProcess | null} */
let electronProc = null;
let shuttingDown = false;
let restartTimer = null;
let electronStartGeneration = 0;

function log(message) {
  console.log(`[dev] ${message}`);
}

function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: root,
    stdio: options.stdio ?? 'inherit',
    shell: isWin,
    env: { ...process.env, ...(options.env ?? {}) },
  });
}

function waitForUrl(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(tryOnce, 200);
      });
    };
    tryOnce();
  });
}

function stopProcess(proc, signal = 'SIGTERM') {
  if (!proc || proc.killed || proc.exitCode !== null) {
    return;
  }
  if (isWin && proc.pid) {
    spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: true,
    });
    return;
  }
  proc.kill(signal);
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  log('Shutting down…');
  if (restartTimer) {
    clearTimeout(restartTimer);
  }
  stopProcess(electronProc);
  stopProcess(tscProc);
  stopProcess(viteProc);
  setTimeout(() => process.exit(code), isWin ? 300 : 50);
}

function startElectron() {
  if (shuttingDown) {
    return;
  }

  const generation = ++electronStartGeneration;
  stopProcess(electronProc);

  log(`Starting Electron (${DEV_URL})…`);
  electronProc = run('npx', ['electron', '.'], {
    env: { VITE_DEV_SERVER_URL: DEV_URL },
  });

  electronProc.on('exit', (code, signal) => {
    if (shuttingDown || generation !== electronStartGeneration) {
      return;
    }
    // User closed the window / Electron exited on its own.
    log(`Electron exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`);
    shutdown(0);
  });
}

function scheduleElectronRestart(reason) {
  if (shuttingDown) {
    return;
  }
  if (restartTimer) {
    clearTimeout(restartTimer);
  }
  restartTimer = setTimeout(() => {
    log(`${reason}; restarting Electron…`);
    startElectron();
  }, 500);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function watchCompiledOutput() {
  const watchRoots = [
    path.join(root, 'dist', 'main'),
    path.join(root, 'dist', 'preload'),
    path.join(root, 'dist', 'services'),
    path.join(root, 'dist', 'shared'),
  ];

  // Ignore the first tsc --watch emit / Windows watcher warm-up so we don't bounce Electron on startup.
  let watchArmed = false;
  setTimeout(() => {
    watchArmed = true;
    log('Watching compiled main/preload output');
  }, 2500);

  for (const dir of watchRoots) {
    ensureDir(dir);
    fs.watch(dir, { recursive: true }, (_eventType, filename) => {
      if (!watchArmed || shuttingDown) {
        return;
      }
      if (!filename) {
        return;
      }
      // Ignore declaration/source-map chatter; restart on JS changes.
      if (!String(filename).endsWith('.js')) {
        return;
      }
      scheduleElectronRestart(`main/preload change: ${filename}`);
    });
  }
}

async function main() {
  log('Building main + preload…');
  try {
    execSync('npx tsc -p tsconfig.node.json', { cwd: root, stdio: 'inherit' });
  } catch {
    console.error('[dev] TypeScript compilation failed');
    process.exit(1);
  }

  log('Starting Vite dev server…');
  viteProc = run('npx', ['vite', '--host', '127.0.0.1', '--port', '5173', '--strictPort']);

  viteProc.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`[dev] Vite exited unexpectedly (code=${code ?? 'null'})`);
      shutdown(1);
    }
  });

  try {
    await waitForUrl(DEV_URL);
  } catch (err) {
    console.error(`[dev] ${err instanceof Error ? err.message : String(err)}`);
    shutdown(1);
    return;
  }
  log('Vite is ready');

  log('Watching main/preload TypeScript…');
  tscProc = run('npx', ['tsc', '-p', 'tsconfig.node.json', '--watch', '--preserveWatchOutput'], {
    stdio: 'pipe',
  });
  tscProc.stdout?.on('data', (chunk) => process.stdout.write(chunk));
  tscProc.stderr?.on('data', (chunk) => process.stderr.write(chunk));
  tscProc.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`[dev] tsc watch exited unexpectedly (code=${code ?? 'null'})`);
      shutdown(1);
    }
  });

  watchCompiledOutput();
  startElectron();

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

main().catch((err) => {
  console.error('[dev] Failed to start:', err);
  shutdown(1);
});
