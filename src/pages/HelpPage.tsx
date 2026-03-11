import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Brain, Zap, MessageSquare, Info, Home } from 'lucide-react';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* 装饰元素 */}
      <div className="absolute top-20 left-10 text-6xl text-white/5 rotate-12">📖</div>
      <div className="absolute bottom-40 right-10 text-6xl text-white/5 -rotate-12">💡</div>
      
      {/* 木质边框效果 */}
      <div className="absolute inset-0 border-[16px] border-amber-900 shadow-inner pointer-events-none">
        <div className="absolute inset-0 border-[2px] border-amber-800/50"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* 头部 */}
          <div className="flex items-center mb-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              返回首页
            </button>
            <h1 className="text-4xl font-bold text-white font-serif">游戏帮助</h1>
          </div>

          <div className="space-y-8">
            {/* 基本规则 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">基本规则</h2>
              </div>

              <div className="space-y-6 text-amber-50">
                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">游戏目标</h3>
                  <p className="leading-relaxed">
                    玩家通过摸牌、出牌、吃牌等操作，集齐14张汉字牌，组成一句完整通顺的现代汉语句子，最先达成的玩家获胜。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">牌库构成</h3>
                  <p className="leading-relaxed">
                    游戏共144张牌，分为7大类：情感核心字、高频动词、日常名词、形容词、副词+虚词+语气词、场景/方位字、补充融合字，
                    全部使用现代汉语常用字，没有生僻字。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">游戏流程</h3>
                  <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>每位玩家初始13张牌，庄家14张牌</li>
                    <li>按顺时针方向轮流进行回合</li>
                    <li>每个回合先摸一张牌，然后选择一张无用的牌打出</li>
                    <li>其他玩家可以选择吃牌或者胡牌</li>
                    <li>先集齐14张牌组成完整句子者获胜</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* 核心操作 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">核心操作</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="font-semibold text-xl mb-3 text-blue-300">摸牌</h3>
                  <p className="text-amber-50 leading-relaxed">
                    轮到你的回合时，从牌墙摸取一张牌加入手牌。此时手牌为14张，你需要选择一张不需要的牌打出。
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="font-semibold text-xl mb-3 text-red-300">出牌</h3>
                  <p className="text-amber-50 leading-relaxed">
                    摸牌后，从手牌中选择一张最没用的牌打出，其他玩家可以选择吃这张牌或者胡牌。
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="font-semibold text-xl mb-3 text-green-300">吃牌</h3>
                  <p className="text-amber-50 leading-relaxed">
                    当上家打出的牌可以和你手中的牌组成2-3字的常用词语时，你可以选择吃牌。吃牌后需要打出一张牌。
                  </p>
                  <p className="text-amber-200/80 text-sm mt-3">注意：只能吃上家打出的牌，且组成的词语需要经过语义验证。</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="font-semibold text-xl mb-3 text-yellow-300">胡牌</h3>
                  <p className="text-amber-50 leading-relaxed">
                    当你集齐14张牌，可以组成一句完整通顺的现代汉语句子时，即可胡牌获胜。
                  </p>
                  <p className="text-amber-200/80 text-sm mt-3">胡牌的句子需要经过AI裁判的语义验证，确保语法正确、语义通顺。</p>
                </div>
              </div>
            </div>

            {/* AI功能 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">AI功能说明</h2>
              </div>

              <div className="space-y-6 text-amber-50">
                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">AI对手</h3>
                  <p className="leading-relaxed">
                    游戏提供多种难度的AI对手，从简单到困难，适合不同水平的玩家。AI会根据手牌情况做出智能决策，模拟真实玩家的游戏行为。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">AI裁判</h3>
                  <p className="leading-relaxed">
                    内置AI裁判负责验证吃牌和胡牌的语义正确性。默认使用本地语义验证库，可以选择开启AI增强模式，使用大模型进行更准确的验证。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-amber-300">AI增强模式</h3>
                  <p className="leading-relaxed">
                    支持多种大模型服务商（包括豆包、OpenAI、Claude、Gemini等），用户可以自行配置API密钥，获得更准确的语义验证和更智能的游戏体验。
                    API密钥仅保存在用户本地，不会上传到任何服务器。
                  </p>
                </div>
              </div>
            </div>

            {/* 获胜条件 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">获胜条件</h2>
              </div>

              <div className="space-y-4 text-amber-50">
                <p className="leading-relaxed">
                  胡牌需要满足以下条件：
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>手牌数量必须为14张（13张手牌+1张刚摸的牌或者刚吃的牌）</li>
                  <li>所有牌（包括吃牌）需要能够组成一句完整的现代汉语句子</li>
                  <li>句子需要符合语法规范，语义通顺</li>
                  <li>句子长度建议在7-20字之间</li>
                  <li>经过AI裁判验证通过</li>
                </ul>

                <div className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-amber-300 mb-2">胡牌示例：</p>
                  <p className="text-amber-50">我今天吃了好吃的饭、你在公园里开心地跑步、我们一家人幸福地生活在一起</p>
                </div>
              </div>
            </div>

            {/* 小技巧 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">游戏小技巧</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-amber-50">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-lg mb-3 text-amber-300">留核心字</h3>
                  <p className="text-sm leading-relaxed">
                    尽量保留"我、你、爱、家、心、吃、说、想"等核心字，这些字是组成句子的关键。
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-lg mb-3 text-amber-300">组常见词</h3>
                  <p className="text-sm leading-relaxed">
                    优先组成"吃饭、睡觉、看书、工作"等常用词语，提高胡牌概率。
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-lg mb-3 text-amber-300">句子结构</h3>
                  <p className="text-sm leading-relaxed">
                    尽量按照"主语+谓语+宾语"的基本结构来组合牌，更容易胡牌。
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-lg mb-3 text-amber-300">灵活应变</h3>
                  <p className="text-sm leading-relaxed">
                    根据摸到的牌灵活调整组句方向，不要死磕一个句子。
                  </p>
                </div>
              </div>
            </div>

            {/* 常见问题 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white font-serif">常见问题</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-amber-300 mb-2">Q: 游戏需要网络吗？</h3>
                  <p className="text-amber-50 leading-relaxed">
                    A: 不需要。游戏是纯单机版，所有数据都保存在本地，可以完全离线运行。只有开启AI增强模式时才需要网络连接。
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-amber-300 mb-2">Q: 数据会丢失吗？</h3>
                  <p className="text-amber-50 leading-relaxed">
                    A: 游戏数据保存在浏览器的LocalStorage中，只要不清除浏览器数据，数据就不会丢失。
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-amber-300 mb-2">Q: AI增强功能安全吗？</h3>
                  <p className="text-amber-50 leading-relaxed">
                    A: 非常安全。API密钥仅保存在你的本地浏览器中，所有API请求直接从你的浏览器发送到服务商，不会经过任何中间服务器。
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <h3 className="font-semibold text-amber-300 mb-2">Q: 可以自定义牌库吗？</h3>
                  <p className="text-amber-50 leading-relaxed">
                    A: 目前版本使用默认牌库，后续版本会加入牌库自定义功能，允许用户添加、修改、删除牌库中的字。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 返回按钮 */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/')}
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 flex items-center gap-3 mx-auto"
            >
              <Home className="w-5 h-5" />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;