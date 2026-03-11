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
        if (store.state.turnPhase !== 'draw') {
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
          logger.warn('GameStore', '当前阶段不能出牌');
          return;
        }

        if (!action.card) return;
        
        const cardIndex = currentPlayer.handCards.findIndex(c => c.id === action.card!.id);
        if (cardIndex === -1) return;

        // 检查手牌数量：初始14张（庄家）或摸牌后14张
        if (currentPlayer.handCards.length !== 14) {
          logger.warn('GameStore', '手牌数量不正确，无法出牌', { 
            handSize: currentPlayer.handCards.length 
          });
          return;
        }

        const discardedCard = currentPlayer.handCards.splice(cardIndex, 1)[0];
        
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
          get().nextTurn();
        }, 500);
        break;
      }

      case 'eat': {
        if (store.state.turnPhase !== 'play' && store.state.turnPhase !== 'wait') return;
        if (!action.combination || !store.state.currentDiscard) return;
        
        // 从手牌中移除用于组合的牌（不包含打出的那张）
        const usedCardIds = new Set();
        action.combination.forEach(card => {
          if (card.id !== store.state.currentDiscard!.id) {
            usedCardIds.add(card.id);
            const index = currentPlayer.handCards.findIndex(c => c.id === card.id);
            if (index !== -1) {
              currentPlayer.handCards.splice(index, 1);
            }
          }
        });

        // 将打出的牌加入手牌
        currentPlayer.handCards.push(store.state.currentDiscard);
        
        // 添加到吃牌组合
        currentPlayer.eatenCards.push([...action.combination]);
        
        console.log('吃牌后手牌数量:', currentPlayer.handCards.length); // 应该是12张，需要打出一张

        // 吃牌后手牌数量：原本13张 - 2张用于组合 + 1张吃的牌 = 12张，需要进入出牌阶段
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
        logger.debug('GameStore', 'AI判断是否吃牌', { discard: store.state.currentDiscard.char });
        // 简单AI策略：随机决定是否吃牌（30%概率）
        const shouldEat = Math.random() < 0.3;
        
        if (shouldEat && currentPlayer.handCards.length >= 2) {
          // 随机选择2张牌和打出的牌组合（简化逻辑）
          const combination = [
            store.state.currentDiscard,
            currentPlayer.handCards[0],
            currentPlayer.handCards[1]
          ];
          
          logger.debug('GameStore', 'AI选择吃牌', { combination: combination.map(c => c.char).join('') });
          
          const eatAction: PlayerAction = {
            type: 'eat',
            playerId: store.state.currentPlayer,
            combination,
          };
          
          await get().handlePlayerAction(eatAction);
          
          // 吃牌后直接出牌
          const discardCard = currentPlayer.handCards[Math.floor(Math.random() * currentPlayer.handCards.length)];
          const discardAction: PlayerAction = {
            type: 'discard',
            playerId: store.state.currentPlayer,
            card: discardCard,
          };
          
          await get().handlePlayerAction(discardAction);
          logger.info('GameStore', 'AI回合结束（吃牌）');
          return;
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
      
      if (currentPlayer.aiLevel === 'hard') {
        // 困难难度：使用大模型分析，策略性出牌
        logger.debug('GameStore', '困难AI，使用语义分析选择出牌');
        discardCard = await get().aiHardStrategy(currentPlayer);
      } else {
        // 简单/普通难度：随机出牌
        logger.debug('GameStore', '简单AI，随机出牌');
        discardCard = currentPlayer.handCards[Math.floor(Math.random() * currentPlayer.handCards.length)];
      }

      logger.debug('GameStore', 'AI出牌', { card: discardCard.char, difficulty: currentPlayer.aiLevel });
      const discardAction: PlayerAction = {
        type: 'discard',
        playerId: store.state.currentPlayer,
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
