import type { ValidationResult } from '../types';
import { aiService } from '../services/AIService';

/**
 * 语义验证 - 完全使用LLM进行判断
 * @param content 要验证的内容
 * @param type 验证类型：combination（词语组合）或 sentence（句子）
 */
export async function validateSemantics(content: string, type: 'combination' | 'sentence'): Promise<ValidationResult> {
  // 优先使用配置的LLM服务进行验证
  if (aiService.isEnabled()) {
    try {
      return await aiService.validateSemantics(content, type);
    } catch (error) {
      console.warn('LLM验证失败，使用默认规则:', error);
    }
  }

  // 如果没有配置LLM或调用失败，返回默认验证结果
  // 简单规则：2-3字为有效词语，7字以上为有效句子
  const result: ValidationResult = {
    isValid: false,
    score: 0,
    suggestions: ['请配置AI服务以获得更准确的验证结果'],
    reasons: ['未配置AI验证服务，使用默认规则']
  };

  if (type === 'combination') {
    result.isValid = content.length >= 2 && content.length <= 3;
    result.score = result.isValid ? 60 : 0;
    if (result.isValid) {
      result.suggestions = ['组合长度符合要求，建议配置AI服务验证语义正确性'];
    } else {
      result.reasons = [`词语长度应为2-3字，当前为${content.length}字`];
    }
  } else if (type === 'sentence') {
    result.isValid = content.length >= 5;
    result.score = result.isValid ? 60 : 0;
    if (result.isValid) {
      result.suggestions = ['句子长度符合要求，建议配置AI服务验证语义通顺性'];
    } else {
      result.reasons = [`句子长度至少应为5字，当前为${content.length}字`];
    }
  }

  return result;
}

/**
 * 自动添加标点符号
 * @param sentence 句子内容
 */
export function addPunctuation(sentence: string): string {
  if (!sentence) return sentence;
  
  // 简单的标点添加规则
  if (sentence.endsWith('吗') || sentence.endsWith('呢') || sentence.endsWith('吧') || sentence.endsWith('？') || sentence.includes('什么') || sentence.includes('怎么') || sentence.includes('为什么')) {
    return sentence + '？';
  } else if (sentence.endsWith('啊') || sentence.endsWith('呀') || sentence.endsWith('哦') || sentence.endsWith('！')) {
    return sentence + '！';
  } else if (sentence.startsWith('太') || sentence.startsWith('真') || sentence.startsWith('好')) {
    // 只有"太/真/好"在句首时才作为感叹句
    return sentence + '！';
  } else {
    return sentence + '。';
  }
}


