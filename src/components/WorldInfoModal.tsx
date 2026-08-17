import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  Sprout,
  Compass,
  EyeOff,
  Lock,
  Code2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { WorldInfo, GMResponseMetadata, NPC } from '../types/trpg';
import { SupportedLocale, translations } from '../locales';

interface WorldInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldInfo: WorldInfo;
  latestMetadata?: GMResponseMetadata | null;
  locale: SupportedLocale;
}

type TabType = 'npcs' | 'factions' | 'seeds' | 'chapters' | 'offCamera' | 'secrets' | 'rawLog';

export const WorldInfoModal: React.FC<WorldInfoModalProps> = ({
  isOpen,
  onClose,
  worldInfo,
  latestMetadata,
  locale,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('npcs');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const t = translations[locale];

  if (!isOpen) return null;

  const handleCopyRawLog = () => {
    const textToCopy = latestMetadata?.rawBlock || '기록된 14번 메타데이터 블록이 없습니다.';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNpcs = (worldInfo.npcs || []).filter((npc) => {
    if (filterClass === 'all') return true;
    return npc.classRating === filterClass;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-900 border border-amber-900/40 rounded-xl shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-700/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                {t.modals.worldInfoTitle}
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/40 font-mono">
                  {worldInfo.worldName || '강호 정사'}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                실시간 동기화 정보 • {worldInfo.genre || '정통 무협'} • 위치: {worldInfo.currentLocation || '미상'}
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
        <div className="flex overflow-x-auto px-6 border-b border-stone-800 bg-stone-950/30 text-xs font-medium space-x-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('npcs')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'npcs'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.modals.tabs.npcs} ({worldInfo.npcs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('factions')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'factions'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {t.modals.tabs.factions} ({worldInfo.factions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'seeds'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            {t.modals.tabs.seeds} ({worldInfo.seeds?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'chapters'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {t.modals.tabs.chapters}
          </button>
          <button
            onClick={() => setActiveTab('offCamera')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'offCamera'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            {t.modals.tabs.offCamera}
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'secrets'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t.modals.tabs.secrets}
          </button>
          <button
            onClick={() => setActiveTab('rawLog')}
            className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rawLog'
                ? 'border-amber-500 text-amber-400 bg-amber-950/10 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {t.modals.tabs.rawLog}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tab 1: NPCs / OC Cast */}
          {activeTab === 'npcs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-400">분류 필터:</span>
                  {['all', 'Class A', 'Class B', 'Class C'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterClass(c)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                        filterClass === c
                          ? 'bg-amber-900/60 text-amber-200 border border-amber-700/50'
                          : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {c === 'all' ? '전체 인물' : c}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-stone-500">
                  Class A (정체성 귀속) • Class B (원작 수렴) • Class C (자유 가변)
                </span>
              </div>

              {filteredNpcs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-stone-800 rounded-xl">
                  <Users className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-sm text-stone-400">서사 진행 중 등장하는 인물이 실시간으로 등록됩니다.</p>
                  <p className="text-xs text-stone-500 mt-1">
                    AI GM이 새로운 인물 언급 시 14번 메타데이터를 통해 즉시 UI에 반영합니다.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNpcs.map((npc) => (
                    <div
                      key={npc.id}
                      className="p-4 bg-stone-950/50 border border-stone-800 hover:border-amber-900/40 rounded-xl space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-100">{npc.name}</span>
                            {npc.title && <span className="text-xs text-amber-400/90 font-mono">[{npc.title}]</span>}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                npc.classRating === 'Class A'
                                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                                  : npc.classRating === 'Class B'
                                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                              }`}
                            >
                              {npc.classRating}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {npc.isCanon ? '원작 정사 인물' : '조연급 오리지널(OC)'}
                            {npc.age ? ` • ${npc.age}세` : ''}
                            {npc.faction ? ` • 소속: ${npc.faction}` : ''}
                          </p>
                        </div>
                      </div>

                      {npc.origin && (
                        <p className="text-xs text-stone-300">
                          <span className="text-stone-500">출신/내력:</span> {npc.origin}
                        </p>
                      )}
                      {npc.martialArt && (
                        <p className="text-xs text-stone-300">
                          <span className="text-stone-500">무학/능력:</span> {npc.martialArt}
                        </p>
                      )}
                      {npc.mindset && (
                        <p className="text-xs text-stone-300">
                          <span className="text-stone-500">가치관:</span> {npc.mindset}
                        </p>
                      )}

                      <div className="pt-2 border-t border-stone-800/80 space-y-1">
                        <div className="text-xs flex items-center gap-1.5">
                          <span className="text-stone-400 font-medium">관계:</span>
                          <span
                            className={
                              npc.relationship.includes('미인지')
                                ? 'text-stone-500 italic'
                                : 'text-amber-300 font-medium'
                            }
                          >
                            {npc.relationship}
                          </span>
                        </div>
                        {npc.thought && (
                          <div className="text-xs text-stone-300 bg-stone-900/70 p-2 rounded-md border border-stone-800">
                            <span className="text-stone-400 font-medium">심경/생각:</span> {npc.thought}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Factions */}
          {activeTab === 'factions' && (
            <div className="space-y-4">
              {worldInfo.factions && worldInfo.factions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {worldInfo.factions.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 bg-stone-950/50 border border-stone-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-amber-300">{f.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                          세력 영향력: {f.influence}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">{f.description}</p>
                      <div className="text-xs text-stone-400 pt-2 border-t border-stone-800 flex justify-between">
                        <span>성향: {f.alignment || '중립'}</span>
                        <span className="font-medium text-stone-300">주인공과의 관계: {f.stanceToPlayer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-stone-800 rounded-xl">
                  <Shield className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-sm text-stone-400">서사에 등장하는 문파 및 세력 정보가 실시간 기록됩니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Narrative Seeds */}
          {activeTab === 'seeds' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-300/90 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>복선 구조적 관리 프로토콜:</strong> AI GM은 강호에 뿌려진 힌트/복선을 최대 3개까지 실시간
                  추적하며 개연성 있게 회수합니다.
                </span>
              </div>

              {worldInfo.seeds && worldInfo.seeds.length > 0 ? (
                <div className="space-y-2.5">
                  {worldInfo.seeds.map((seed, idx) => (
                    <div
                      key={seed.id || idx}
                      className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-xl flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-400">복선 씨앗 #{idx + 1}</span>
                          <span className="text-sm font-medium text-stone-100">{seed.title}</span>
                        </div>
                        <p className="text-xs text-stone-400">{seed.description}</p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40 shrink-0">
                        {seed.turnPlanted ? `턴 ${seed.turnPlanted}` : '활성'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-stone-800 rounded-xl">
                  <Sprout className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-sm text-stone-400">아직 활성화된 미회수 복선 씨앗이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Chapters Roadmap */}
          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950/70 border border-amber-900/40 rounded-xl space-y-2">
                <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase">현재 챕터</span>
                <h3 className="text-base font-bold text-stone-100">{worldInfo.chapters?.currentChapter}</h3>
                <p className="text-xs text-stone-300 leading-relaxed">{worldInfo.chapters?.summary}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-stone-400 font-medium">향후 예정 챕터 로드맵</span>
                <div className="space-y-2">
                  {(worldInfo.chapters?.plannedChapters || []).map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-950/40 border border-stone-800/80 rounded-lg text-xs text-stone-300 flex items-center gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Off-Camera Events */}
          {activeTab === 'offCamera' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 text-xs text-stone-400">
                주인공의 동선 밖 타 지역/세력에서 독자적으로 일어난 은밀한 물밑 정세 변화입니다. (본문 NPC 인지
                불가/순수 시스템 기록용)
              </div>

              {worldInfo.offCameraEvents && worldInfo.offCameraEvents.length > 0 ? (
                <div className="space-y-2">
                  {worldInfo.offCameraEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-950/50 border border-stone-800 rounded-lg text-xs text-stone-300 flex items-start gap-2.5"
                    >
                      <span className="text-amber-500 shrink-0 font-mono">▸</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-stone-800 rounded-xl">
                  <EyeOff className="w-8 h-8 mx-auto text-stone-600 mb-2" />
                  <p className="text-sm text-stone-400">카메라 밖 정세 기록이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Secrets & Knowledge Boundaries */}
          {activeTab === 'secrets' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span>📢 세간 공표 정보</span>
                  <span className="text-[10px] text-stone-500 font-normal">(강호 저자거리에 퍼진 소문/공개 사실)</span>
                </h3>
                <div className="p-3 bg-stone-950/50 border border-stone-800 rounded-lg text-xs text-stone-300">
                  {worldInfo.timeline || '천하가 요동치는 정세 속 다양한 소문이 저자거리에 오르내리고 있습니다.'}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 미공개 기밀 정보</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    (특정 당사자만 알고 있어 일반 무림인에게 유출 불가)
                  </span>
                </h3>
                <div className="p-3 bg-stone-950/50 border border-stone-800 rounded-lg text-xs text-stone-300">
                  철저한 정보 비대칭성 프로토콜에 따라, 당사자를 직접 대면하거나 은밀한 비사를 획득하기 전까지는
                  기밀이 서사 본문이나 NPC 대사에 스포일러되지 않습니다.
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: 14th Block Raw Log */}
          {activeTab === 'rawLog' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  매 턴 AI GM이 생성한 14번 필수 표기사항 시스템 코드블록입니다.
                </span>
                <button
                  onClick={handleCopyRawLog}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사됨' : '원클릭 복사'}</span>
                </button>
              </div>

              <pre className="p-4 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {latestMetadata?.rawBlock || '아직 기록된 14번 시스템 블록이 없습니다.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
