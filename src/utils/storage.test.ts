import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageUtil } from './storage';
import type { GameOptions, GameRecord, UserPreferences, AIServiceConfig, CardLibrary } from '../types';

describe('LocalStorageUtil', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('basic operations', () => {
    it('should save and load data correctly', () => {
      const testData = { key: 'value', number: 123 };
      LocalStorageUtil.save('test-key' as any, testData);
      
      const loaded = LocalStorageUtil.load('test-key' as any, null);
      expect(loaded).toEqual(testData);
    });

    it('should return default value when key does not exist', () => {
      const defaultValue = { default: 'value' };
      const loaded = LocalStorageUtil.load('non-existent-key' as any, defaultValue);
      expect(loaded).toEqual(defaultValue);
    });

    it('should remove data correctly', () => {
      LocalStorageUtil.save('test-key' as any, 'test-value');
      LocalStorageUtil.remove('test-key' as any);
      
      const loaded = LocalStorageUtil.load('test-key' as any, null);
      expect(loaded).toBeNull();
    });

    it('should clear all data correctly', () => {
      LocalStorageUtil.save('key1' as any, 'value1');
      LocalStorageUtil.save('key2' as any, 'value2');
      LocalStorageUtil.clear();
      
      expect(window.localStorage.getItem('key1' as any)).toBeNull();
      expect(window.localStorage.getItem('key2' as any)).toBeNull();
    });
  });

  describe('game state operations', () => {
    it('should save and load game state', () => {
      const mockState = {
        status: 'playing',
        currentPlayer: 0,
        players: [],
        wallCards: [],
        discardPile: [],
      } as any;
      
      LocalStorageUtil.saveGameState(mockState);
      const loaded = LocalStorageUtil.loadGameState();
      
      expect(loaded).toEqual(mockState);
    });

    it('should return null when no game state exists', () => {
      const loaded = LocalStorageUtil.loadGameState();
      expect(loaded).toBeNull();
    });

    it('should remove game state', () => {
      LocalStorageUtil.saveGameState({} as any);
      LocalStorageUtil.removeGameState();
      
      const loaded = LocalStorageUtil.loadGameState();
      expect(loaded).toBeNull();
    });
  });

  describe('game options operations', () => {
    it('should save and load game options', () => {
      const options: GameOptions = {
        playerCount: 3,
        aiDifficulty: 'hard',
        cardLibrary: 'custom',
        soundEnabled: false,
        animationEnabled: true,
        aiEnhanced: true,
      };
      
      LocalStorageUtil.saveGameOptions(options);
      const loaded = LocalStorageUtil.loadGameOptions();
      
      expect(loaded).toEqual(options);
    });

    it('should return default options when none exist', () => {
      const loaded = LocalStorageUtil.loadGameOptions();
      expect(loaded).toEqual({
        playerCount: 2,
        aiDifficulty: 'normal',
        cardLibrary: 'default',
        soundEnabled: true,
        animationEnabled: true,
        aiEnhanced: false,
      });
    });
  });

  describe('game record operations', () => {
    it('should save and load game records', () => {
      const record: GameRecord = {
        id: 'test-record-1',
        timestamp: Date.now(),
        playerCount: 2,
        aiDifficulty: 'normal',
        winner: 'player',
        winningSentence: '我今天吃了好吃的饭',
        duration: 300,
        score: 90,
      };
      
      LocalStorageUtil.saveGameRecord(record);
      const records = LocalStorageUtil.loadGameRecords();
      
      expect(records.length).toBe(1);
      expect(records[0]).toEqual(record);
    });

    it('should keep only last 100 records', () => {
      // Save 101 records
      for (let i = 0; i < 101; i++) {
        LocalStorageUtil.saveGameRecord({
          id: `test-record-${i}`,
          timestamp: Date.now(),
          playerCount: 2,
          aiDifficulty: 'normal',
          winner: 'player',
          winningSentence: `测试句子${i}`,
          duration: 300,
          score: 90,
        });
      }
      
      const records = LocalStorageUtil.loadGameRecords();
      expect(records.length).toBe(100);
      expect(records[0].id).toBe('test-record-1'); // First one should be removed
    });

    it('should clear game records', () => {
      LocalStorageUtil.saveGameRecord({} as any);
      LocalStorageUtil.clearGameRecords();
      
      const records = LocalStorageUtil.loadGameRecords();
      expect(records.length).toBe(0);
    });
  });

  describe('user preferences operations', () => {
    it('should save and load user preferences', () => {
      const prefs: UserPreferences = {
        soundEnabled: false,
        animationEnabled: false,
        theme: 'dark',
        language: 'en-US',
      };
      
      LocalStorageUtil.saveUserPreferences(prefs);
      const loaded = LocalStorageUtil.loadUserPreferences();
      
      expect(loaded).toEqual(prefs);
    });

    it('should return default preferences when none exist', () => {
      const loaded = LocalStorageUtil.loadUserPreferences();
      expect(loaded).toEqual({
        soundEnabled: true,
        animationEnabled: true,
        theme: 'light',
        language: 'zh-CN',
      });
    });
  });

  describe('card library operations', () => {
    it('should save and load card libraries', () => {
      const library: CardLibrary = {
        id: 'test-library',
        name: '测试牌库',
        description: '测试用牌库',
        categories: ['emotion', 'verb'],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      LocalStorageUtil.saveCardLibrary(library);
      const libraries = LocalStorageUtil.loadCardLibraries();
      
      expect(libraries.length).toBe(1);
      expect(libraries[0]).toEqual(library);
    });

    it('should load specific library by id', () => {
      const library1: CardLibrary = {
        id: 'lib-1',
        name: '牌库1',
        description: '',
        categories: [],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const library2: CardLibrary = {
        id: 'lib-2',
        name: '牌库2',
        description: '',
        categories: [],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      LocalStorageUtil.saveCardLibrary(library1);
      LocalStorageUtil.saveCardLibrary(library2);
      
      const loaded = LocalStorageUtil.loadCardLibrary('lib-2');
      expect(loaded).toEqual(library2);
    });

    it('should return undefined when library not found', () => {
      const loaded = LocalStorageUtil.loadCardLibrary('non-existent');
      expect(loaded).toBeUndefined();
    });

    it('should delete library by id', () => {
      const library: CardLibrary = {
        id: 'lib-to-delete',
        name: '要删除的牌库',
        description: '',
        categories: [],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      LocalStorageUtil.saveCardLibrary(library);
      LocalStorageUtil.deleteCardLibrary('lib-to-delete');
      
      const libraries = LocalStorageUtil.loadCardLibraries();
      expect(libraries.length).toBe(0);
    });
  });

  describe('AI config operations', () => {
    it('should save and load AI config', () => {
      const config: AIServiceConfig = {
        provider: 'doubao',
        apiKey: 'test-api-key',
        model: 'doubao-seed-2-0-lite-260215',
        enabled: true,
      };
      
      LocalStorageUtil.saveAIConfig(config);
      const loaded = LocalStorageUtil.loadAIConfig();
      
      expect(loaded).toEqual(config);
    });

    it('should return null when no AI config exists', () => {
      const loaded = LocalStorageUtil.loadAIConfig();
      expect(loaded).toBeNull();
    });

    it('should remove AI config', () => {
      LocalStorageUtil.saveAIConfig({} as any);
      LocalStorageUtil.removeAIConfig();
      
      const loaded = LocalStorageUtil.loadAIConfig();
      expect(loaded).toBeNull();
    });
  });
});
