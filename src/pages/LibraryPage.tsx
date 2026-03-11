import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Upload, Plus, Trash2, Edit, Save, Eye, PlusCircle, Book, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CardLibraryService } from '../services/CardLibrary';
import type { CardLibrary, Card, CardCategory } from '../types';

const LibraryPage = () => {
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState<CardLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<CardLibrary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState<Partial<Card>>({
    char: '',
    pinyin: '',
    category: 'emotion' as CardCategory,
    frequency: 3,
    definition: ''
  });

  // 分类名称映射
  const categoryNames: Record<string, string> = {
    emotion: '情感核心字',
    verb: '高频动词',
    noun: '日常名词',
    adjective: '形容词',
    adverb: '副词/虚词/语气词',
    scene: '场景/方位字',
    supplement: '补充融合字',
    all: '全部'
  };

  // 分类颜色映射
  const categoryColors: Record<string, string> = {
    emotion: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    verb: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    noun: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    adjective: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    adverb: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    scene: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    supplement: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    all: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  // 加载牌库列表
  const loadLibraries = () => {
    try {
      const libs = CardLibraryService.getAllLibraries();
      setLibraries(libs);
      if (libs.length > 0 && !selectedLibrary) {
        setSelectedLibrary(libs[0]);
      }
    } catch (error) {
      toast.error('加载牌库失败', { description: (error as Error).message });
    }
  };

  useEffect(() => {
    loadLibraries();
  }, []);

  // 创建新牌库
  const handleCreateLibrary = () => {
    try {
      const newLib = CardLibraryService.createLibrary('新牌库', '自定义牌库');
      loadLibraries();
      setSelectedLibrary(newLib);
      setIsEditing(true);
      toast.success('牌库创建成功');
    } catch (error) {
      toast.error('创建牌库失败', { description: (error as Error).message });
    }
  };

  // 删除牌库
  const handleDeleteLibrary = (id: string) => {
    if (id === 'default') {
      toast.error('默认牌库不能删除');
      return;
    }

    if (confirm('确定要删除这个牌库吗？此操作不可恢复。')) {
      try {
        CardLibraryService.deleteLibrary(id);
        loadLibraries();
        setSelectedLibrary(libraries.find(lib => lib.id !== id) || null);
        toast.success('牌库删除成功');
      } catch (error) {
        toast.error('删除牌库失败', { description: (error as Error).message });
      }
    }
  };

  // 保存牌库编辑
  const handleSaveLibrary = () => {
    if (!selectedLibrary) return;

    try {
      const updatedLib = {
        ...selectedLibrary,
        name: editName,
        description: editDescription
      };
      CardLibraryService.saveLibrary(updatedLib);
      setSelectedLibrary(updatedLib);
      setIsEditing(false);
      loadLibraries();
      toast.success('牌库信息已保存');
    } catch (error) {
      toast.error('保存失败', { description: (error as Error).message });
    }
  };

  // 导出牌库
  const handleExportLibrary = (library: CardLibrary) => {
    try {
      const exportData = JSON.stringify(library, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${library.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('牌库导出成功');
    } catch (error) {
      toast.error('导出失败', { description: (error as Error).message });
    }
  };

  // 导入牌库
  const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLib = JSON.parse(e.target?.result as string);
        
        // 验证导入的数据格式
        if (!importedLib.name || !Array.isArray(importedLib.cards)) {
          throw new Error('无效的牌库文件格式');
        }

        // 生成新的ID，避免冲突
        importedLib.id = undefined;
        importedLib.createdAt = Date.now();
        importedLib.updatedAt = Date.now();

        const newLib = CardLibraryService.createLibrary(
          `${importedLib.name} (导入)`,
          importedLib.description || ''
        );
        newLib.cards = importedLib.cards.map((card: Omit<Card, 'id'>) => ({
          ...card,
          id: crypto.randomUUID(),
          imageUrl: `/assets/cards/${encodeURIComponent(card.char)}.svg`
        }));

        CardLibraryService.saveLibrary(newLib);
        loadLibraries();
        setSelectedLibrary(newLib);
        toast.success('牌库导入成功');
      } catch (error) {
        toast.error('导入失败', { description: (error as Error).message });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 重置input，允许重复导入相同文件
  };

  // 删除卡牌
  const handleDeleteCard = (cardId: string) => {
    if (!selectedLibrary || selectedLibrary.id === 'default') {
      toast.error('默认牌库不能修改');
      return;
    }

    if (confirm('确定要删除这张卡牌吗？')) {
      try {
        const updatedCards = selectedLibrary.cards.filter(card => card.id !== cardId);
        const updatedLib = {
          ...selectedLibrary,
          cards: updatedCards,
          updatedAt: Date.now()
        };
        CardLibraryService.saveLibrary(updatedLib);
        setSelectedLibrary(updatedLib);
        loadLibraries();
        toast.success('卡牌删除成功');
      } catch (error) {
        toast.error('删除失败', { description: (error as Error).message });
      }
    }
  };

  // 添加新卡牌
  const handleAddCard = () => {
    if (!selectedLibrary || selectedLibrary.id === 'default') {
      toast.error('默认牌库不能修改');
      return;
    }

    if (!newCard.char || !newCard.pinyin) {
      toast.error('请填写汉字和拼音');
      return;
    }

    try {
      const card: Card = {
        id: crypto.randomUUID(),
        char: newCard.char!,
        pinyin: newCard.pinyin!,
        category: newCard.category as CardCategory,
        frequency: newCard.frequency || 3,
        definition: newCard.definition || '',
        imageUrl: `/assets/cards/${encodeURIComponent(newCard.char!)}.svg`
      };

      const updatedLib = {
        ...selectedLibrary,
        cards: [...selectedLibrary.cards, card],
        updatedAt: Date.now()
      };

      CardLibraryService.saveLibrary(updatedLib);
      setSelectedLibrary(updatedLib);
      loadLibraries();
      setShowAddCardModal(false);
      setNewCard({
        char: '',
        pinyin: '',
        category: 'emotion' as CardCategory,
        frequency: 3,
        definition: ''
      });
      toast.success('卡牌添加成功');
    } catch (error) {
      toast.error('添加失败', { description: (error as Error).message });
    }
  };

  // 复制牌库
  const handleCopyLibrary = (library: CardLibrary) => {
    try {
      const newLib = CardLibraryService.copyLibrary(library.id, `${library.name} (副本)`);
      loadLibraries();
      setSelectedLibrary(newLib);
      toast.success('牌库复制成功');
    } catch (error) {
      toast.error('复制失败', { description: (error as Error).message });
    }
  };

  // 过滤指定分类的卡牌
  const getFilteredCards = () => {
    if (!selectedLibrary) return [];
    if (selectedCategory === 'all') {
      return selectedLibrary.cards;
    }
    return selectedLibrary.cards.filter(card => card.category === selectedCategory);
  };

  // 按分类分组统计卡牌数量
  const getCardCountByCategory = () => {
    if (!selectedLibrary) return {};
    return selectedLibrary.cards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const categoryCounts = getCardCountByCategory();
  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* 装饰元素 */}
      <div className="absolute top-20 left-10 text-6xl text-white/5 rotate-12">📚</div>
      <div className="absolute bottom-40 right-10 text-6xl text-white/5 -rotate-12">🎴</div>
      
      {/* 木质边框效果 */}
      <div className="absolute inset-0 border-[16px] border-amber-900 shadow-inner pointer-events-none">
        <div className="absolute inset-0 border-[2px] border-amber-800/50"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-amber-50 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow border border-white/20"
            >
              <ArrowLeft size={20} />
              <span>返回首页</span>
            </button>
            <h1 className="text-4xl font-bold text-white font-serif">牌库管理</h1>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600/90 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-emerald-700/90 transition-all duration-300 shadow cursor-pointer">
                <Upload size={20} />
                <span>导入牌库</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLibrary}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCreateLibrary}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-blue-700/90 transition-all duration-300 shadow"
              >
                <Plus size={20} />
                <span>新建牌库</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧牌库列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Book className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-serif">牌库列表</h2>
                </div>
                <div className="space-y-3">
                  {libraries.map(library => (
                    <div
                      key={library.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedLibrary?.id === library.id
                          ? 'bg-amber-500/30 border-2 border-amber-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                      onClick={() => setSelectedLibrary(library)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-amber-50">{library.name}</h3>
                          <p className="text-sm text-amber-200/80 mt-1">{library.description}</p>
                          <p className="text-xs text-amber-200/60 mt-2">
                            {library.cards.length} 张牌
                          </p>
                          {library.id === 'default' && (
                            <span className="inline-block mt-2 text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-500/30">
                              默认
                            </span>
                          )}
                        </div>
                        {library.id !== 'default' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLibrary(library.id);
                            }}
                            className="text-red-400 hover:text-red-300 p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧牌库详情 */}
            <div className="lg:col-span-3">
              {selectedLibrary ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  {/* 牌库信息头部 */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-amber-200 mb-2">
                              牌库名称
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-white/50"
                              placeholder="输入牌库名称"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-amber-200 mb-2">
                              牌库描述
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-white/50"
                              rows={2}
                              placeholder="输入牌库描述"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveLibrary}
                              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                              <Save size={18} />
                              保存
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-2 bg-white/10 text-amber-50 rounded-lg hover:bg-white/20 transition-colors font-medium"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-2xl font-bold text-white font-serif mb-2">
                            {selectedLibrary.name}
                            {selectedLibrary.id === 'default' && (
                              <span className="ml-3 text-sm bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-500/30">
                                默认
                              </span>
                            )}
                          </h2>
                          <p className="text-amber-200/80 mt-1">{selectedLibrary.description}</p>
                          <p className="text-sm text-amber-200/60 mt-3">
                            共 {selectedLibrary.cards.length} 张牌 · 创建于 {new Date(selectedLibrary.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex flex-wrap gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditName(selectedLibrary.name);
                            setEditDescription(selectedLibrary.description);
                            setIsEditing(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                        >
                          <Edit size={18} />
                          编辑
                        </button>
                        <button
                          onClick={() => handleCopyLibrary(selectedLibrary)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                        >
                          <Copy size={18} />
                          复制
                        </button>
                        <button
                          onClick={() => handleExportLibrary(selectedLibrary)}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                        >
                          <Download size={18} />
                          导出
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 分类统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                    {Object.entries(categoryNames).map(([key, name]) => {
                      if (key === 'all') return null;
                      const count = categoryCounts[key] || 0;
                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 border-2 ${
                            selectedCategory === key
                              ? categoryColors[key] + ' shadow-lg'
                              : 'bg-white/5 text-amber-200 border-white/10 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedCategory(key)}
                        >
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-2xl font-bold mt-1">{count}</p>
                        </div>
                      );
                    })}
                    <div
                      className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 border-2 ${
                        selectedCategory === 'all'
                          ? categoryColors['all'] + ' shadow-lg'
                          : 'bg-white/5 text-amber-200 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <p className="text-sm font-medium">全部</p>
                      <p className="text-2xl font-bold mt-1">{selectedLibrary.cards.length}</p>
                    </div>
                  </div>

                  {/* 卡牌列表 */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white font-serif">
                        {categoryNames[selectedCategory]} ({filteredCards.length}张)
                      </h3>
                      <div className="flex items-center gap-4">
                        {selectedLibrary && selectedLibrary.id !== 'default' && (
                          <button
                            onClick={() => setShowAddCardModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/90 transition-all duration-300 shadow text-sm font-medium"
                          >
                            <PlusCircle size={16} />
                            添加卡牌
                          </button>
                        )}
                        <div className="text-sm text-amber-200/70">
                          按拼音排序 · 双击可查看详情
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[600px] overflow-y-auto p-3">
                      {filteredCards
                        .sort((a, b) => a.pinyin.localeCompare(b.pinyin))
                        .map(card => (
                          <div key={card.id} className="relative group">
                            <div
                              className="aspect-[3/4] bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl border-2 border-amber-800/70 flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:border-amber-600/70 transition-all cursor-pointer hover:-translate-y-1"
                              onDoubleClick={() => {
                                toast.info(`卡牌详情: ${card.char} (${card.pinyin})`, {
                                  description: `分类: ${categoryNames[card.category]}\n使用频率: ${card.frequency}/5\n${card.definition ? `释义: ${card.definition}` : ''}`,
                                  duration: 3000,
                                });
                              }}
                            >
                              <span className="text-3xl font-serif font-bold text-gray-800">
                                {card.char}
                              </span>
                              <span className="text-xs text-amber-900/70 mt-1 font-medium">
                                {card.pinyin}
                              </span>
                              <div className="mt-1 flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`w-1 h-1 rounded-full mx-0.5 ${
                                      i < card.frequency ? 'bg-amber-600' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {selectedLibrary && selectedLibrary.id !== 'default' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCard(card.id);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                title="删除卡牌"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                    </div>

                    {filteredCards.length === 0 && (
                      <div className="text-center py-16 text-amber-200/70">
                        <Eye size={48} className="mx-auto mb-4 opacity-30" />
                        <p>该分类下暂无卡牌</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-16 border border-white/20 text-center">
                  <p className="text-amber-200/70 text-lg">请选择一个牌库查看详情</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 添加卡牌模态框 */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 to-green-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white font-serif">添加新卡牌</h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="text-amber-200/70 hover:text-amber-50 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  汉字 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCard.char || ''}
                  onChange={(e) => setNewCard({ ...newCard, char: e.target.value })}
                  maxLength={1}
                  placeholder="请输入单个汉字"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-white/50 text-center text-3xl font-serif"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  拼音 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCard.pinyin || ''}
                  onChange={(e) => setNewCard({ ...newCard, pinyin: e.target.value })}
                  placeholder="请输入拼音"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  分类 <span className="text-red-400">*</span>
                </label>
                <select
                  value={newCard.category || 'emotion'}
                  onChange={(e) => setNewCard({ ...newCard, category: e.target.value as CardCategory })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white"
                >
                  <option value="emotion">情感核心字</option>
                  <option value="verb">高频动词</option>
                  <option value="noun">日常名词</option>
                  <option value="adjective">形容词</option>
                  <option value="adverb">副词/虚词/语气词</option>
                  <option value="scene">场景/方位字</option>
                  <option value="supplement">补充融合字</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  使用频率 (1-5)
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setNewCard({ ...newCard, frequency: score })}
                      className={`flex-1 h-12 rounded-lg font-medium transition-all ${
                        newCard.frequency === score
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-white/10 text-amber-50 hover:bg-white/20'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  释义（可选）
                </label>
                <textarea
                  value={newCard.definition || ''}
                  onChange={(e) => setNewCard({ ...newCard, definition: e.target.value })}
                  placeholder="请输入汉字释义"
                  rows={2}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-white/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-amber-50 rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;