import { create } from 'zustand';
import type { GameState, GameOptions, Player, Card, PlayerAction, ValidationResult } from '../types';
import CardLibraryService from '../services/CardLibrary';
import { aiService } from '../services/AIService';
import { validateSemantics as localValidateSemantics, addPunctuation } from '../utils/validation';
import { LocalStorageUtil } from '../utils/storage';
import { logger } from '../utils/logger';

const initialGameState: GameState = {
  status: 'waiting',
  currentRound: 1,
  currentPlayer: 0,
  turnPhase: 'wait',
  players: [],
  wallCards: [],
  discardPile: [],
  currentDiscard: null,
  winner: null,
  history: [],
  settings: {
    playerCount: 2,
    aiDifficulty: 'normal',
    cardLibrary: 'default',
    soundEnabled: true,
    animationEnabled: true,
    aiEnhanced: true,
  },
  selectedCard: null,
  selectedCombination: [],
};

interface GameStore {
  state: GameState;
  initializeGame: (options: Partial<GameOptions>) => Promise<void>;
  startGame: () => void;
  handlePlayerAction: (action: PlayerAction) => Promise<void>;
  aiTurn: () => Promise<void>;
  aiHardStrategy: (player: Player) => Promise<Card>;
  nextTurn: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  selectCard: (card: Card | null) => void;
  toggleCardSelection: (card: Card) => void;
  clearSelection: () => void;
  validateCombination: (combination: Card[]) => Promise<ValidationResult>;
  validateSentence: (sentence: string) => Promise<ValidationResult>;
  addPunctuation: (sentence: string) => string;
  updateSettings: (settings: Partial<GameOptions>) => void;
  updatePlayerHand: (playerId: number, newCards: Card[]) => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  state: initialGameState,

  initializeGame: async (options: Partial<GameOptions>) => {
    try {
      const settings = { ...initialGameState.settings, ...options };
      const library = CardLibraryService.getLibrary(settings.cardLibrary);
      if (!library) throw new Error('牌库不存在');

      const shuffledDeck = CardLibraryService.shuffle(library.cards);
      const { players: playerHands, wall } = CardLibraryService.dealCards(
        shuffledDeck, 
        settings.playerCount
      );

      const players: Player[] = playerHands.map((hand, index) => ({
        id: index,
        name: index === 0 ? '玩家' : `AI ${index}`,
        isHuman: index === 0,
        handCards: hand,
        eatenCards: [],
        isWin: false,
        aiLevel: index === 0 ? undefined : settings.aiDifficulty,
      }));

      set({
        state: {
          ...initialGameState,
          status: 'waiting',
          players,
          wallCards: wall,
          settings,
        },
      });
    } catch (error) {
      logger.error('GameStore', '游戏初始化失败', error as Error);
      throw error;
    }
  },

  startGame: () => {
    set(state => ({
      state: {
        ...state.state,
        status: 'playing',
        turnPhase: 'play', // 庄家初始有14张牌，直接进入出牌阶段
      },
    }));
  },

