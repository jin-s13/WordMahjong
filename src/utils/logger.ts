export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  stack?: string;
}

interface LoggerOptions {
  maxLogs: number;
  enableConsole: boolean;
  enableStorage: boolean;
  minLevel: LogLevel;
}

const LOG_STORAGE_KEY = 'mahjong_game_logs';
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private static instance: Logger;
  private options: LoggerOptions = {
    maxLogs: 1000,
    enableConsole: true,
    enableStorage: true,
    minLevel: 'debug',
  };
  private logs: LogEntry[] = [];

  private constructor() {
    this.loadLogsFromStorage();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 配置日志系统
   */
  public configure(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 记录调试日志
   */
  public debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  /**
   * 记录信息日志
   */
  public info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  /**
   * 记录警告日志
   */
  public warn(module: string, message: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  /**
   * 记录错误日志
   */
  public error(module: string, message: string, error?: Error | any, data?: any): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log('error', module, message, { error, data, stack });
  }

  /**
   * 通用日志记录方法
   */
  private log(level: LogLevel, module: string, message: string, data?: any): void {
    // 检查日志级别
    if (LOG_LEVEL_WEIGHT[level] < LOG_LEVEL_WEIGHT[this.options.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      module,
      message,
      data: this.sanitizeData(data),
    };

    // 添加到内存
    this.logs.unshift(entry);
    
    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs = this.logs.slice(0, this.options.maxLogs);
    }

    // 输出到控制台
    if (this.options.enableConsole) {
      this.outputToConsole(entry);
    }

    // 保存到本地存储
    if (this.options.enableStorage) {
      this.saveLogsToStorage();
    }
  }

  /**
   * 输出日志到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${time}] [${entry.level.toUpperCase()}] [${entry.module}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case 'info':
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case 'error':
        console.error(`${prefix} ${entry.message}`, entry.data || '');
        break;
    }
  }

  /**
   * 清理敏感数据
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // 复制数据避免修改原对象
    const sanitized = { ...data };
    
    // 清理API密钥等敏感信息
    if (sanitized.apiKey) {
      sanitized.apiKey = '[REDACTED]';
    }
    if (sanitized.key && typeof sanitized.key === 'string' && sanitized.key.length > 10) {
      sanitized.key = '[REDACTED]';
    }
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    
    return sanitized;
  }

  /**
   * 从本地存储加载日志
   */
  private loadLogsFromStorage(): void {
    try {
      const saved = localStorage.getItem(LOG_STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('加载日志失败:', e);
    }
  }

  /**
   * 保存日志到本地存储
   */
  private saveLogsToStorage(): void {
    try {
      // 只保存最近的500条日志到存储，避免占用过多空间
      const logsToSave = this.logs.slice(0, 500);
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (e) {
      console.warn('保存日志失败:', e);
    }
  }

  /**
   * 获取所有日志
   */
  public getLogs(filter?: {
    level?: LogLevel;
    module?: string;
    startTime?: number;
    endTime?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];
    
    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }
    
    if (filter?.module) {
      filtered = filtered.filter(log => log.module.includes(filter.module!));
    }
    
    if (filter?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filter.startTime!);
    }
    
    if (filter?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filter.endTime!);
    }
    
    return filtered;
  }

  /**
   * 导出日志为JSON
   */
  public exportLogs(): string {
    const exportData = {
      exportTime: new Date().toISOString(),
      logs: this.logs,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 下载日志文件
   */
  public downloadLogs(): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahjong-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 清空日志
   */
  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(LOG_STORAGE_KEY);
    this.info('Logger', '日志已清空');
  }
}

// 全局单例
export const logger = Logger.getInstance();

// 便捷导出
export default logger;
