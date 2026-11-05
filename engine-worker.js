// Caro Arena - Rapfi engine worker (Gomocup protocol over stdin/stdout)
let EngineInstance = null;

function locateFile(url) {
  if (/^rapfi.*\.data$/.test(url)) url = 'rapfi.data';
  return '/build/' + url;
}

self.onmessage = function (e) {
  const { type, data } = e.data;
  if (type === 'command') {
    if (EngineInstance) EngineInstance.sendCommand(data);
  } else if (type === 'init') {
    self.importScripts('/build/rapfi-single-simd128.js');
    self['Rapfi']({
      locateFile: locateFile,
      onReceiveStdout: (o) => self.postMessage({ type: 'stdout', data: o }),
      onReceiveStderr: (o) => self.postMessage({ type: 'stderr', data: o }),
      onExit: (c) => self.postMessage({ type: 'exit', data: c }),
      setStatus: (s) => self.postMessage({ type: 'status', data: s }),
    }).then((instance) => {
      EngineInstance = instance;
      self.postMessage({ type: 'ready' });
    }).catch((err) => {
      self.postMessage({ type: 'error', data: String(err) });
    });
  } else if (type === 'terminate') {
    if (EngineInstance && EngineInstance.terminate) EngineInstance.terminate();
    EngineInstance = null;
    self.postMessage({ type: 'terminated' });
  }
};