  handlePlayerAction: async (action: PlayerAction) => {
    const store = get();
    const currentPlayer = store.state.players[action.playerId];
    
    if (action.playerId !== store.state.currentPlayer) {
      logger.warn('GameStore', '不是当前玩家的回合');
      return;
    }

    switch (action.type) {
      case 'draw': {
        if (store.state.turnPhase !== 'draw' && store.state.turnPhase !== 'wait') {
          logger.warn('GameStore', '当前阶段不能摸牌');
          return;
        }

        if (store.state.wallCards.length === 0) {
          set(state => ({
            state: { ...state.state, status: 'finished' },
          }));
          return;
        }

        const drawnCard = store.state.wallCards.pop()!;
        currentPlayer.handCards.push(drawnCard);
        
        set(state => ({
          state: {
            ...state.state,
            players: [...state.state.players],
            wallCards: [...state.state.wallCards],
            turnPhase: 'play',
            history: [...state.state.history, {
              id: crypto.randomUUID(),
              type: 'draw',
              playerId: action.playerId,
              card: drawnCard,
              timestamp: Date.now(),
            }],
          },
        }));
        break;
      }

      case 'discard': {
        if (store.state.turnPhase !== 'play' && store.state.turnPhase !== 'discard') {
          logger.warn('GameStore', '当前阶段不能出牌', { turnPhase: store.state.turnPhase });
          return;
        }

        if (!action.card) {
          logger.warn('GameStore', '出牌没有指定牌');
          return;
        }
        
        const cardIndex = currentPlayer.handCards.findIndex(c => c.id === action.card!.id);
        if (cardIndex === -1) {
          logger.warn('GameStore', '在手牌中找不到要出的牌', { 
            cardId: action.card!.id, 
            cardChar: action.card!.char,
            handSize: currentPlayer.handCards.length,
            handCards: currentPlayer.handCards.map(c => c.char)
          });
          return;
        }

        // 检查手牌数量：必须至少有一张牌才能打出
        // 吃牌后手牌数量 = 原13张 - (n-1) + 1 = 14 - n，一定小于14
        if (currentPlayer.handCards.length === 0) {
          logger.warn('GameStore', '手牌为空，无法出牌', { 
            handSize: currentPlayer.handCards.length 
          });
          return;
        }

        const discardedCard = currentPlayer.handCards.splice(cardIndex, 1)[0];
        
        logger.debug('GameStore', 'AI成功出牌', { char: discardedCard.char, id: discardedCard.id, remainingHand: currentPlayer.handCards.length });
        
        set(state => ({
          state: {
            ...state.state,
            players: [...state.state.players],
            discardPile: [...state.state.discardPile, discardedCard],
            currentDiscard: discardedCard,
            turnPhase: 'wait',
            history: [...state.state.history, {
              id: crypto.randomUUID(),
              type: 'discard',
              playerId: action.playerId,
              card: discardedCard,
              timestamp: Date.now(),
            }],
          },
        }));

        setTimeout(() => {
          logger.debug('GameStore', '出牌完成，准备切换下一回合');
          get().nextTurn();
        }, 500);
        break;
      }

      case 'eat': {
        if (store.state.turnPhase !== 'play' && store.state.turnPhase !== 'wait') return;
        if (!action.combination || !store.state.currentDiscard) return;
        
        // 从手牌中移除用于组合的牌（不包含打出的那张）
        // 打出的那张直接加入吃牌组合，不需要再加到手牌
        const usedCardIds = new Set();
        action.combination.forEach(card => {
          if (card.id !== store.state.currentDiscard!.id) {
            usedCardIds.add(card.id);
            const index = currentPlayer.handCards.findIndex(c => c.id === card.id);
            if (index !== -1) {
              currentPlayer.handCards.splice(index, 1);
              logger.debug('GameStore', '吃牌移除手牌', { char: card.char, id: card.id });
            } else {
              logger.warn('GameStore', '吃牌：在手牌中找不到牌', { char: card.char, id: card.id });
            }
          }
        });

        // 添加到吃牌组合 - 包含了上家打出的那张牌
        currentPlayer.eatenCards.push([...action.combination]);
        
        logger.debug('GameStore', '吃牌后手牌数量', { 
          handSize: currentPlayer.handCards.length,
          combinationSize: action.combination.length,
          removedCount: usedCardIds.size
        });

        // 吃牌后：原手牌数 - 移除数 = 新手牌数，需要打出一张
        // 上家打出的那张已经直接进入吃牌组合，不需要再加到手牌
        set(state => ({
          state: {
            ...state.state,
            players: [...state.state.players],
            currentDiscard: null,
            turnPhase: 'play', // 进入出牌阶段，需要打出一张牌
            history: [...state.state.history, {
              id: crypto.randomUUID(),
              type: 'eat',
              playerId: action.playerId,
              combination: action.combination,
              timestamp: Date.now(),
            }],
          },
        }));
        break;
      }

      case 'win': {
        currentPlayer.isWin = true;
        let sentence = action.sentence || '';
        if (!sentence) {
          const allCards = [
            ...currentPlayer.handCards,
            ...currentPlayer.eatenCards.flat()
          ];
          sentence = allCards.map(c => c.char).join('');
        }

        set(state => ({
          state: {
            ...state.state,
            players: [...state.state.players],
            status: 'finished',
            winner: currentPlayer,
            history: [...state.state.history, {
              id: crypto.randomUUID(),
              type: 'win',
              playerId: action.playerId,
              sentence,
              timestamp: Date.now(),
            }],
          },
        }));
        break;
      }
    }
  },

  aiTurn: async () => {
    const store = get();
    const currentPlayer = store.state.players[store.state.currentPlayer];
    
    if (currentPlayer.isHuman || store.state.status !== 'playing') return;

    try {
      logger.info('GameStore', 'AI开始回合', { difficulty: currentPlayer.aiLevel });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // 增加思考时间，更真实

      // 如果有上家打出的牌，AI先判断是否吃牌
      if (store.state.currentDiscard) {
        logger.debug('GameStore', 'AI判断是否吃牌', { discard: store.state.currentDiscard.char, difficulty: currentPlayer.aiLevel });
        
        // 根据难度设置不同的吃牌概率
        let eatProbability = 0;
        switch (currentPlayer.aiLevel) {
          case 'easy':
            eatProbability = 0; // 简单：永远不吃牌
            break;
          case 'normal':
            eatProbability = 0.0; // 中等：不吃牌
            break;
          case 'hard':
            eatProbability = 0.5; // 困难：80%概率尝试吃牌（如果能组成有效组合）
            break;
        }
        
        const shouldEat = Math.random() < eatProbability;
        
        if (shouldEat && currentPlayer.handCards.length >= 1) { // 至少要有一张牌才能吃
          // 对于困难难度，需要先验证组合是否有效
          if (currentPlayer.aiLevel === 'hard') {
            // 尝试所有可能的组合，找出能组成有效组合的
            const possibleCombinations: Card[][] = [];
            // 尝试所有 n-1 张手牌和打出的牌组合，n从2到3
            for (let n = 1; n <= 2 && n < currentPlayer.handCards.length; n++) {
              // 简单起见，选前n张组合
              const combination = [store.state.currentDiscard, ...currentPlayer.handCards.slice(0, n)];
              possibleCombinations.push(combination);
            }
            
            // 找到第一个有效的组合
            let validCombination: Card[] | null = null;
            for (const combo of possibleCombinations) {
              const result = await get().validateCombination(combo);
              if (result.isValid) {
                validCombination = combo;
                break;
              }
            }
            
            if (validCombination) {
              logger.debug('GameStore', '困难AI选择吃牌', { combination: validCombination.map(c => c.char).join('') });
              const eatAction: PlayerAction = {
                type: 'eat',
                playerId: store.state.currentPlayer,
                combination: validCombination,
              };
              
              await get().handlePlayerAction(eatAction);
              
              // 吃牌后需要重新获取最新的玩家数据，因为引用已经变了
              const updatedStore = get();
              const updatedPlayer = updatedStore.state.players[updatedStore.state.currentPlayer];
              
              // 吃牌后直接出牌，从更新后的手牌中选择
              if (updatedPlayer.handCards.length > 0) {
                logger.debug('GameStore', 'AI吃牌后准备出牌', { 
                  handSize: updatedPlayer.handCards.length,
                  playerId: updatedStore.state.currentPlayer
                });
                
                let discardCard: Card;
                if (updatedPlayer.aiLevel === 'hard') {
                  discardCard = await get().aiHardStrategy(updatedPlayer);
                } else {
                  // 中等难度：按频率选择，打出频率最低的牌
                  // 复制一份，按frequency升序排序（频率越低越先打出）
                  const sortedByFreq = [...updatedPlayer.handCards].sort((a, b) => a.frequency - b.frequency);
                  discardCard = sortedByFreq[0];
                }
                
                logger.debug('GameStore', 'AI选择出牌', { char: discardCard.char, id: discardCard.id });
                const discardAction: PlayerAction = {
                  type: 'discard',
                  playerId: updatedStore.state.currentPlayer,
                  card: discardCard,
                };
                
                await get().handlePlayerAction(discardAction);
                logger.info('GameStore', 'AI回合结束（吃牌）');
              } else {
                // 如果手牌为空（异常情况），直接切换回合
                logger.error('GameStore', 'AI吃牌后手牌为空，强制切换回合');
                setTimeout(() => {
                  get().nextTurn();
                }, 500);
              }
              return;
            }
            
            // 没有找到有效组合，不吃牌，继续正常摸牌
            logger.debug('GameStore', '困难AI没有找到有效组合，不吃牌');
          } else {
            // 简单/中等难度：随机选择前n-1张组合
            const needCards = Math.floor(Math.random() * 2) + 1; // 1或2张，组成2或3张组合
            if (currentPlayer.handCards.length >= needCards) {
              const combination = [
                store.state.currentDiscard,
                ...currentPlayer.handCards.slice(0, needCards)
              ];
              
              logger.debug('GameStore', 'AI选择吃牌', { combination: combination.map(c => c.char).join('') });
              
              const eatAction: PlayerAction = {
                type: 'eat',
                playerId: store.state.currentPlayer,
                combination,
              };
              
              await get().handlePlayerAction(eatAction);
              
              // 吃牌后需要重新获取最新的玩家数据，因为引用已经变了
              const updatedStore = get();
              const updatedPlayer = updatedStore.state.players[updatedStore.state.currentPlayer];
              
              // 吃牌后直接出牌，从更新后的手牌中选择
              if (updatedPlayer.handCards.length > 0) {
                logger.debug('GameStore', 'AI吃牌后准备出牌', { 
                  handSize: updatedPlayer.handCards.length,
                  playerId: updatedStore.state.currentPlayer
                });
                
                let discardCard: Card;
                if (updatedPlayer.aiLevel === 'normal') {
                  // 中等难度：按频率选择，打出频率最低的牌
                  const sortedByFreq = [...updatedPlayer.handCards].sort((a, b) => a.frequency - b.frequency);
                  discardCard = sortedByFreq[0];
                  logger.debug('GameStore', '中等AI按频率选择出牌', { char: discardCard.char, frequency: discardCard.frequency });
                } else {
                  // 简单难度：随机出牌
                  discardCard = updatedPlayer.handCards[Math.floor(Math.random() * updatedPlayer.handCards.length)];
                }
                
                logger.debug('GameStore', 'AI选择出牌', { char: discardCard.char, id: discardCard.id });
                const discardAction: PlayerAction = {
                  type: 'discard',
                  playerId: updatedStore.state.currentPlayer,
                  card: discardCard,
                };
                
                await get().handlePlayerAction(discardAction);
                logger.info('GameStore', 'AI回合结束（吃牌）');
              } else {
                // 如果手牌为空（异常情况），直接切换回合
                logger.error('GameStore', 'AI吃牌后手牌为空，强制切换回合');
                setTimeout(() => {
                  get().nextTurn();
                }, 500);
              }
              return;
            }
          }
        }
      }
  
      // 没有吃牌，正常摸牌
      logger.debug('GameStore', 'AI摸牌');
      const drawAction: PlayerAction = {
        type: 'draw',
        playerId: store.state.currentPlayer,
      };
      await get().handlePlayerAction(drawAction);

      let discardCard: Card;
      
      // 摸牌后重新获取最新的玩家数据
      const updatedStore = get();
      const updatedPlayer = updatedStore.state.players[updatedStore.state.currentPlayer];
      
      if (updatedPlayer.aiLevel === 'hard') {
        // 困难难度：使用大模型分析，策略性出牌
        logger.debug('GameStore', '困难AI，使用语义分析选择出牌');
        discardCard = await get().aiHardStrategy(updatedPlayer);
      } else if (updatedPlayer.aiLevel === 'normal') {
        // 中等难度：按使用频率出牌，打出频率最低的牌
        logger.debug('GameStore', '中等AI，按频率选择出牌');
        const sortedByFreq = [...updatedPlayer.handCards].sort((a, b) => a.frequency - b.frequency);
        discardCard = sortedByFreq[0];
        logger.debug('GameStore', '中等AI选择出牌', { char: discardCard.char, frequency: discardCard.frequency });
      } else {
        // 简单难度：完全随机出牌
        logger.debug('GameStore', '简单AI，随机出牌');
        discardCard = updatedPlayer.handCards[Math.floor(Math.random() * updatedPlayer.handCards.length)];
      }

      logger.debug('GameStore', 'AI出牌', { card: discardCard.char, difficulty: updatedPlayer.aiLevel });
      const discardAction: PlayerAction = {
        type: 'discard',
        playerId: updatedStore.state.currentPlayer,
        card: discardCard,
      };
      await get().handlePlayerAction(discardAction);
      
      logger.info('GameStore', 'AI回合结束');
    } catch (error) {
      logger.error('GameStore', 'AI操作失败', error as Error);
      // 出错时随机出牌
      try {
        const currentPlayer = store.state.players[store.state.currentPlayer];
        if (currentPlayer.handCards.length === 14) {
          const discardCard = currentPlayer.handCards[Math.floor(Math.random() * currentPlayer.handCards.length)];
          const discardAction: PlayerAction = {
            type: 'discard',
            playerId: store.state.currentPlayer,
            card: discardCard,
          };
          await get().handlePlayerAction(discardAction);
        }
      } catch (e) {
        logger.error('GameStore', 'AI fallback出牌失败', e as Error);
        // 最终 fallback：强制切换回合
        setTimeout(() => {
          get().nextTurn();
        }, 1000);
      }
    }
  },

