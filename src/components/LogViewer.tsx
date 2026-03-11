import React, { useState, useEffect } from 'react';
import type { LogEntry, LogLevel } from '../utils/logger';
import logger from '../utils/logger';
import { Download, Trash2, RefreshCw, Filter, X } from 'lucide-react';

interface LogViewerProps {
  onClose: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const filteredLogs = logger.getLogs({
      level: levelFilter === 'all' ? undefined : levelFilter,
      module: moduleFilter || undefined,
    });
    setLogs(filteredLogs);
  };

  const handleDownload = () => {
    logger.downloadLogs();
  };

  const handleClear = () => {
    if (confirm('确定要清空所有日志吗？')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLevelColor = (level: LogLevel) => {
    const colors: Record<LogLevel, string> = {
      debug: 'bg-gray-100 text-gray-800',
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[level];
  };

  const modules = Array.from(new Set(logs.map(log => log.module)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">日志查看器</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* 工具栏 */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">所有级别</option>
              <option value="debug">调试</option>
              <option value="info">信息</option>
              <option value="warn">警告</option>
              <option value="error">错误</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">所有模块</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          <div className="flex-1"></div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              <RefreshCw size={14} />
              刷新
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Download size={14} />
              导出
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              <Trash2 size={14} />
              清空
            </button>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 w-[180px]">时间</th>
                <th className="text-left py-2 px-2 w-[80px]">级别</th>
                <th className="text-left py-2 px-2 w-[120px]">模块</th>
                <th className="text-left py-2 px-2">消息</th>
                <th className="text-left py-2 px-2 w-[200px]">数据</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-mono text-xs">
                    {log.module}
                  </td>
                  <td className="py-2 px-2">
                    {log.message}
                  </td>
                  <td className="py-2 px-2">
                    {log.data && (
                      <details className="text-xs text-gray-500">
                        <summary>查看数据</summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto max-h-40">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无日志数据
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-500 flex justify-between">
          <span>共 {logs.length} 条日志</span>
          <span>最新更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
