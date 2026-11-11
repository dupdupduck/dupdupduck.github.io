// Caro Arena - engine worker (Gomocup protocol over stdin/stdout)
// v2: catches every failure (incl. Emscripten ExitStatus, a plain object)
// and reports it as a structured message instead of dying silently.
let EngineInstance = null;
let starting = false;

function locateFile(url) {
  if (/^rapfi.*\.data$/.test(url)) url = 'rapfi.data';
  return '/build/' + url;
}

function describeErr(err) {
  if (err == null) return 'unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return (err.name ? err.name + ': ' : '') + (err.message || '');
  if (typeof err === 'object') {
    if (err.name === 'ExitStatus') return 'engine exited (status ' + err.status + ')';
    if (err.message) return String(err.message);
    try { return JSON.stringify(err); } catch (x) { return String(err); }
  }
  return String(err);
}

// Intercept uncaught errors inside the worker (e.g. ExitStatus from the
// engine runtime) so the main thread can restart instead of hanging.
self.addEventListener('error', (e) => {
  self.postMessage({ type: 'worker-error', data: describeErr(e.error || e.message || e) });
  if (e.preventDefault) e.preventDefault();
});
self.addEventListener('unhandledrejection', (e) => {
  self.postMessage({ type: 'worker-error', data: 'rejection: ' + describeErr(e.reason) });
  if (e.preventDefault) e.preventDefault();
});

self.onmessage = function (e) {
  const d = e.data || {};
  if (d.type === 'command') {
    try {
      if (EngineInstance) EngineInstance.sendCommand(d.data);
    } catch (err) {
      self.postMessage({ type: 'worker-error', data: describeErr(err) });
    }
  } else if (d.type === 'init') {
    if (starting) return;
    starting = true;
    try {
      self.importScripts('/build/rapfi-single-simd128.js');
    } catch (err) {
      starting = false;
      self.postMessage({ type: 'error', data: 'importScripts: ' + describeErr(err) });
      return;
    }
    const factory = self['Rapfi'];
    if (typeof factory !== 'function') {
      starting = false;
      self.postMessage({ type: 'error', data: 'engine factory missing after importScripts' });
      return;
    }
    factory({
      locateFile: locateFile,
      onReceiveStdout: (o) => self.postMessage({ type: 'stdout', data: o }),
      onReceiveStderr: (o) => self.postMessage({ type: 'stderr', data: o }),
      onExit: (c) => self.postMessage({ type: 'exit', data: c }),
      setStatus: (s) => self.postMessage({ type: 'status', data: s }),
    }).then((instance) => {
      EngineInstance = instance;
      starting = false;
      self.postMessage({ type: 'ready' });
    }).catch((err) => {
      starting = false;
      self.postMessage({ type: 'error', data: describeErr(err) });
    });
  } else if (d.type === 'terminate') {
    try { if (EngineInstance && EngineInstance.terminate) EngineInstance.terminate(); } catch (err) {}
    EngineInstance = null;
    self.postMessage({ type: 'terminated' });
  }
};