  // 困难AI策略：使用大模型分析手牌，选择最优出牌
  aiHardStrategy: async (player: Player): Promise<Card> => {
    const store = get();
    const handCards = player.handCards;
    
    try {
      // 1. 首先检查是否可以胡牌
      const allCards = [...handCards, ...player.eatenCards.flat()];
      const sentence = allCards.map(c => c.char).join('');
      const winValidation = await get().validateSentence(sentence);
      
      if (winValidation.isValid && allCards.length === 14) {
        // 可以胡牌，直接胡牌
        logger.info('GameStore', '困难AI发现可以胡牌', { sentence });
        const winAction: PlayerAction = {
          type: 'win',
          playerId: player.id,
          sentence,
        };
        await get().handlePlayerAction(winAction);
        // 胡牌后不需要出牌，返回任意牌（不会被使用）
        return handCards[0];
      }

      // 2. 分析手牌组合，找出最没用的牌
      // 对于每一张牌，计算剩下的牌能组成多少有效组合
      const cardScores: { card: Card; score: number }[] = [];
      
      for (let i = 0; i < handCards.length; i++) {
        const testCards = handCards.filter((_, index) => index !== i);
        let totalScore = 0;
        
        // 检查所有可能的2字组合
        for (let a = 0; a < testCards.length; a++) {
          for (let b = a + 1; b < testCards.length; b++) {
            const combination = [testCards[a], testCards[b]];
            const validation = await get().validateCombination(combination);
            if (validation.isValid) {
              totalScore += validation.score;
            }
          }
        }
        
        // 检查所有可能的3字组合
        for (let a = 0; a < testCards.length; a++) {
          for (let b = a + 1; b < testCards.length; b++) {
            for (let c = b + 1; c < testCards.length; c++) {
              const combination = [testCards[a], testCards[b], testCards[c]];
              const validation = await get().validateCombination(combination);
              if (validation.isValid) {
                totalScore += validation.score * 1.5; // 3字组合权重更高
              }
            }
          }
        }
        
        cardScores.push({ card: handCards[i], score: totalScore });
      }
      
      // 找出得分最低的牌（对组合最没用的牌）
      cardScores.sort((a, b) => a.score - b.score);
      
      // 优先打出得分最低的牌
      logger.debug('GameStore', '困难AI出牌分析', {
        cards: cardScores.map(cs => ({ char: cs.card.char, score: cs.score })),
        selected: cardScores[0].card.char
      });
      
      return cardScores[0].card;
      
    } catch (error) {
      logger.error('GameStore', '困难AI策略失败，回退到随机出牌', error as Error);
      // 出错时随机出牌
      return handCards[Math.floor(Math.random() * handCards.length)];
    }
  },

