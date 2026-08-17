import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Sparkles,
  Package,
  Scroll,
  Plus,
  Trash2,
  Tag,
  Star,
  Layers,
} from 'lucide-react';
import { Character, CharacterItem, MetaInputType } from '../types/trpg';
import { SupportedLocale, translations } from '../locales';

interface CharacterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateCharacter?: (updated: Character) => void;
  locale: SupportedLocale;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  locale,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'meta' | 'inventory' | 'chronology'>('status');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const t = translations[locale];

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !onUpdateCharacter) return;
    const newItem: CharacterItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      description: newItemDesc.trim() || '소장품',
      quantity: 1,
    };
    onUpdateCharacter({
      ...character,
      inventory: [...(character.inventory || []), newItem],
    });
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleRemoveItem = (id: string) => {
    if (!onUpdateCharacter) return;
    onUpdateCharacter({
      ...character,
      inventory: character.inventory.filter((item) => item.id !== id),
    });
  };

  const getModifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const renderMetaBadge = (type: MetaInputType, isGolden?: boolean) => {
    if (isGolden || type === 'custom') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 font-medium">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          Golden Data
        </span>
      );
    }
    if (type === 'tabula_rasa') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-600/50 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Tabula Rasa (백지)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-medium">
        AI Preset
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border border-amber-900/40 rounded-xl shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-700/30 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <span>{character.name || '무명 협객'}</span>
                {character.title && (
                  <span className="text-xs text-amber-400 font-mono font-normal">[{character.title}]</span>
                )}
              </h2>
              <p className="text-xs text-stone-400">
                {character.age}세 • {character.gender} • 상태: {character.statusNotes || '양호'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 border-b border-stone-800 bg-stone-950/30 text-xs font-medium space-x-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            능력치 & 신분
          </button>
          <button
            onClick={() => setActiveTab('meta')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors ${
              activeTab === 'meta'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            5대 메타 엘리먼트
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            소장품 (인벤토리) ({character.inventory?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('chronology')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors ${
              activeTab === 'chronology'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            일대기 & 연표
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tab 1: Stats & Info */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(character.stats || {}).map(([statName, val]) => (
                  <div
                    key={statName}
                    className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-stone-400 font-medium">{statName}</span>
                      <div className="text-xl font-bold text-stone-100 font-mono">{val}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block">보정치</span>
                      <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                        {getModifier(val)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-stone-950/40 border border-stone-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-800/60 pb-2">
                  <span className="text-stone-400">현재 체류 위치</span>
                  <span className="text-stone-200 font-medium">{character.location || '강호 일대'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-800/60 pb-2">
                  <span className="text-stone-400">외모 및 복색</span>
                  <span className="text-stone-200">{character.appearance || '검소한 무복'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">컨디션 및 심신 상태</span>
                  <span className="text-emerald-400 font-medium">{character.statusNotes || '양호'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 5 Meta-Elements */}
          {activeTab === 'meta' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-950/50 border border-stone-800 rounded-lg text-xs text-stone-400 leading-relaxed">
                메타 엘리먼트는 주인공의 출신, 결핍, 맹세, 닻, 소속 세력으로 AI GM 서사의 최우선적인 인과와 서사적
                훅으로 작동합니다.
              </div>

              {Object.entries(character.metaElements || {}).map(([key, meta]) => {
                const labelMap: Record<string, string> = {
                  background: '출신 / 배경 (Background)',
                  flaw: '결핍 / 약점 (Flaw)',
                  oath: '맹세 / 신념 (Oath)',
                  anchor: '심리적 닻 (Anchor)',
                  faction: '소속 세력 (Faction)',
                };
                return (
                  <div
                    key={key}
                    className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">{labelMap[key] || key}</span>
                      {renderMetaBadge(meta.type, meta.isGoldenData)}
                    </div>
                    <h4 className="text-sm font-medium text-stone-100">{meta.title}</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <form onSubmit={handleAddItem} className="p-3 bg-stone-950/60 border border-stone-800 rounded-xl flex gap-2">
                <input
                  type="text"
                  placeholder="새 소장품 이름..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="설명 (선택)..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-stone-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  추가
                </button>
              </form>

              {character.inventory && character.inventory.length > 0 ? (
                <div className="space-y-2">
                  {character.inventory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-950/40 border border-stone-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-stone-100">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">
                            수량: {item.quantity}
                          </span>
                        </div>
                        {item.description && <p className="text-xs text-stone-400">{item.description}</p>}
                      </div>
                      {onUpdateCharacter && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-stone-500 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border border-dashed border-stone-800 rounded-xl">
                  <Package className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-xs text-stone-400">보유한 특별 기물이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Chronology */}
          {activeTab === 'chronology' && (
            <div className="space-y-3">
              {character.chronology && character.chronology.length > 0 ? (
                <div className="space-y-2 border-l-2 border-amber-900/60 ml-2 pl-4">
                  {character.chronology.map((milestone, idx) => (
                    <div key={idx} className="relative text-xs text-stone-300 py-1">
                      <div className="absolute -left-[21px] top-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-stone-900" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border border-dashed border-stone-800 rounded-xl">
                  <Scroll className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-xs text-stone-400">서사가 전개됨에 따라 주인공의 연표가 누적됩니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
