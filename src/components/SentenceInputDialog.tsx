import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

interface SentenceInputDialogProps {
  isOpen: boolean;
  defaultSentence: string;
  onClose: () => void;
  onConfirm: (sentence: string) => void;
}

const SentenceInputDialog: React.FC<SentenceInputDialogProps> = ({
  isOpen,
  defaultSentence,
  onClose,
  onConfirm
}) => {
  const [sentence, setSentence] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSentence(defaultSentence);
    }
  }, [isOpen, defaultSentence]);

  const handleConfirm = () => {
    const trimmed = sentence.trim();
    if (trimmed) {
      onConfirm(trimmed);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-amber-900">请输入组成的句子</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              请使用您手中的14张汉字牌组成一句完整通顺的现代汉语句子。
            </p>
            <p className="text-xs text-blue-600 mt-2">
              提示：您的手牌汉字：{defaultSentence.split('').join('、')}
            </p>
          </div>

          {/* 输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的句子：
            </label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入句子..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-serif resize-none"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              字符数：{sentence.length} / 14
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!sentence.trim()}
              className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentenceInputDialog;