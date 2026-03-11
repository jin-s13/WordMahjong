import type { GameState, GameOptions, GameRecord, UserPreferences, CardLibrary, AIServiceConfig } from '../types';

// 本地存储键名
const StorageKeys = {
  GAME_STATE: 'mahjong_game_state',
  GAME_OPTIONS: 'mahjong_game_options',
  GAME_RECORDS: 'mahjong_game_records',
  USER_PREFERENCES: 'mahjong_user_preferences',
  CARD_LIBRARIES: 'mahjong_card_libraries',
  AI_CONFIG: 'mahjong_ai_config',
} as const;

export class LocalStorageUtil {
  // 保存数据
  static save<T>(key: StorageKeys, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error('保存数据失败:', e);
    }
  }

  // 加载数据
  static load<T>(key: StorageKeys, defaultValue: T): T {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return defaultValue;
      }
      return JSON.parse(serialized) as T;
    } catch (e) {
      console.error('加载数据失败:', e);
      return defaultValue;
    }
  }

  // 删除数据
  static remove(key: StorageKeys): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('删除数据失败:', e);
    }
  }

  // 清空所有数据
  static clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('清空数据失败:', e);
    }
  }

  // 游戏状态相关
  static saveGameState(state: GameState): void {
    this.save(StorageKeys.GAME_STATE, state);
  }

  static loadGameState(): GameState | null {
    return this.load<GameState | null>(StorageKeys.GAME_STATE, null);
  }

  static removeGameState(): void {
    this.remove(StorageKeys.GAME_STATE);
  }

  // 游戏选项相关
  static saveGameOptions(options: GameOptions): void {
    this.save(StorageKeys.GAME_OPTIONS, options);
  }

  static loadGameOptions(): GameOptions {
    return this.load<GameOptions>(StorageKeys.GAME_OPTIONS, {
      playerCount: 2,
      aiDifficulty: 'normal',
      cardLibrary: 'default',
      soundEnabled: true,
      animationEnabled: true,
      aiEnhanced: false,
    });
  }

  // 游戏记录相关
  static saveGameRecord(record: GameRecord): void {
    const records = this.loadGameRecords();
    records.push(record);
    // 只保留最近100条记录
    if (records.length > 100) {
      records.shift();
    }
    this.save(StorageKeys.GAME_RECORDS, records);
  }

  static loadGameRecords(): GameRecord[] {
    return this.load<GameRecord[]>(StorageKeys.GAME_RECORDS, []);
  }

  static clearGameRecords(): void {
    this.remove(StorageKeys.GAME_RECORDS);
  }

  // 用户偏好相关
  static saveUserPreferences(prefs: UserPreferences): void {
    this.save(StorageKeys.USER_PREFERENCES, prefs);
  }

  static loadUserPreferences(): UserPreferences {
    return this.load<UserPreferences>(StorageKeys.USER_PREFERENCES, {
      soundEnabled: true,
      animationEnabled: true,
      theme: 'light',
      language: 'zh-CN',
    });
  }

  // 牌库相关
  static saveCardLibrary(library: CardLibrary): void {
    const libraries = this.loadCardLibraries();
    const index = libraries.findIndex(l => l.id === library.id);
    if (index !== -1) {
      libraries[index] = library;
    } else {
      libraries.push(library);
    }
    this.save(StorageKeys.CARD_LIBRARIES, libraries);
  }

  static loadCardLibraries(): CardLibrary[] {
    return this.load<CardLibrary[]>(StorageKeys.CARD_LIBRARIES, []);
  }

  static loadCardLibrary(id: string): CardLibrary | undefined {
    const libraries = this.loadCardLibraries();
    return libraries.find(l => l.id === id);
  }

  static deleteCardLibrary(id: string): void {
    const libraries = this.loadCardLibraries().filter(l => l.id !== id);
    this.save(StorageKeys.CARD_LIBRARIES, libraries);
  }

  // AI配置相关
  static saveAIConfig(config: AIServiceConfig): void {
    this.save(StorageKeys.AI_CONFIG, config);
  }

  static loadAIConfig(): AIServiceConfig | null {
    return this.load<AIServiceConfig | null>(StorageKeys.AI_CONFIG, null);
  }

  static removeAIConfig(): void {
    this.remove(StorageKeys.AI_CONFIG);
  }
}

export default LocalStorageUtil;
