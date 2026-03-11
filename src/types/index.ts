export type CardCategory = 
  | 'emotion'    // 情感核心字
  | 'verb'       // 高频动词
  | 'noun'       // 日常名词
  | 'adjective'  // 形容词
  | 'adverb'     // 副词+虚词+语气词
  | 'scene'      // 场景/方位字
  | 'supplement' // 补充融合字

export interface Card {
  id: string;
  char: string;
  category: CardCategory;
  pinyin: string;
  frequency: number; // 1-5，词频越高越常用
  definition?: string; // 汉字释义
  imageUrl?: string; // 牌面图片URL
}

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  handCards: Card[];
  eatenCards: Card[][]; // 吃牌的牌组
  isWin: boolean;
  aiLevel?: 'easy' | 'normal' | 'hard';
}

export interface GameOptions {
  playerCount: number; // 2-4，包含AI
  aiDifficulty: 'easy' | 'normal' | 'hard';
  cardLibrary: string;
  soundEnabled: boolean;
  animationEnabled: boolean;
  aiEnhanced: boolean; // 是否启用AI增强语义验证
}

export interface GameState {
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  currentRound: number;
  currentPlayer: number;
  turnPhase: 'draw' | 'play' | 'discard' | 'wait'; // 回合阶段：摸牌/操作/出牌/等待
  players: Player[];
  wallCards: Card[];
  discardPile: Card[];
  currentDiscard: Card | null;
  winner: Player | null;
  history: ActionRecord[];
  settings: GameOptions;
  selectedCard: Card | null;
  selectedCombination: Card[];
}

export type ActionType = 'draw' | 'discard' | 'eat' | 'win' | 'pass';

export interface PlayerAction {
  type: ActionType;
  playerId: number;
  card?: Card;
  combination?: Card[];
  sentence?: string;
}

export interface ActionRecord {
  id: string;
  type: ActionType;
  playerId: number;
  card?: Card;
  combination?: Card[];
  sentence?: string;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  suggestions: string[];
  reasons: string[];
}

export interface CardLibrary {
  id: string;
  name: string;
  description: string;
  categories: CardCategory[];
  cards: Card[];
  createdAt: number;
  updatedAt: number;
}

export interface GameRecord {
  id: string;
  timestamp: number;
  playerCount: number;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  winner: 'player' | 'ai1' | 'ai2' | 'ai3';
  winningSentence: string;
  duration: number;
  score: number;
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'qwen' | 'doubao';
  apiKey: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
}

export interface UserPreferences {
  soundEnabled: boolean;
  animationEnabled: boolean;
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  aiConfig?: AIServiceConfig;
}
