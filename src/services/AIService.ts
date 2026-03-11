import type { ValidationResult } from '../types';

class AIService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    // 从环境变量读取配置
    this.apiKey = import.meta.env.VITE_DOUBao_API_KEY || '';
    this.model = import.meta.env.VITE_DOUBao_MODEL || 'doubao-seed-2-0-lite-260215';
    this.baseUrl = import.meta.env.VITE_DOUBao_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    this.enabled = !!this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getConfig() {
    return {
      provider: 'doubao' as const,
      apiKey: this.apiKey,
      model: this.model,
      baseUrl: this.baseUrl,
      enabled: this.enabled,
    };
  }

  async validateSemantics(content: string, type: 'combination' | 'sentence', userExplanation?: string): Promise<ValidationResult> {
    if (!this.isEnabled()) {
      // 回退到本地验证
      return this.localValidateSemantics(content, type);
    }

    try {
      const prompt = this.buildPrompt(content, type, userExplanation);
      const response = await this.callAPI(prompt);
      return this.parseResponse(response);
    } catch (e) {
      console.error('AI服务调用失败，回退到本地验证:', e);
      return this.localValidateSemantics(content, type);
    }
  }

  // 本地验证规则
  private localValidateSemantics(content: string, type: 'combination' | 'sentence'): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      score: 0,
      suggestions: ['AI服务未配置，使用默认规则验证'],
      reasons: ['API密钥未配置']
    };

    if (type === 'combination') {
      result.isValid = content.length >= 2 && content.length <= 3;
      result.score = result.isValid ? 60 : 0;
      if (result.isValid) {
        result.suggestions = ['组合长度符合要求'];
      } else {
        result.reasons = [`词语长度应为2-3字，当前为${content.length}字`];
      }
    } else if (type === 'sentence') {
      result.isValid = content.length >= 5;
      result.score = result.isValid ? 60 : 0;
      if (result.isValid) {
        result.suggestions = ['句子长度符合要求'];
      } else {
        result.reasons = [`句子长度至少应为5字，当前为${content.length}字`];
      }
    }

    // 强制校验：评分不足60分时，isValid必须为false
    if (result.score < 60) {
      result.isValid = false;
      if (!result.reasons.some(r => r.includes('评分不足'))) {
        result.reasons.push(`语义评分不足60分（当前${result.score}分）`);
      }
    }

    return result;
  }

  // 构建提示词
  private buildPrompt(content: string, type: 'combination' | 'sentence', userExplanation?: string): string {
    if (type === 'combination') {
      return `请判断以下汉字组合是否是符合现代汉语规范的词语或固定搭配："${content}"
请宽松判断，只要是大众常用、可以理解的词组就算有效，包括网络用语、口语化表达。
${userExplanation ? `用户补充说明：${userExplanation}\n请结合用户的解释进行判断。` : ''}
请严格按照以下JSON格式返回结果，不要添加任何额外内容：
{
  "isValid": true/false,
  "score": 0-100的整数分数,
  "suggestions": ["改进建议1", "改进建议2"],
  "reasons": ["失败原因1", "失败原因2"]
}
要求：
1. isValid: 布尔值，表示是否是合法的词语
2. score: 0-100的整数，分数越高表示越常用
3. suggestions: 字符串数组，提供改进建议
4. reasons: 字符串数组，如果不合法，说明原因

注意：返回的必须是严格的JSON格式，不要有任何其他文本、注释或markdown格式。`;
    } else {
      return `请判断以下句子是否符合现代汉语语法规范，语义是否完整通顺："${content}"
请宽松判断，允许口语化表达、短句、网络用语，只要语义可以理解、符合日常表达习惯就算有效。
${userExplanation ? `用户补充说明：${userExplanation}\n请结合用户的解释进行判断。` : ''}
请严格按照以下JSON格式返回结果，不要添加任何额外内容：
{
  "isValid": true/false,
  "score": 0-100的整数分数,
  "suggestions": ["改进建议1", "改进建议2"],
  "reasons": ["失败原因1", "失败原因2"]
}
要求：
1. isValid: 布尔值，表示是否是合法通顺的句子
2. score: 0-100的整数，分数越高表示句子越通顺合理
3. suggestions: 字符串数组，提供改进建议
4. reasons: 字符串数组，如果不合法，说明原因

注意：返回的必须是严格的JSON格式，不要有任何其他文本、注释或markdown格式。`;
    }
  }

  // 调用API
  private async callAPI(prompt: string): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const body = {
      model: this.model,
      reasoning_effort: 'minimal',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  // 解析响应
  private parseResponse(response: any): ValidationResult {
    // 解析豆包responses接口的响应格式
    let content = '';
    
    if (response.choices && response.choices[0]?.message?.content) {
      // OpenAI兼容格式
      content = response.choices[0].message.content;
    } else if (response.output && response.output.choices && response.output.choices[0]?.message?.content) {
      // 旧格式
      content = response.output.choices[0].message.content;
    } else {
      throw new Error('响应格式错误');
    }

    // 尝试提取JSON内容
    try {
      // 移除可能的markdown格式
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        // 强制校验：评分不足60分时，isValid必须为false
        if (result.score < 60) {
          result.isValid = false;
          if (!result.reasons || !Array.isArray(result.reasons)) {
            result.reasons = [];
          }
          // 添加分数不足的原因
          if (!result.reasons.some((r: string) => r.includes('评分不足'))) {
            result.reasons.push(`语义评分不足60分（当前${result.score}分）`);
          }
        }
        return result;
      }
      return JSON.parse(content);
    } catch (e) {
      console.error('JSON解析失败，原始响应:', content);
      throw new Error('响应解析失败');
    }
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.validateSemantics('测试', 'combination');
      return {
        success: true,
        message: '连接成功，验证功能正常',
      };
    } catch (e) {
      return {
        success: false,
        message: (e as Error).message,
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
