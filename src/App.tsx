import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import GameSettings from './pages/GameSettings';
import GameTable from './components/GameTable';
import HelpPage from './pages/HelpPage';
import LibraryPage from './pages/LibraryPage';
import { logger } from './utils/logger';
import './index.css';

// 路由变化监听
const RouteChangeLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    logger.info('Router', '页面跳转', { 
      path: location.pathname,
      search: location.search
    });
  }, [location]);
  
  return null;
};

function App() {
  useEffect(() => {
    // 初始化日志系统
    logger.info('App', '应用启动', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    });
    
    // 全局错误捕获
    const handleError = (event: ErrorEvent) => {
      logger.error('Global', '未捕获的错误', event.error, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    };
    
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      logger.error('Global', '未处理的Promise拒绝', event.reason, {
        reason: event.reason?.message || String(event.reason)
      });
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  return (
    <Router>
      <RouteChangeLogger />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<GameSettings />} />
          <Route path="/game" element={<GameTable />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