  nextTurn: () => {
    set(state => {
      const nextPlayer = (state.state.currentPlayer + 1) % state.state.players.length;
      
      logger.info('GameStore', '切换回合', { 
        from: state.state.currentPlayer, 
        to: nextPlayer,
        isAI: !state.state.players[nextPlayer].isHuman
      });

      // 如果是AI玩家，延迟调用aiTurn
      if (!state.state.players[nextPlayer].isHuman) {
        setTimeout(() => {
          get().aiTurn();
        }, 1000);
      }

      // 如果有上一家打出的牌，下家是人类玩家，先进入等待吃牌阶段
      const hasDiscard = !!state.state.currentDiscard;
      const isHumanPlayer = state.state.players[nextPlayer].isHuman;
      
      return {
        state: {
          ...state.state,
          currentPlayer: nextPlayer,
          turnPhase: hasDiscard && isHumanPlayer ? 'wait' : 'draw',
          selectedCard: null,
          selectedCombination: [],
        },
      };
    });
  },

  pauseGame: () => {
    set(state => ({
      state: { ...state.state, status: 'paused' },
    }));
  },

  resumeGame: () => {
    set(state => ({
      state: { ...state.state, status: 'playing' },
    }));
  },

  restartGame: () => {
    set({ state: initialGameState });
  },

