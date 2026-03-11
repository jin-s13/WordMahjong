import { describe, it, expect, beforeEach, vi } from 'vitest';
import CardLibraryService from './CardLibrary';
import { LocalStorageUtil } from '../utils/storage';
import type { Card } from '../types';

vi.mock('../utils/storage', () => ({
  LocalStorageUtil: {
    loadCardLibrary: vi.fn(),
    saveCardLibrary: vi.fn(),
    loadCardLibraries: vi.fn(),
    deleteCardLibrary: vi.fn(),
  },
}));

describe('CardLibraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue(undefined);
    (LocalStorageUtil.loadCardLibraries as vi.Mock).mockReturnValue([]);
  });

  describe('initialization', () => {
    it('should initialize default library if not exists', () => {
      CardLibraryService.initializeDefaultLibrary();
      
      expect(LocalStorageUtil.saveCardLibrary).toHaveBeenCalled();
      const savedLibrary = (LocalStorageUtil.saveCardLibrary as vi.Mock).calls[0][0];
      expect(savedLibrary.id).toBe('default');
      expect(savedLibrary.name).toBe('默认牌库');
      expect(savedLibrary.cards.length).toBe(144); // 144张牌
    });

    it('should not initialize default library if already exists', () => {
      (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue({ id: 'default' });
      
      CardLibraryService.initializeDefaultLibrary();
      
      expect(LocalStorageUtil.saveCardLibrary).not.toHaveBeenCalled();
    });
  });

  describe('card generation', () => {
    it('should generate default library with correct structure', () => {
      const library = CardLibraryService.getDefaultLibrary();
      
      expect(library.length).toBe(144);
      expect(library[0]).toHaveProperty('id');
      expect(library[0]).toHaveProperty('char');
      expect(library[0]).toHaveProperty('category');
      expect(library[0]).toHaveProperty('pinyin');
      expect(library[0]).toHaveProperty('frequency');
      expect(library[0]).toHaveProperty('imageUrl');
      expect(library[0].imageUrl).toMatch(/^\/assets\/cards\/.*\.svg$/);
    });

    it('should have unique IDs for all cards', () => {
      const library = CardLibraryService.getDefaultLibrary();
      const ids = library.map(card => card.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(144);
    });
  });

  describe('library operations', () => {
    it('should get all libraries', () => {
      const mockLibraries = [{ id: 'lib1' }, { id: 'lib2' }];
      (LocalStorageUtil.loadCardLibraries as vi.Mock).mockReturnValue(mockLibraries);
      
      const result = CardLibraryService.getAllLibraries();
      
      expect(result).toEqual(mockLibraries);
      expect(LocalStorageUtil.loadCardLibraries).toHaveBeenCalled();
    });

    it('should get library by id', () => {
      const mockLibrary = { id: 'lib1', name: 'Test Library' };
      (LocalStorageUtil.loadCardLibraries as vi.Mock).mockReturnValue([mockLibrary]);
      
      const result = CardLibraryService.getLibrary('lib1');
      
      expect(result).toEqual(mockLibrary);
    });

    it('should return undefined when library not found', () => {
      (LocalStorageUtil.loadCardLibraries as vi.Mock).mockReturnValue([{ id: 'lib1' }]);
      
      const result = CardLibraryService.getLibrary('non-existent');
      
      expect(result).toBeUndefined();
    });

    it('should save library', () => {
      const library = {
        id: 'test-lib',
        name: 'Test Library',
        description: '',
        categories: [],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const originalUpdatedAt = library.updatedAt;
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now + 1000); // 模拟时间流逝1秒
      CardLibraryService.saveLibrary(library);
      
      expect(LocalStorageUtil.saveCardLibrary).toHaveBeenCalledWith(library);
      expect(library.updatedAt).toBe(now + 1000);
      vi.useRealTimers();
    });

    it('should create new library', () => {
      const newLibrary = CardLibraryService.createLibrary('New Library', 'Test Description');
      
      expect(newLibrary.id).toBeDefined();
      expect(newLibrary.name).toBe('New Library');
      expect(newLibrary.description).toBe('Test Description');
      expect(newLibrary.cards).toEqual([]);
      expect(LocalStorageUtil.saveCardLibrary).toHaveBeenCalledWith(newLibrary);
    });

    it('should delete library', () => {
      CardLibraryService.deleteLibrary('lib-to-delete');
      
      expect(LocalStorageUtil.deleteCardLibrary).toHaveBeenCalledWith('lib-to-delete');
    });

    it('should throw error when deleting default library', () => {
      expect(() => {
        CardLibraryService.deleteLibrary('default');
      }).toThrow(/默认牌库不能删除/);
    });

    it('should copy library', () => {
      const sourceLibrary = {
        id: 'source-lib',
        name: 'Source Library',
        description: 'Source Description',
        categories: ['emotion', 'verb'],
        cards: [{ id: 'card1', char: '我', category: 'emotion', pinyin: 'wǒ', frequency: 5 } as Card],
        createdAt: 1000,
        updatedAt: 2000,
      };
      
      (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue(sourceLibrary);
      
      const copiedLibrary = CardLibraryService.copyLibrary('source-lib', 'Copied Library');
      
      expect(copiedLibrary.id).not.toBe('source-lib');
      expect(copiedLibrary.name).toBe('Copied Library');
      expect(copiedLibrary.description).toBe('Source Description');
      expect(copiedLibrary.categories).toEqual(['emotion', 'verb']);
      expect(copiedLibrary.cards.length).toBe(1);
      expect(copiedLibrary.cards[0].id).not.toBe('card1'); // 新的ID
      expect(copiedLibrary.cards[0].char).toBe('我');
      expect(copiedLibrary.createdAt).toBeGreaterThan(1000);
      expect(LocalStorageUtil.saveCardLibrary).toHaveBeenCalledWith(copiedLibrary);
    });

    it('should throw error when copying non-existent library', () => {
      (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue(undefined);
      
      expect(() => {
        CardLibraryService.copyLibrary('non-existent', 'Copy');
      }).toThrow(/源牌库不存在/);
    });
  });

  describe('game logic functions', () => {
    it('should shuffle cards correctly', () => {
      const cards = Array.from({ length: 10 }, (_, i) => ({
        id: `card-${i}`,
        char: String(i),
        category: 'noun',
        pinyin: String(i),
        frequency: 1,
      } as Card));
      
      const shuffled = CardLibraryService.shuffle(cards);
      
      expect(shuffled.length).toBe(10);
      expect(shuffled.map(c => c.id)).not.toEqual(cards.map(c => c.id)); // 基本不可能完全相同
      expect(shuffled.map(c => c.id).sort()).toEqual(cards.map(c => c.id).sort()); // 所有牌都在
    });

    it('should deal cards correctly for 2 players', () => {
      const deck = Array.from({ length: 144 }, (_, i) => ({
        id: `card-${i}`,
        char: String(i),
        category: 'noun',
        pinyin: String(i),
        frequency: 1,
      } as Card));
      
      const { players, wall } = CardLibraryService.dealCards(deck, 2);
      
      expect(players.length).toBe(2);
      expect(players[0].length).toBe(14); // 庄家14张
      expect(players[1].length).toBe(13); // 闲家13张
      expect(wall.length).toBe(144 - 14 - 13);
    });

    it('should deal cards correctly for 4 players', () => {
      const deck = Array.from({ length: 144 }, (_, i) => ({
        id: `card-${i}`,
        char: String(i),
        category: 'noun',
        pinyin: String(i),
        frequency: 1,
      } as Card));
      
      const { players, wall } = CardLibraryService.dealCards(deck, 4);
      
      expect(players.length).toBe(4);
      expect(players[0].length).toBe(14); // 庄家14张
      expect(players[1].length).toBe(13); // 闲家13张
      expect(players[2].length).toBe(13);
      expect(players[3].length).toBe(13);
      expect(wall.length).toBe(144 - 14 - 13 - 13 - 13);
    });
  });

  describe('import/export', () => {
    it('should export library correctly', () => {
      const mockLibrary = {
        id: 'export-lib',
        name: 'Export Library',
        description: 'Export Description',
        categories: [],
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue(mockLibrary);
      
      const exported = CardLibraryService.exportLibrary('export-lib');
      const parsed = JSON.parse(exported);
      
      expect(parsed.id).toBe('export-lib');
      expect(parsed.name).toBe('Export Library');
    });

    it('should throw error when exporting non-existent library', () => {
      (LocalStorageUtil.loadCardLibrary as vi.Mock).mockReturnValue(undefined);
      
      expect(() => {
        CardLibraryService.exportLibrary('non-existent');
      }).toThrow(/牌库不存在/);
    });

    it('should import library correctly', () => {
      const importData = JSON.stringify({
        name: 'Imported Library',
        description: 'Imported Description',
        categories: ['emotion', 'verb'],
        cards: [
          { char: '我', category: 'emotion', pinyin: 'wǒ', frequency: 5 },
          { char: '你', category: 'emotion', pinyin: 'nǐ', frequency: 5 },
        ],
      });
      
      const imported = CardLibraryService.importLibrary(importData);
      
      expect(imported.id).toBeDefined();
      expect(imported.name).toBe('Imported Library');
      expect(imported.cards.length).toBe(2);
      expect(imported.cards[0].id).toBeDefined(); // 新的ID
      expect(imported.cards[0].char).toBe('我');
      expect(LocalStorageUtil.saveCardLibrary).toHaveBeenCalledWith(imported);
    });

    it('should throw error when importing invalid data', () => {
      expect(() => {
        CardLibraryService.importLibrary('invalid json');
      }).toThrow(/导入失败：无效的JSON格式/);
      
      expect(() => {
        CardLibraryService.importLibrary(JSON.stringify({ invalid: 'data' }));
      }).toThrow(/无效的牌库格式/);
    });
  });
});
