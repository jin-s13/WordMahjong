import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../hooks/useGameStore';
import LogViewer from '../components/LogViewer';
import { ArrowLeft, Settings, Users, Brain, Volume2, Zap, Info, FileText, Play } from 'lucide-react';

const GameSettings: React.FC = () => {
  const navigate = useNavigate();
  const initializeGame = useGameStore((state: any) => state.initializeGame);
  const startGame = useGameStore((state: any) => state.startGame);

  const [playerCount, setPlayerCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [showLogViewer, setShowLogViewer] = useState(false);

  const handleStartGame = async () => {
    try {
      await initializeGame({
        playerCount,
        aiDifficulty,
        soundEnabled,
        animationEnabled,
        aiEnhanced: true, // AI增强默认启用
      });
      startGame();
      navigate('/game');
    } catch (error) {
      alert('游戏初始化失败：' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* 装饰元素 */}
      <div className="absolute top-20 left-10 text-6xl text-white/5 rotate-12">⚙️</div>
      <div className="absolute bottom-40 right-10 text-6xl text-white/5 -rotate-12">🎮</div>
      
      {/* 木质边框效果 */}
      <div className="absolute inset-0 border-[16px] border-amber-900 shadow-inner pointer-events-none">
        <div className="absolute inset-0 border-[2px] border-amber-800/50"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* 头部 */}
          <div className="flex items-center mb-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              返回首页
            </button>
            <h1 className="text-4xl font-bold text-white font-serif">游戏设置</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="space-y-8">
              {/* 玩家数量设置 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <label className="block text-xl font-medium text-white font-serif">
                    玩家数量
                  </label>
                </div>
                <div className="flex gap-4">
                  {[2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        playerCount === count
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/10 text-amber-50 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                      }`}
                    >
                      {count}人局
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-amber-200/80 text-sm">
                  包含1名玩家和{playerCount - 1}名AI对手
                </p>
              </div>

              {/* AI难度设置 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <label className="block text-xl font-medium text-white font-serif">
                    AI难度
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAiDifficulty('easy')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      aiDifficulty === 'easy'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-amber-50 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    简单
                  </button>
                  <button
                    onClick={() => setAiDifficulty('normal')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      aiDifficulty === 'normal'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 text-amber-50 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    中等
                  </button>
                  <button
                    onClick={() => setAiDifficulty('hard')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      aiDifficulty === 'hard'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/10 text-amber-50 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    困难
                  </button>
                </div>
              </div>

              {/* 开关设置 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-amber-300" />
                    <label className="text-lg font-medium text-amber-50">
                      音效
                    </label>
                  </div>
                  <div 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                      soundEnabled ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
                        soundEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-300" />
                    <label className="text-lg font-medium text-amber-50">
                      动画效果
                    </label>
                  </div>
                  <div 
                    onClick={() => setAnimationEnabled(!animationEnabled)}
                    className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                      animationEnabled ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
                        animationEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* AI提示 */}
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/30">
                <div className="flex items-start gap-4">
                  <div className="text-blue-300 mt-1">
                    <Info size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-blue-200 mb-2">AI语义验证已启用</p>
                    <p className="text-sm text-blue-100 leading-relaxed">
                      系统已自动配置豆包AI模型，将提供准确的语义验证服务。
                      API密钥保存在本地，不会上传到任何服务器。
                    </p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={handleStartGame}
                  className="group flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  开始游戏
                </button>
                <button
                  onClick={() => setShowLogViewer(true)}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm text-amber-50 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20"
                  title="查看日志"
                >
                  <FileText size={20} />
                  日志
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日志查看器 */}
      {showLogViewer && (
        <LogViewer onClose={() => setShowLogViewer(false)} />
      )}
    </div>
  );
};

export default GameSettings;