  selectCard: (card: Card | null) => {
    set(state => ({
      state: { ...state.state, selectedCard: card },
    }));
  },

  toggleCardSelection: (card: Card) => {
    set(state => {
      const isSelected = state.state.selectedCombination.some(c => c.id === card.id);
      const newSelection = isSelected 
        ? state.state.selectedCombination.filter(c => c.id !== card.id)
        : [...state.state.selectedCombination, card];
      
      return {
        state: { ...state.state, selectedCombination: newSelection },
      };
    });
  },

  clearSelection: () => {
    set(state => ({
      state: {
        ...state.state,
        selectedCard: null,
        selectedCombination: [],
      },
    }));
  },

  validateCombination: async (combination: Card[], userExplanation?: string): Promise<ValidationResult> => {
    const content = combination.map(c => c.char).join('');
    try {
      if (aiService.isEnabled() && get().state.settings.aiEnhanced) {
        return await aiService.validateSemantics(content, 'combination', userExplanation);
      } else {
        return localValidateSemantics(content, 'combination');
      }
    } catch (error) {
      return localValidateSemantics(content, 'combination');
    }
  },

  validateSentence: async (sentence: string, userExplanation?: string): Promise<ValidationResult> => {
    try {
      if (aiService.isEnabled() && get().state.settings.aiEnhanced) {
        return await aiService.validateSemantics(sentence, 'sentence', userExplanation);
      } else {
        return localValidateSemantics(sentence, 'sentence');
      }
    } catch (error) {
      return localValidateSemantics(sentence, 'sentence');
    }
  },

  addPunctuation: (sentence: string): string => {
    return addPunctuation(sentence);
  },

  updateSettings: (settings: Partial<GameOptions>) => {
    set(state => ({
      state: {
        ...state.state,
        settings: { ...state.state.settings, ...settings },
      },
    }));
  },

  updatePlayerHand: (playerId: number, newCards: Card[]) => {
    set(state => {
      const players = [...state.state.players];
      if (players[playerId]) {
        players[playerId] = { ...players[playerId], handCards: newCards };
      }
      return { state: { ...state.state, players } };
    });
  }
}));

export default useGameStore;
