import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import type { ValidationResult, Card } from '../types';

interface CombinationJudgeDialogProps {
  isOpen: boolean;
  combination: Card[];
  onClose: () => void;
  onConfirm: (result: ValidationResult) => void;
  validateFunction: (combination: Card[], userExplanation?: string) => Promise<ValidationResult>;
}

const CombinationJudgeDialog: React.FC<CombinationJudgeDialogProps> = ({
  isOpen,
  combination,
  onClose,
  onConfirm,
  validateFunction
}) => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealExplanation, setAppealExplanation] = useState('');
  const [isAppealing, setIsAppealing] = useState(false);

  const combinationText = combination.map(c => c.char).join('');

  useEffect(() => {
    if (isOpen && combination.length > 0) {
      validateCombination();
    }
  }, [isOpen, combination]);

  const validateCombination = async (userExplanation?: string) => {
    setStatus('validating');
    setValidationResult(null);
    
    try {
      const result = await validateFunction(combination, userExplanation);
      setValidationResult(result);
      setStatus(result.isValid ? 'success' : 'error');
      setIsAppealing(false);
      setShowAppeal(false);
    } catch (error) {
      setStatus('error');
      setValidationResult({
        isValid: false,
        score: 0,
        suggestions: ['验证过程出现错误，请重试'],
        reasons: ['服务器错误或网络问题']
      });
      setIsAppealing(false);
    }
  };

  // 处理申诉
  const handleAppeal = async () => {
    if (!appealExplanation.trim()) {
      return;
    }
    setIsAppealing(true);
    await validateCombination(appealExplanation);
  };

  const handleConfirm = () => {
    if (validationResult) {
      onConfirm(validationResult);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className={`px-6 py-4 flex items-center justify-between border-b flex-shrink-0 ${
          status === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
          status === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
          'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {status === 'validating' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
            {status === 'success' && <Check className="w-6 h-6 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
            <h2 className="text-xl font-bold">
              {status === 'validating' ? 'AI裁判审核中...' :
               status === 'success' ? '🎉 组合有效！' :
               '❌ 组合无效'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* 组合展示 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">您的组合：</h3>
            <div className="flex gap-2 justify-center">
              {combination.map((card, index) => (
                <div
                  key={card.id}
                  className="w-16 h-20 bg-white rounded-lg border-2 border-amber-300 shadow-md flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-gray-800">{card.char}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-3 text-xl font-serif text-gray-900">
              "{combinationText}"
            </p>
          </div>

          {/* 验证中状态 */}
          {status === 'validating' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">AI裁判正在验证词语有效性...</p>
              <p className="text-sm text-gray-500 mt-2">正在检查是否为常用词语或固定搭配</p>
            </div>
          )}

          {/* 验证结果 */}
          {validationResult && (
            <div className="space-y-4">
              {/* 评分 */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">组合评分：</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        validationResult.score >= 80 ? 'bg-green-500' :
                        validationResult.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(validationResult.score, 100)}%` }}
                    />
                  </div>
                  <span className={`font-bold text-lg ${
                    validationResult.score >= 80 ? 'text-green-600' :
                    validationResult.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {validationResult.score}/100
                  </span>
                </div>
              </div>

              {/* 失败原因 */}
              {validationResult.reasons.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    不通过原因：
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 rounded-lg p-3">
                    {validationResult.reasons.map((reason, index) => (
                      <li key={index} className="text-sm">{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 改进建议 */}
              {validationResult.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-2">
                    <Sparkles size={16} />
                    改进建议：
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 bg-blue-50 rounded-lg p-3">
                    {validationResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              取消
            </button>
            {status === 'success' && (
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check size={18} />
                确认吃牌
              </button>
            )}
            {status === 'error' && (
              <>
                <button
                  onClick={() => validateCombination()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  重新验证
                </button>
                <button
                  onClick={() => setShowAppeal(!showAppeal)}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  申诉
                </button>
              </>
            )}
          </div>

          {/* 申诉输入框 */}
          {showAppeal && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <MessageSquare size={16} />
                向AI裁判解释这个组合
              </h4>
              <textarea
                value={appealExplanation}
                onChange={(e) => setAppealExplanation(e.target.value)}
                placeholder="请解释这个词语的含义、使用场景或者来源，帮助AI裁判理解..."
                rows={3}
                className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3 resize-none"
                disabled={isAppealing}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAppeal}
                  disabled={isAppealing || !appealExplanation.trim()}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isAppealing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                  {isAppealing ? '提交中...' : '提交申诉'}
                </button>
                <button
                  onClick={() => setShowAppeal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={isAppealing}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinationJudgeDialog;