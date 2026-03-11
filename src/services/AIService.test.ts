import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService, AIService } from './AIService';
import { LocalStorageUtil } from '../utils/storage';

vi.mock('../utils/storage', () => ({
  LocalStorageUtil: {
    loadAIConfig: vi.fn(),
    saveAIConfig: vi.fn(),
    removeAIConfig: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (LocalStorageUtil.loadAIConfig as vi.Mock).mockReturnValue(null);
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: '{"isValid": true, "score": 90, "suggestions": [], "reasons": []}' } }],
      }),
    });
  });

  describe('initialization', () => {
    it('should load config from localStorage on initialization', () => {
      const mockConfig = {
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      };
      (LocalStorageUtil.loadAIConfig as vi.Mock).mockReturnValue(mockConfig);
      
      const service = new AIService();
      
      expect(LocalStorageUtil.loadAIConfig).toHaveBeenCalled();
      expect(service.getConfig()).toEqual(mockConfig);
    });
  });

  describe('config operations', () => {
    it('should save config correctly', () => {
      const service = new AIService();
      const config = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        enabled: true,
      };
      
      service.saveConfig(config);
      
      expect(LocalStorageUtil.saveAIConfig).toHaveBeenCalledWith(config);
      expect(service.getConfig()).toEqual(config);
    });

    it('should clear config correctly', () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        enabled: true,
      });
      
      service.clearConfig();
      
      expect(LocalStorageUtil.removeAIConfig).toHaveBeenCalled();
      expect(service.getConfig()).toBeNull();
    });

    it('should correctly report if service is enabled', () => {
      const service = new AIService();
      
      expect(service.isEnabled()).toBe(false);
      
      service.saveConfig({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        enabled: true,
      });
      expect(service.isEnabled()).toBe(false); // 空API密钥
      
      service.saveConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        enabled: false,
      });
      expect(service.isEnabled()).toBe(false); // 未启用
      
      service.saveConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        enabled: true,
      });
      expect(service.isEnabled()).toBe(true); // 正常配置
    });
  });

  describe('API calls', () => {
    it('should build correct prompt for combination validation', () => {
      const service = new AIService();
      // @ts-expect-error 测试私有方法
      const prompt = service.buildPrompt('吃饭', 'combination');
      
      expect(prompt).toContain('吃饭');
      expect(prompt).toContain('词语或固定搭配');
    });

    it('should build correct prompt for sentence validation', () => {
      const service = new AIService();
      // @ts-expect-error 测试私有方法
      const prompt = service.buildPrompt('我今天吃了好吃的饭', 'sentence');
      
      expect(prompt).toContain('我今天吃了好吃的饭');
      expect(prompt).toContain('现代汉语语法规范');
    });

    it('should handle doubao provider correctly', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'doubao-key',
        model: 'doubao-seed-2-0-lite-260215',
        enabled: true,
      });

      await service.validateSemantics('测试', 'combination');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer doubao-key',
          }),
          body: expect.stringContaining('doubao-seed-2-0-lite-260215'),
        })
      );
    });

    it('should handle openai provider correctly', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        enabled: true,
      });

      await service.validateSemantics('测试', 'combination');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test',
          }),
        })
      );
    });

    it('should handle anthropic provider correctly', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'anthropic',
        apiKey: 'claude-key',
        model: 'claude-3-sonnet',
        enabled: true,
      });

      await service.validateSemantics('测试', 'combination');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'claude-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
    });

    it('should use custom base URL if provided', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo',
        baseUrl: 'https://custom-proxy.com/v1',
        enabled: true,
      });

      await service.validateSemantics('测试', 'combination');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom-proxy.com/v1/chat/completions',
        expect.anything()
      );
    });
  });

  describe('response parsing', () => {
    it('should parse openai response correctly', () => {
      const service = new AIService();
      const mockResponse = {
        choices: [{ message: { content: '{"isValid": true, "score": 90, "suggestions": ["好的组合"], "reasons": []}' } }],
      };

      // @ts-expect-error 测试私有方法
      const result = service.parseResponse(mockResponse, 'combination');
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(90);
      expect(result.suggestions).toEqual(['好的组合']);
    });

    it('should parse anthropic response correctly', () => {
      const service = new AIService();
      const mockResponse = {
        content: [{ text: '{"isValid": false, "score": 50, "suggestions": [], "reasons": ["组合无效"]}' }],
      };

      // @ts-expect-error 测试私有方法
      const result = service.parseResponse(mockResponse, 'combination');
      
      expect(result.isValid).toBe(false);
      expect(result.score).toBe(50);
      expect(result.reasons).toEqual(['组合无效']);
    });

    it('should parse gemini response correctly', () => {
      const service = new AIService();
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                isValid: true,
                score: 85,
                suggestions: [],
                reasons: []
              })
            }]
          }
        }]
      };

      // @ts-expect-error 测试私有方法
      const result = service.parseResponse(mockResponse, 'sentence');
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(85);
    });

    it('should handle invalid JSON response gracefully', () => {
      const service = new AIService();
      const mockResponse = {
        choices: [{ message: { content: 'Invalid JSON' } }],
      };

      expect(() => {
        // @ts-expect-error 测试私有方法
        service.parseResponse(mockResponse, 'combination');
      }).toThrow('响应格式解析失败');
    });
  });

  describe('validation', () => {
    it('should call API when service is enabled', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      });

      const result = await service.validateSemantics('吃饭', 'combination');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result.isValid).toBe(true);
    });

    it('should throw error when API call fails', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      });
      
      (global.fetch as vi.Mock).mockRejectedValue(new Error('API Error'));
      
      await expect(service.validateSemantics('吃饭', 'combination'))
        .rejects.toThrow('API Error');
    });

    it('should handle non-ok response correctly', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      });
      
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: vi.fn().mockResolvedValue('Invalid API key'),
      });
      
      await expect(service.validateSemantics('吃饭', 'combination'))
        .rejects.toThrow('API调用失败: 401 Unauthorized - Invalid API key');
    });
  });

  describe('test connection', () => {
    it('should return success when connection works', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      });

      const result = await service.testConnection();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('连接成功');
    });

    it('should return failure when service not configured', async () => {
      const service = new AIService();
      
      const result = await service.testConnection();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('AI服务未配置');
    });

    it('should return failure when connection fails', async () => {
      const service = new AIService();
      service.saveConfig({
        provider: 'doubao',
        apiKey: 'test-key',
        model: 'doubao-model',
        enabled: true,
      });
      
      (global.fetch as vi.Mock).mockRejectedValue(new Error('Network Error'));
      
      const result = await service.testConnection();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('连接失败');
    });
  });
});
