import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import MahjongTile from './MahjongTile';
import PlayerHand from './PlayerHand';
import AIJudgeDialog from './AIJudgeDialog';
import SentenceInputDialog from './SentenceInputDialog';
import CombinationJudgeDialog from './CombinationJudgeDialog';
import useGameStore from '../hooks/useGameStore';
import type { PlayerAction, ValidationResult, Card } from '../types';

const GameTable: React.FC = () => {
  const state = useGameStore((s: any) => s.state);
  const handlePlayerAction = useGameStore((s: any) => s.handlePlayerAction);
  const aiTurn = useGameStore((s: any) => s.aiTurn);
  const toggleCardSelection = useGameStore((s: any) => s.toggleCardSelection);
  const clearSelection = useGameStore((s: any) => s.clearSelection);
  const validateCombination = useGameStore((s: any) => s.validateCombination);
  const validateSentence = useGameStore((s: any) => s.validateSentence);
  const addPunctuation = useGameStore((s: any) => s.addPunctuation);
  const restartGame = useGameStore((s: any) => s.restartGame);
  const initializeGame = useGameStore((s: any) => s.initializeGame);
  const startGame = useGameStore((s: any) => s.startGame);

  // AI裁判弹窗状态
  const [showAIJudge, setShowAIJudge] = useState(false);
  const [pendingWinSentence, setPendingWinSentence] = useState('');
  // 句子输入弹窗状态
  const [showSentenceInput, setShowSentenceInput] = useState(false);
  const [defaultSentence, setDefaultSentence] = useState('');
  // 吃牌审核弹窗状态
  const [showCombinationJudge, setShowCombinationJudge] = useState(false);
  const [pendingCombination, setPendingCombination] = useState<Card[]>([]);

  // 安全获取当前玩家
  const currentPlayer = state.players[state.currentPlayer] || { 
    name: '加载中...', 
    isHuman: false 
  };

  useEffect(() => {
    // 如果当前是AI玩家回合，自动执行AI操作
    if (state.status === 'playing' && !state.players[state.currentPlayer].isHuman) {
      aiTurn();
    }
  }, [state.currentPlayer, state.status, aiTurn]);

  const handleTileClick = async (card: any) => {
    if (state.status !== 'playing' || !state.players[state.currentPlayer].isHuman) {
      return;
    }

    toggleCardSelection(card);
  };

  const handleDraw = async () => {
    if (state.status !== 'playing' || !currentPlayer.isHuman || 
        !(state.turnPhase === 'draw' || state.turnPhase === 'wait')) return;

    // 摸牌时自动放弃吃牌，清空currentDiscard
    if (state.currentDiscard) {
      useGameStore.setState(state => ({
        state: {
          ...state.state,
          currentDiscard: null
        }
      }));
    }

    const action: PlayerAction = {
      type: 'draw',
      playerId: state.currentPlayer,
    };
    await handlePlayerAction(action);
  };

  const handleDiscard = async () => {
    if (state.status !== 'playing' || !state.players[state.currentPlayer].isHuman || state.selectedCombination.length !== 1) {
      return;
    }

    const action: PlayerAction = {
      type: 'discard',
      playerId: state.currentPlayer,
      card: state.selectedCombination[0],
    };
    await handlePlayerAction(action);
    clearSelection();
  };

  const handleEat = async () => {
    if (!state.currentDiscard || state.selectedCombination.length < 1) {
      return;
    }

    const combination = [...state.selectedCombination, state.currentDiscard];
    setPendingCombination(combination);
    setShowCombinationJudge(true);
  };

  // 处理吃牌审核结果
  const handleEatJudgeResult = async (result: ValidationResult) => {
    setShowCombinationJudge(false);
    if (result.isValid) {
      const action: PlayerAction = {
        type: 'eat',
        playerId: state.currentPlayer,
        combination: pendingCombination,
      };
      await handlePlayerAction(action);
      clearSelection();
    } else {
      toast.error('组合无效：' + result.reasons.join('，'));
    }
  };

  const handleWin = async () => {
    if (state.status !== 'playing' || !currentPlayer.isHuman) {
      return;
    }

    const allCards = [
      ...currentPlayer.handCards,
      ...currentPlayer.eatenCards.flat()
    ];
    
    if (allCards.length !== 14) {
      alert('牌数不足，无法胡牌');
      return;
    }

    const generatedSentence = allCards.map(c => c.char).join('');
    setDefaultSentence(generatedSentence);
    setShowSentenceInput(true);
  };

  // 处理句子输入确认
  const handleSentenceConfirm = (sentence: string) => {
    setPendingWinSentence(sentence);
    setShowAIJudge(true);
  };

  // 处理AI裁判审核结果
  const handleJudgeResult = async (result: ValidationResult) => {
    setShowAIJudge(false);
    if (result.isValid) {
      const action: PlayerAction = {
        type: 'win',
        playerId: state.currentPlayer,
        sentence: pendingWinSentence,
      };
      await handlePlayerAction(action);
    }
  };

  // 重新开始游戏
  const handleRestart = async () => {
    try {
      await initializeGame(state.settings);
      startGame();
    } catch (error) {
      console.error('重新开始游戏失败:', error);
      alert('重新开始游戏失败，请刷新页面重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* 桌面光泽 */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none"></div>
      
      {/* 木质边框效果 */}
      <div className="absolute inset-0 border-[16px] border-amber-900 shadow-inner pointer-events-none">
        <div className="absolute inset-0 border-[2px] border-amber-800/50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* 顶部信息栏 */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-1 font-serif">🀄 文字麻将</h1>
            <p className="text-white/80 text-sm">用汉字组成句子的智慧游戏</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <p className="text-white/90 font-medium">
              剩余牌数: <span className="text-yellow-300 font-bold">{state.wallCards.length}</span>
            </p>
            <p className="text-white/90 font-medium mt-1">
              当前轮次: <span className="text-yellow-300 font-bold">第 {state.currentRound} 轮</span>
            </p>
          </div>
        </div>

        {/* AI玩家手牌（顶部） */}
        {state.players.length > 2 && (
          <div className="mb-12 flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 shadow border border-white/20">
              <p className="text-white font-medium">{state.players[2].name}</p>
            </div>
            <PlayerHand
              playerId={2}
              cards={state.players[2].handCards}
              faceDown={!state.players[2].isHuman}
              isCurrentPlayer={state.currentPlayer === 2}
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-12 min-h-[400px]">
          {/* AI玩家手牌（左侧） */}
          {state.players.length > 1 && (
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 shadow border border-white/20 -rotate-90 transform">
                <p className="text-white font-medium">{state.players[1].name}</p>
              </div>
              <div className="flex flex-col gap-1">
                {state.players[1].handCards.map((card) => (
                  <MahjongTile
                    key={card.id}
                    card={card}
                    faceDown={!state.players[1].isHuman}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 牌桌中央 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* 墙牌 */}
            <div className="mb-8">
              <div className="grid grid-cols-8 gap-1 bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                {state.wallCards.slice(0, 16).map((card) => (
                  <MahjongTile
                    key={card.id}
                    card={card}
                    faceDown
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* 弃牌堆 */}
            <div className="mb-6">
              <p className="text-white text-center mb-3 font-medium">弃牌堆</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner min-h-[120px]">
                {state.discardPile.slice(-8).map((card) => (
                  <MahjongTile
                    key={card.id}
                    card={card}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* 当前弃牌 */}
            {state.currentDiscard && (
              <div className="mb-6">
                <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/50 shadow-lg">
                  <p className="text-yellow-200 text-center text-sm mb-3 font-medium">最新打出</p>
                  <MahjongTile
                    card={state.currentDiscard}
                    size="lg"
                  />
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {state.status === 'playing' && currentPlayer.isHuman && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDraw}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all font-medium flex items-center gap-2 backdrop-blur-sm bg-opacity-90"
                  disabled={!(state.turnPhase === 'draw' || state.turnPhase === 'wait')}
                >
                  摸牌
                </button>
                <button
                    onClick={handleDiscard}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all font-medium flex items-center gap-2 backdrop-blur-sm bg-opacity-90"
                    disabled={state.turnPhase !== 'play' || state.selectedCombination.length !== 1}
                  >
                    出牌
                  </button>
                <button
                    onClick={handleEat}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all font-medium flex items-center gap-2 backdrop-blur-sm bg-opacity-90"
                    disabled={!state.currentDiscard || state.selectedCombination.length < 1}
                  >
                    吃牌
                  </button>
                  <button
                    onClick={handleWin}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl shadow-lg transition-all font-medium flex items-center gap-2 backdrop-blur-sm bg-opacity-90"
                  >
                    胡牌
                  </button>
              </div>
            )}

            {/* 回合信息 */}
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center min-w-[300px]">
              <p className="text-white/90 mb-2">当前回合: <span className="text-yellow-300 font-bold">{currentPlayer.name}</span></p>
              <p className={`font-bold ${currentPlayer.isHuman ? 'text-yellow-300' : 'text-blue-300'}`}>
                回合状态: {currentPlayer.isHuman ? 
                  (state.turnPhase === 'draw' ? '请摸牌' : 
                   state.turnPhase === 'play' ? 
                     (state.players[state.currentPlayer].handCards.length === 12 ? '请打出一张牌（吃牌后）' : '请操作（吃/杠/胡/出牌）') : 
                   state.turnPhase === 'wait' ? '请选择摸牌或者吃牌' :
                   '等待中') : 
                  'AI思考中...'}
              </p>
            </div>
          </div>

          {/* AI玩家手牌（右侧） */}
          {state.players.length > 3 && (
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 shadow border border-white/20 rotate-90 transform">
                <p className="text-white font-medium">{state.players[3].name}</p>
              </div>
              <div className="flex flex-col gap-1">
                {state.players[3].handCards.map((card) => (
                  <MahjongTile
                    key={card.id}
                    card={card}
                    faceDown={!state.players[3].isHuman}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 吃牌区域 */}
        {state.players[0].eatenCards.length > 0 && (
          <div className="mb-6">
            <p className="text-white text-center mb-3 font-medium">已吃牌</p>
            <div className="flex justify-center gap-4">
              {state.players[0].eatenCards.map((combination, index) => (
                <div key={index} className="flex gap-1 bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                  {combination.map((card) => (
                    <MahjongTile
                      key={card.id}
                      card={card}
                      size="md"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 玩家手牌（底部） */}
        <div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 shadow border border-white/20 text-center max-w-xs mx-auto">
            <p className="text-white font-medium">{state.players[0].name} (你)</p>
          </div>
          <PlayerHand
            playerId={0}
            cards={state.players[0].handCards}
            isCurrentPlayer={state.currentPlayer === 0}
            selectable={state.status === 'playing'}
            onTileClick={handleTileClick}
          />
        </div>

        {/* 重新开始按钮 */}
        {state.status === 'finished' && (
          <div className="text-center mt-16">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl inline-block border border-white/20 max-w-md">
              <div className="text-6xl mb-4">
                {state.winner ? (
                  state.winner.isHuman ? '🎉' : '😢'
                ) : '🤝'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-serif">
                {state.winner ? (
                  state.winner.isHuman ? '恭喜您获胜！' : `${state.winner.name} 获胜`
                ) : '流局'}
              </h2>
              {state.winner && (
                <p className="text-white/80 mb-6 text-lg">
                  获胜句子：<span className="text-yellow-300 font-medium">{addPunctuation(state.winner.eatenCards.flat().concat(state.winner.handCards).map(c => c.char).join(''))}</span>
                </p>
              )}
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-colors font-medium text-lg"
              >
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 游戏结束弹窗 */}
        {state.status === 'finished' && state.winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">
                {state.winner.isHuman ? '恭喜你赢了！' : `${state.winner.name}赢了！`}
              </h2>
              <p className="mb-4">
                获胜句子：{state.history.find(h => h.type === 'win')?.sentence || ''}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  再来一局
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  返回主页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI裁判弹窗 */}
      <AIJudgeDialog
        isOpen={showAIJudge}
        sentence={pendingWinSentence}
        onClose={() => setShowAIJudge(false)}
        onConfirm={handleJudgeResult}
        validateFunction={validateSentence}
        addPunctuation={addPunctuation}
      />

      {/* 句子输入弹窗 */}
      <SentenceInputDialog
        isOpen={showSentenceInput}
        defaultSentence={defaultSentence}
        onClose={() => setShowSentenceInput(false)}
        onConfirm={handleSentenceConfirm}
      />

      {/* 吃牌审核弹窗 */}
      <CombinationJudgeDialog
        isOpen={showCombinationJudge}
        combination={pendingCombination}
        onClose={() => setShowCombinationJudge(false)}
        onConfirm={handleEatJudgeResult}
        validateFunction={validateCombination}
      />
    </div>
  );
};

export default GameTable;
