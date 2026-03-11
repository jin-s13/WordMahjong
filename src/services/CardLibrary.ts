import type { Card, CardLibrary } from '../types';
import { LocalStorageUtil } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

// 生成UUID
function generateId(): string {
  return uuidv4();
}

// 默认牌库数据
const defaultCardData: Omit<Card, 'id'>[] = [
  // 情感核心字（10张）
  { char: '我', category: 'emotion', pinyin: 'wǒ', frequency: 5 },
  { char: '我', category: 'emotion', pinyin: 'wǒ', frequency: 5 },
  { char: '你', category: 'emotion', pinyin: 'nǐ', frequency: 5 },
  { char: '你', category: 'emotion', pinyin: 'nǐ', frequency: 5 },
  { char: '爱', category: 'emotion', pinyin: 'ài', frequency: 4 },
  { char: '爱', category: 'emotion', pinyin: 'ài', frequency: 4 },
  { char: '家', category: 'emotion', pinyin: 'jiā', frequency: 4 },
  { char: '家', category: 'emotion', pinyin: 'jiā', frequency: 4 },
  { char: '心', category: 'emotion', pinyin: 'xīn', frequency: 4 },
  { char: '心', category: 'emotion', pinyin: 'xīn', frequency: 4 },

  // 高频动词（28张）
  { char: '吃', category: 'verb', pinyin: 'chī', frequency: 5 },
  { char: '吃', category: 'verb', pinyin: 'chī', frequency: 5 },
  { char: '说', category: 'verb', pinyin: 'shuō', frequency: 5 },
  { char: '说', category: 'verb', pinyin: 'shuō', frequency: 5 },
  { char: '想', category: 'verb', pinyin: 'xiǎng', frequency: 5 },
  { char: '想', category: 'verb', pinyin: 'xiǎng', frequency: 5 },
  { char: '看', category: 'verb', pinyin: 'kàn', frequency: 4 },
  { char: '听', category: 'verb', pinyin: 'tīng', frequency: 4 },
  { char: '走', category: 'verb', pinyin: 'zǒu', frequency: 4 },
  { char: '跑', category: 'verb', pinyin: 'pǎo', frequency: 4 },
  { char: '跳', category: 'verb', pinyin: 'tiào', frequency: 4 },
  { char: '飞', category: 'verb', pinyin: 'fēi', frequency: 4 },
  { char: '游', category: 'verb', pinyin: 'yóu', frequency: 4 },
  { char: '唱', category: 'verb', pinyin: 'chàng', frequency: 3 },
  { char: '跳', category: 'verb', pinyin: 'tiào', frequency: 3 },
  { char: '学', category: 'verb', pinyin: 'xué', frequency: 4 },
  { char: '工', category: 'verb', pinyin: 'gōng', frequency: 3 },
  { char: '思', category: 'verb', pinyin: 'sī', frequency: 3 },
  { char: '创', category: 'verb', pinyin: 'chuàng', frequency: 3 },
  { char: '想', category: 'verb', pinyin: 'xiǎng', frequency: 3 },
  { char: '做', category: 'verb', pinyin: 'zuò', frequency: 4 },
  { char: '打', category: 'verb', pinyin: 'dǎ', frequency: 4 },
  { char: '开', category: 'verb', pinyin: 'kāi', frequency: 4 },
  { char: '关', category: 'verb', pinyin: 'guān', frequency: 4 },
  { char: '拿', category: 'verb', pinyin: 'ná', frequency: 3 },
  { char: '放', category: 'verb', pinyin: 'fàng', frequency: 3 },
  { char: '买', category: 'verb', pinyin: 'mǎi', frequency: 3 },
  { char: '卖', category: 'verb', pinyin: 'mài', frequency: 3 },

  // 日常名词（40张）
  { char: '饭', category: 'noun', pinyin: 'fàn', frequency: 5 },
  { char: '菜', category: 'noun', pinyin: 'cài', frequency: 4 },
  { char: '肉', category: 'noun', pinyin: 'ròu', frequency: 4 },
  { char: '鱼', category: 'noun', pinyin: 'yú', frequency: 4 },
  { char: '蛋', category: 'noun', pinyin: 'dàn', frequency: 4 },
  { char: '米', category: 'noun', pinyin: 'mǐ', frequency: 4 },
  { char: '面', category: 'noun', pinyin: 'miàn', frequency: 4 },
  { char: '包', category: 'noun', pinyin: 'bāo', frequency: 3 },
  { char: '饺', category: 'noun', pinyin: 'jiǎo', frequency: 3 },
  { char: '汤', category: 'noun', pinyin: 'tāng', frequency: 3 },
  { char: '水', category: 'noun', pinyin: 'shuǐ', frequency: 5 },
  { char: '茶', category: 'noun', pinyin: 'chá', frequency: 4 },
  { char: '酒', category: 'noun', pinyin: 'jiǔ', frequency: 3 },
  { char: '牛', category: 'noun', pinyin: 'niú', frequency: 3 },
  { char: '咖', category: 'noun', pinyin: 'kā', frequency: 3 },
  { char: '桌', category: 'noun', pinyin: 'zhuō', frequency: 3 },
  { char: '椅', category: 'noun', pinyin: 'yǐ', frequency: 3 },
  { char: '窗', category: 'noun', pinyin: 'chuāng', frequency: 3 },
  { char: '门', category: 'noun', pinyin: 'mén', frequency: 4 },
  { char: '床', category: 'noun', pinyin: 'chuáng', frequency: 3 },
  { char: '灯', category: 'noun', pinyin: 'dēng', frequency: 3 },
  { char: '书', category: 'noun', pinyin: 'shū', frequency: 4 },
  { char: '笔', category: 'noun', pinyin: 'bǐ', frequency: 3 },
  { char: '纸', category: 'noun', pinyin: 'zhǐ', frequency: 3 },
  { char: '钱', category: 'noun', pinyin: 'qián', frequency: 4 },
  { char: '包', category: 'noun', pinyin: 'bāo', frequency: 3 },
  { char: '衣', category: 'noun', pinyin: 'yī', frequency: 3 },
  { char: '鞋', category: 'noun', pinyin: 'xié', frequency: 3 },
  { char: '猫', category: 'noun', pinyin: 'māo', frequency: 3 },
  { char: '狗', category: 'noun', pinyin: 'gǒu', frequency: 3 },
  { char: '花', category: 'noun', pinyin: 'huā', frequency: 3 },
  { char: '草', category: 'noun', pinyin: 'cǎo', frequency: 3 },
  { char: '树', category: 'noun', pinyin: 'shù', frequency: 3 },
  { char: '山', category: 'noun', pinyin: 'shān', frequency: 3 },
  { char: '海', category: 'noun', pinyin: 'hǎi', frequency: 3 },
  { char: '天', category: 'noun', pinyin: 'tiān', frequency: 4 },
  { char: '日', category: 'noun', pinyin: 'rì', frequency: 3 },
  { char: '月', category: 'noun', pinyin: 'yuè', frequency: 3 },
  { char: '风', category: 'noun', pinyin: 'fēng', frequency: 3 },
  { char: '云', category: 'noun', pinyin: 'yún', frequency: 3 },

  // 形容词（20张）
  { char: '好', category: 'adjective', pinyin: 'hǎo', frequency: 5 },
  { char: '美', category: 'adjective', pinyin: 'měi', frequency: 4 },
  { char: '香', category: 'adjective', pinyin: 'xiāng', frequency: 4 },
  { char: '甜', category: 'adjective', pinyin: 'tián', frequency: 4 },
  { char: '快', category: 'adjective', pinyin: 'kuài', frequency: 4 },
  { char: '慢', category: 'adjective', pinyin: 'màn', frequency: 3 },
  { char: '大', category: 'adjective', pinyin: 'dà', frequency: 4 },
  { char: '小', category: 'adjective', pinyin: 'xiǎo', frequency: 4 },
  { char: '多', category: 'adjective', pinyin: 'duō', frequency: 4 },
  { char: '少', category: 'adjective', pinyin: 'shǎo', frequency: 3 },
  { char: '新', category: 'adjective', pinyin: 'xīn', frequency: 3 },
  { char: '旧', category: 'adjective', pinyin: 'jiù', frequency: 3 },
  { char: '暖', category: 'adjective', pinyin: 'nuǎn', frequency: 3 },
  { char: '冷', category: 'adjective', pinyin: 'lěng', frequency: 3 },
  { char: '喜', category: 'adjective', pinyin: 'xǐ', frequency: 3 },
  { char: '乐', category: 'adjective', pinyin: 'lè', frequency: 3 },
  { char: '安', category: 'adjective', pinyin: 'ān', frequency: 3 },
  { char: '康', category: 'adjective', pinyin: 'kāng', frequency: 3 },
  { char: '顺', category: 'adjective', pinyin: 'shùn', frequency: 3 },
  { char: '旺', category: 'adjective', pinyin: 'wàng', frequency: 3 },

  // 副词+虚词+语气词（19张）
  { char: '的', category: 'adverb', pinyin: 'de', frequency: 5 },
  { char: '的', category: 'adverb', pinyin: 'de', frequency: 5 },
  { char: '了', category: 'adverb', pinyin: 'le', frequency: 5 },
  { char: '了', category: 'adverb', pinyin: 'le', frequency: 5 },
  { char: '就', category: 'adverb', pinyin: 'jiù', frequency: 4 },
  { char: '就', category: 'adverb', pinyin: 'jiù', frequency: 4 },
  { char: '也', category: 'adverb', pinyin: 'yě', frequency: 4 },
  { char: '也', category: 'adverb', pinyin: 'yě', frequency: 4 },
  { char: '很', category: 'adverb', pinyin: 'hěn', frequency: 4 },
  { char: '太', category: 'adverb', pinyin: 'tài', frequency: 4 },
  { char: '真', category: 'adverb', pinyin: 'zhēn', frequency: 4 },
  { char: '都', category: 'adverb', pinyin: 'dōu', frequency: 4 },
  { char: '只', category: 'adverb', pinyin: 'zhǐ', frequency: 3 },
  { char: '还', category: 'adverb', pinyin: 'hái', frequency: 3 },
  { char: '啊', category: 'adverb', pinyin: 'a', frequency: 3 },
  { char: '呀', category: 'adverb', pinyin: 'ya', frequency: 3 },
  { char: '吧', category: 'adverb', pinyin: 'ba', frequency: 3 },
  { char: '吗', category: 'adverb', pinyin: 'ma', frequency: 3 },
  { char: '呢', category: 'adverb', pinyin: 'ne', frequency: 3 },

  // 场景/方位字（19张）
  { char: '家', category: 'scene', pinyin: 'jiā', frequency: 4 },
  { char: '校', category: 'scene', pinyin: 'xiào', frequency: 3 },
  { char: '店', category: 'scene', pinyin: 'diàn', frequency: 3 },
  { char: '园', category: 'scene', pinyin: 'yuán', frequency: 3 },
  { char: '厨', category: 'scene', pinyin: 'chú', frequency: 3 },
  { char: '厅', category: 'scene', pinyin: 'tīng', frequency: 3 },
  { char: '房', category: 'scene', pinyin: 'fáng', frequency: 3 },
  { char: '里', category: 'scene', pinyin: 'lǐ', frequency: 4 },
  { char: '外', category: 'scene', pinyin: 'wài', frequency: 4 },
  { char: '上', category: 'scene', pinyin: 'shàng', frequency: 4 },
  { char: '下', category: 'scene', pinyin: 'xià', frequency: 4 },
  { char: '左', category: 'scene', pinyin: 'zuǒ', frequency: 3 },
  { char: '右', category: 'scene', pinyin: 'yòu', frequency: 3 },
  { char: '前', category: 'scene', pinyin: 'qián', frequency: 3 },
  { char: '后', category: 'scene', pinyin: 'hòu', frequency: 3 },
  { char: '东', category: 'scene', pinyin: 'dōng', frequency: 3 },
  { char: '南', category: 'scene', pinyin: 'nán', frequency: 3 },
  { char: '西', category: 'scene', pinyin: 'xī', frequency: 3 },
  { char: '北', category: 'scene', pinyin: 'běi', frequency: 3 },

  // 补充融合字（8张）
  { char: '一', category: 'supplement', pinyin: 'yī', frequency: 5 },
  { char: '一', category: 'supplement', pinyin: 'yī', frequency: 5 },
  { char: '二', category: 'supplement', pinyin: 'èr', frequency: 4 },
  { char: '三', category: 'supplement', pinyin: 'sān', frequency: 4 },
  { char: '不', category: 'supplement', pinyin: 'bù', frequency: 5 },
  { char: '不', category: 'supplement', pinyin: 'bù', frequency: 5 },
  { char: '是', category: 'supplement', pinyin: 'shì', frequency: 5 },
  { char: '是', category: 'supplement', pinyin: 'shì', frequency: 5 },
];

export class CardLibraryService {
  // 获取默认牌库
  static getDefaultLibrary(): Card[] {
    return defaultCardData.map(card => ({
      ...card,
      id: generateId(),
      // 生成牌面图片URL
      imageUrl: `/assets/cards/${encodeURIComponent(card.char)}.svg`
    }));
  }

  // 初始化默认牌库到本地存储
  static initializeDefaultLibrary(): void {
    const existing = LocalStorageUtil.loadCardLibrary('default');
    if (!existing) {
      const defaultLibrary: CardLibrary = {
        id: 'default',
        name: '默认牌库',
        description: '系统默认提供的汉字牌库，包含144张常用汉字',
        categories: ['emotion', 'verb', 'noun', 'adjective', 'adverb', 'scene', 'supplement'],
        cards: this.getDefaultLibrary(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      LocalStorageUtil.saveCardLibrary(defaultLibrary);
    }
  }

  // 获取所有牌库
  static getAllLibraries(): CardLibrary[] {
    return LocalStorageUtil.loadCardLibraries();
  }

  // 获取牌库
  static getLibrary(id: string): CardLibrary | undefined {
    return LocalStorageUtil.loadCardLibrary(id);
  }

  // 保存牌库
  static saveLibrary(library: CardLibrary): void {
    library.updatedAt = Date.now();
    LocalStorageUtil.saveCardLibrary(library);
  }

  // 创建新牌库
  static createLibrary(name: string, description: string = ''): CardLibrary {
    const library: CardLibrary = {
      id: generateId(),
      name,
      description,
      categories: ['emotion', 'verb', 'noun', 'adjective', 'adverb', 'scene', 'supplement'],
      cards: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    LocalStorageUtil.saveCardLibrary(library);
    return library;
  }

  // 删除牌库
  static deleteLibrary(id: string): void {
    if (id === 'default') {
      throw new Error('默认牌库不能删除');
    }
    LocalStorageUtil.deleteCardLibrary(id);
  }

  // 复制牌库
  static copyLibrary(sourceId: string, newName: string): CardLibrary {
    const source = this.getLibrary(sourceId);
    if (!source) {
      throw new Error('源牌库不存在');
    }

    const newLibrary: CardLibrary = {
      ...source,
      id: generateId(),
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: source.cards.map(card => ({ ...card, id: generateId() }))
    };

    LocalStorageUtil.saveCardLibrary(newLibrary);
    return newLibrary;
  }

  // 导出牌库
  static exportLibrary(id: string): string {
    const library = this.getLibrary(id);
    if (!library) {
      throw new Error('牌库不存在');
    }
    return JSON.stringify(library, null, 2);
  }

  // 导入牌库
  static importLibrary(jsonData: string): CardLibrary {
    try {
      const library = JSON.parse(jsonData) as CardLibrary;
      
      // 验证格式
      if (!library.name || !Array.isArray(library.cards)) {
        throw new Error('无效的牌库格式');
      }

      // 生成新ID
      library.id = generateId();
      library.createdAt = Date.now();
      library.updatedAt = Date.now();
      library.cards = library.cards.map(card => ({ ...card, id: generateId() }));

      LocalStorageUtil.saveCardLibrary(library);
      return library;
    } catch (e) {
      throw new Error('导入失败：无效的JSON格式');
    }
  }

  // 洗牌算法
  static shuffle(cards: Card[]): Card[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 发牌算法
  static dealCards(deck: Card[], playerCount: number): { players: Card[][], wall: Card[] } {
    const wall = [...deck];
    const players: Card[][] = Array.from({ length: playerCount }, () => []);
    
    // 每人连续摸3轮，每轮4张牌
    for (let round = 0; round < 3; round++) {
      for (let p = 0; p < playerCount; p++) {
        for (let i = 0; i < 4; i++) {
          if (wall.length > 0) {
            players[p].push(wall.pop()!);
          }
        }
      }
    }
    
    // 庄家跳牌摸2张，其余玩家各补摸1张
    players[0].push(wall.pop()!);
    players[0].push(wall.pop()!);
    for (let p = 1; p < playerCount; p++) {
      if (wall.length > 0) {
        players[p].push(wall.pop()!);
      }
    }
    
    return { players, wall };
  }
}

// 初始化默认牌库
CardLibraryService.initializeDefaultLibrary();

export default CardLibraryService;
