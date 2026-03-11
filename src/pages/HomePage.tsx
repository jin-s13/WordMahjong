import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Settings, HelpCircle, Trophy, Bot, Library, Play, ChevronRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* 装饰元素 */}
      <div className="absolute top-20 left-20 text-6xl text-white/5 rotate-12">🀄</div>
      <div className="absolute bottom-40 right-20 text-8xl text-white/5 -rotate-12">🎴</div>
      <div className="absolute top-1/3 right-1/4 text-4xl text-white/3 animate-float" style={{ animationDelay: '1s' }}>✨</div>
      
      {/* 木质边框效果 */}
      <div className="absolute inset-0 border-[16px] border-amber-900 shadow-inner pointer-events-none">
        <div className="absolute inset-0 border-[2px] border-amber-800/50"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="text-8xl mb-6">🀄</div>
            <h1 className="text-6xl font-bold text-white mb-4 font-serif tracking-wider">
              文字麻将
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto leading-relaxed">
              用汉字组成句子的智慧游戏，<br/>感受中华文化的独特魅力
            </p>
          </div>

          {/* 游戏特色 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">智慧比拼</h3>
              <p className="text-amber-50 text-sm leading-relaxed">
                14张汉字牌组成完整句子，考验你的语文功底和思维能力，体验汉字组合的无限可能
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI对战</h3>
              <p className="text-amber-50 text-sm leading-relaxed">
                多种难度AI对手，从新手到大师，随时可以开启对战，享受单人游戏的无限乐趣
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI增强</h3>
              <p className="text-amber-50 text-sm leading-relaxed">
                集成大模型语义验证功能，提供准确的智能判断和专业的改进建议
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <button
              onClick={() => navigate('/settings')}
              className="group w-80 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 px-10 rounded-xl font-bold text-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              开始游戏
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/help')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20"
              >
                <HelpCircle className="w-5 h-5" />
                游戏规则
              </button>

              <button
                onClick={() => navigate('/library')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20"
              >
                <Library className="w-5 h-5" />
                牌库管理
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20"
              >
                <Settings className="w-5 h-5" />
                设置
              </button>
            </div>
          </div>

          {/* 游戏简介 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 font-serif">游戏规则</h2>
            <div className="space-y-4 text-amber-50">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-lg mt-0.5">01</span>
                <div>
                  <span className="font-semibold text-amber-300">基本玩法：</span> 游戏类似传统麻将，但是用汉字牌代替传统麻将牌。每位玩家持有13张牌，通过摸牌、出牌组成完整句子。
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-lg mt-0.5">02</span>
                <div>
                  <span className="font-semibold text-amber-300">核心操作：</span> 只有摸牌、出牌、吃牌、胡牌四种操作，无碰无杠，纯靠语言组合能力。
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-lg mt-0.5">03</span>
                <div>
                  <span className="font-semibold text-amber-300">吃牌规则：</span> 只能吃上家打出的牌，与自己手中的牌组成2-3字的常用词语。
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-lg mt-0.5">04</span>
                <div>
                  <span className="font-semibold text-amber-300">胡牌规则：</span> 集齐14张牌，组成一句完整通顺的现代汉语句子即可胡牌。
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-lg mt-0.5">05</span>
                <div>
                  <span className="font-semibold text-amber-300">AI裁判：</span> 智能AI会对吃牌和胡牌进行语义验证，确保符合现代汉语规范。
                </div>
              </div>
            </div>
          </div>

          {/* 页脚 */}
          <div className="text-center mt-12 text-amber-200/70 text-sm">
            <p>© 2026 文字麻将 - 感受汉字之美</p>
            <p className="mt-1">所有数据保存在本地，无需网络连接</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;