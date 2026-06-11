import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Copy, CheckCircle2, Code2, Terminal, AlertTriangle, RefreshCw } from 'lucide-react';

interface PythonRunnerProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

const PYODIDE_CDN_URLS = [
  'https://lf6-cdn-tos.bytecdntp.com/cdn/pyodide/v0.25.0/full/pyodide.js',
  'https://cdn.bootcdn.net/ajax/libs/pyodide/0.25.0/full/pyodide.js',
  'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js',
  'https://unpkg.com/pyodide@0.25.0/dist/pyodide.js',
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 超时（${ms / 1000}秒）`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

let pyodideGlobal: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

async function loadPyodideLibrary(statusCallback: (status: string) => void): Promise<any> {
  if (pyodideGlobal) return pyodideGlobal;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = (async () => {
    if ((window as any).loadPyodide) {
      statusCallback('正在初始化 Python 引擎...');
      try {
        const instance = await withTimeout((window as any).loadPyodide(), 30000, 'Python 引擎初始化');
        pyodideGlobal = instance;
        return instance;
      } catch (err) {
        console.error('loadPyodide() 调用失败:', err);
        throw err;
      }
    }

    for (const url of PYODIDE_CDN_URLS) {
      statusCallback(`正在从 CDN 下载（约 20MB，请耐心等待）...`);
      try {
        await withTimeout(
          new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            let settled = false;
            const timer = setTimeout(() => {
              if (!settled) {
                settled = true;
                script.remove();
                reject(new Error('CDN 请求超时: ' + url));
              }
            }, 30000);
            script.onload = () => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve();
              }
            };
            script.onerror = () => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                reject(new Error('CDN 加载失败: ' + url));
              }
            };
            document.body.appendChild(script);
          }),
          35000,
          '下载 Pyodide'
        );

        if ((window as any).loadPyodide) {
          statusCallback('正在初始化 Python 引擎（需要下载约 20MB，请耐心等待）...');
          try {
            const instance = await withTimeout((window as any).loadPyodide(), 30000, 'Python 引擎初始化');
            pyodideGlobal = instance;
            pyodideLoadingPromise = null;
            return instance;
          } catch (initErr) {
            console.error('loadPyodide() 调用失败:', initErr);
            throw initErr;
          }
        }
      } catch (err) {
        console.warn('Pyodide CDN 尝试失败，将尝试下一个:', err);
        statusCallback('CDN 不可用，尝试下一个...');
      }
    }

    pyodideLoadingPromise = null;
    throw new Error('所有 CDN 源均无法加载，请检查网络后点击"重新加载环境"按钮重试');
  })();

  return pyodideLoadingPromise;
}

export default function PythonRunner({ 
  initialCode = '', 
  onCodeChange,
  readOnly = false 
}: PythonRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStatus, setLoadStatus] = useState('正在初始化 Python 运行环境...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadError(null);
        setLoadStatus('正在连接 CDN...');
        const instance = await loadPyodideLibrary((status) => {
          if (!cancelled) setLoadStatus(status);
        });
        if (cancelled) return;

        setLoadStatus('Python 引擎已就绪，正在加载扩展包...');
        try {
          await withTimeout(instance.loadPackage(['numpy']), 60000, '加载 numpy');
        } catch (pkgErr) {
          console.warn('numpy 预加载失败，将在使用时动态加载:', pkgErr);
          setLoadStatus('基础包加载超时，继续使用核心功能...');
          await new Promise(r => setTimeout(r, 1000));
        }

        if (!cancelled) {
          setPyodide(instance);
          setIsPyodideReady(true);
          setLoadStatus('✅ Python 运行环境就绪');
        }
      } catch (error: any) {
        console.error('加载 Pyodide 失败:', error);
        if (!cancelled) {
          setLoadError(error.message || '加载失败');
          setHasError(true);
          setOutput('⚠️ 加载 Python 运行环境失败: ' + (error.message || error));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const runCode = async () => {
    if (!pyodide) {
      setOutput('⚠️ Python 运行环境还在加载中，请稍候...');
      return;
    }

    setIsRunning(true);
    setOutput('▶ 执行中...');
    setHasError(false);

    try {
      const trimmedCode = code.trim();
      const lines = trimmedCode.split('\n');
      const lastLine = lines[lines.length - 1] || '';
      const needsImplicitPrint =
        lastLine.length > 0 &&
        !lastLine.trimStart().startsWith('#') &&
        !lastLine.includes('=') &&
        !lastLine.trimStart().startsWith('print(') &&
        !lastLine.trimStart().startsWith('import') &&
        !lastLine.trimStart().startsWith('from') &&
        !lastLine.trimStart().startsWith('def') &&
        !lastLine.trimStart().startsWith('class') &&
        !lastLine.trimStart().startsWith('if') &&
        !lastLine.trimStart().startsWith('for') &&
        !lastLine.trimStart().startsWith('while') &&
        !lastLine.trimStart().startsWith('return');

      let finalCode = trimmedCode;
      if (needsImplicitPrint) {
        lines[lines.length - 1] = 'print(' + lastLine.trim() + ')';
        finalCode = lines.join('\n');
      }

      const importMatches = finalCode.match(/^\s*(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm);
      if (importMatches) {
        const modulesNeeded = new Set<string>();
        for (const m of importMatches) {
          const parts = m.trim().split(/\s+/);
          if (parts.length >= 2) {
            modulesNeeded.add(parts[1].split('.')[0]);
          }
        }
        const wellKnown: Record<string, string> = {
          numpy: 'numpy',
          np: 'numpy',
          pandas: 'pandas',
          pd: 'pandas',
          matplotlib: 'matplotlib',
          plt: 'matplotlib',
          scipy: 'scipy',
          sympy: 'sympy',
          sklearn: 'scikit-learn',
          requests: 'requests',
          bs4: 'beautifulsoup4',
        };
        const toLoad = new Set<string>();
        modulesNeeded.forEach((mod) => {
          if (wellKnown[mod]) {
            toLoad.add(wellKnown[mod]);
          }
        });
        if (toLoad.size > 0) {
          setOutput('▶ 正在加载依赖包 (' + Array.from(toLoad).join(', ') + ')...');
          try {
            await pyodide.loadPackage(Array.from(toLoad));
            setOutput('▶ 执行中...');
          } catch (pkgErr) {
            console.warn('动态加载包失败:', pkgErr);
          }
        }
      }

      // 更简单直接的方式：用 exec 执行用户代码，捕获所有输出
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

      try {
        await pyodide.runPythonAsync(finalCode);
      } catch (runtimeErr: any) {
        pyodide.runPython(`
import traceback
sys.stdout.write(sys.stderr.getvalue())
`);
        setHasError(true);
      }

      // 直接用 JS 读取 stdout 内容
      const result = pyodide.runPython(`
sys.stdout.getvalue()
`);

      // 也检查 stderr
      const stderrContent = pyodide.runPython(`
sys.stderr.getvalue()
`);

      const stdoutStr = result ? String(result) : '';
      const stderrStr = stderrContent ? String(stderrContent) : '';

      // 恢复原始 stdout/stderr
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

      let finalOutput = stdoutStr.trim();
      let finalError = stderrStr.trim();

      if (finalError && !finalOutput) {
        setHasError(true);
        setOutput('❌ 运行错误:\n' + finalError);
      } else if (finalError) {
        setHasError(true);
        setOutput(finalOutput + '\n\n❌ 运行错误:\n' + finalError);
      } else if (finalOutput) {
        setOutput(finalOutput);
      } else {
        setOutput('✅ 代码执行完成（无输出）');
      }
    } catch (error: any) {
      setHasError(true);
      const msg = error?.message || String(error);
      setOutput('❌ 执行异常:\n' + msg);
    } finally {
      setIsRunning(false);
    }
  };

  const reloadPyodide = () => {
    pyodideGlobal = null;
    pyodideLoadingPromise = null;
    setPyodide(null);
    setIsPyodideReady(false);
    setLoadError(null);
    setHasError(false);
    setOutput('');
    setLoadStatus('正在重新初始化 Python 运行环境...');
    setReloadKey((k) => k + 1);
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput('');
    setHasError(false);
    onCodeChange?.(initialCode);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-gray-900">Python代码编辑器</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={resetCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            重置
          </button>
          {loadError && (
            <button
              onClick={reloadPyodide}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              重新加载环境
            </button>
          )}
          <button
            onClick={runCode}
            disabled={isRunning || !isPyodideReady}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all ${isRunning || !isPyodideReady ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? '运行中...' : isPyodideReady ? '▶ 运行代码' : '⏳ ' + loadStatus}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 rounded-t-xl flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs ml-2">main.py</span>
          </div>
          <textarea
            value={code}
            onChange={handleCodeChange}
            readOnly={readOnly}
            className="w-full h-80 pt-12 px-4 py-4 bg-gray-900 text-emerald-400 font-mono text-sm rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            placeholder="在此编写Python代码..."
          />
        </div>

        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 rounded-t-xl flex items-center px-4 gap-2">
            <Terminal className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-xs ml-2">输出结果</span>
          </div>
          <div
            ref={outputRef}
            className={`w-full h-80 pt-12 px-4 py-4 bg-gray-900 font-mono text-sm rounded-xl overflow-auto ${
              hasError ? 'text-red-400' : 'text-gray-300'
            }`}
          >
            {output || (
              <span className="text-gray-500">点击「运行代码」查看输出结果...</span>
            )}
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 text-xs ${loadError ? 'text-red-500' : 'text-gray-500'}`}>
        {loadError ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>加载失败: {loadError}（点击上方"重新加载环境"按钮重试）</span>
          </>
        ) : (
          <>
            <div className={`w-2 h-2 rounded-full ${isPyodideReady ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span>{isPyodideReady ? '✅ Python 运行环境已就绪 - 可以运行代码了' : loadStatus}</span>
          </>
        )}
      </div>
    </div>
  );
}
