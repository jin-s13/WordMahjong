import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSemantics, addPunctuation } from './validation';
import aiService from '../services/AIService';

vi.mock('../services/AIService', () => ({
  default: {
    isEnabled: vi.fn(),
    validateSemantics: vi.fn(),
  },
}));

describe('validation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSemantics', () => {
    it('should use AI service when enabled', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(true);
      (aiService.validateSemantics as vi.Mock).mockResolvedValue({
        isValid: true,
        score: 90,
        suggestions: ['AI suggestion'],
        reasons: [],
      });

      const result = await validateSemantics('我吃饭', 'sentence');
      
      expect(aiService.validateSemantics).toHaveBeenCalledWith('我吃饭', 'sentence');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(90);
    });

    it('should fallback to default rules when AI is disabled', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(false);

      // 测试词语组合
      const wordResult = await validateSemantics('吃饭', 'combination');
      expect(wordResult.isValid).toBe(true);
      expect(wordResult.score).toBe(60);
      expect(wordResult.suggestions).toContain('组合长度符合要求，建议配置AI服务验证语义正确性');

      // 测试句子（6个字，应该有效）
      const sentenceResult = await validateSemantics('我今天吃了饭', 'sentence');
      expect(sentenceResult.isValid).toBe(true);
      expect(sentenceResult.score).toBe(60);
      expect(sentenceResult.suggestions).toContain('句子长度符合要求，建议配置AI服务验证语义通顺性');
    });

    it('should return invalid for short combinations when AI is disabled', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(false);

      const result = await validateSemantics('我', 'combination');
      expect(result.isValid).toBe(false);
      expect(result.reasons).toContain('词语长度应为2-3字，当前为1字');
    });

    it('should return invalid for long combinations when AI is disabled', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(false);

      const result = await validateSemantics('我吃饭了', 'combination');
      expect(result.isValid).toBe(false);
      expect(result.reasons).toContain('词语长度应为2-3字，当前为4字');
    });

    it('should return invalid for short sentences when AI is disabled', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(false);

      const result = await validateSemantics('我吃饭', 'sentence');
      expect(result.isValid).toBe(false);
      expect(result.reasons).toContain('句子长度至少应为7字，当前为3字');
    });

    it('should handle AI service errors gracefully', async () => {
      (aiService.isEnabled as vi.Mock).mockReturnValue(true);
      (aiService.validateSemantics as vi.Mock).mockRejectedValue(new Error('API Error'));

      const result = await validateSemantics('我吃饭', 'sentence');
      
      expect(result.isValid).toBe(false); // 3字句子不符合默认规则（需要至少5字）
      expect(result.reasons).toContain('句子长度至少应为5字，当前为3字');
    });
  });

  describe('addPunctuation', () => {
    it('should add question mark for questions ending with 吗', () => {
      expect(addPunctuation('你吃饭了吗')).toBe('你吃饭了吗？');
    });

    it('should add question mark for questions ending with 呢', () => {
      expect(addPunctuation('你在干什么呢')).toBe('你在干什么呢？');
    });

    it('should add exclamation mark for sentences ending with 啊', () => {
      expect(addPunctuation('今天天气真好啊')).toBe('今天天气真好啊！');
    });

    it('should add exclamation mark for sentences ending with 呀', () => {
      expect(addPunctuation('这个游戏真好玩呀')).toBe('这个游戏真好玩呀！');
    });

    it('should add exclamation mark for sentences with 太', () => {
      expect(addPunctuation('今天太开心了')).toBe('今天太开心了！');
    });

    it('should add exclamation mark for sentences with 真', () => {
      expect(addPunctuation('你真厉害')).toBe('你真厉害！');
    });

    it('should add period for regular sentences', () => {
      expect(addPunctuation('我今天吃了好吃的饭')).toBe('我今天吃了好吃的饭。');
      expect(addPunctuation('我们在公园里散步')).toBe('我们在公园里散步。');
    });

    it('should add exclamation mark for sentences starting with 太/真/好', () => {
      expect(addPunctuation('太好吃了')).toBe('太好吃了！');
      expect(addPunctuation('真好玩呀')).toBe('真好玩呀！');
      expect(addPunctuation('好开心啊')).toBe('好开心啊！');
    });

    it('should return empty string if input is empty', () => {
      expect(addPunctuation('')).toBe('');
    });
  });
});
