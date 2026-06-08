import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Copy, CheckCircle2, Code2, Terminal } from 'lucide-react';

interface PythonRunnerProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
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
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (!(window as any).loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.async = true;
          script.onload = async () => {
            const pyodideInstance = await (window as any).loadPyodide();
            await pyodideInstance.loadPackage(['numpy', 'pandas']);
            setPyodide(pyodideInstance);
            setIsPyodideReady(true);
          };
          document.body.appendChild(script);
        } else {
          const pyodideInstance = await (window as any).loadPyodide();
          await pyodideInstance.loadPackage(['numpy', 'pandas']);
          setPyodide(pyodideInstance);
          setIsPyodideReady(true);
        }
      } catch (error) {
        console.error('加载Pyodide失败:', error);
        setOutput('⚠️ 加载Python运行环境失败，请刷新页面重试');
        setHasError(true);
      }
    };

    if (!pyodide) {
      loadPyodide();
    }
  }, [pyodide]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const runCode = async () => {
    if (!pyodide) {
      setOutput('⚠️ Python运行环境正在加载中，请稍候...');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setHasError(false);

    try {
      const codeToRun = `
import sys
from io import StringIO
sys.stdout = StringIO()
try:
    ${code.split('\n').join('\n    ')}
finally:
    output = sys.stdout.getvalue()
    sys.stdout = sys.__stdout__
output
`;

      const result = await pyodide.runPythonAsync(codeToRun);
      setOutput(result || '✅ 代码执行完成（无输出）');
    } catch (error: any) {
      setHasError(true);
      setOutput(`❌ 运行错误:\n${error.message || error}`);
    } finally {
      setIsRunning(false);
    }
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
          <button
            onClick={runCode}
            disabled={isRunning || !isPyodideReady}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? '运行中...' : isPyodideReady ? '运行代码' : '加载中...'}
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

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${isPyodideReady ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`} />
        {isPyodideReady ? 'Python运行环境已就绪' : '正在加载Python运行环境...'}
      </div>
    </div>
  );
}
