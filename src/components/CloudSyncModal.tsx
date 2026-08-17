import React, { useState } from 'react';
import {
  X,
  Cloud,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
  Key,
} from 'lucide-react';
import { GameSessionState } from '../types/trpg';
import { generateSavePackageText } from '../utils/parser';
import { SupportedLocale, translations } from '../locales';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: GameSessionState;
  onLoadSession: (loadedState: GameSessionState) => void;
  locale: SupportedLocale;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  sessionState,
  onLoadSession,
  locale,
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'package'>('cloud');
  const [inputCode, setInputCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>(sessionState.lastSyncCode || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPackage, setCopiedPackage] = useState<boolean>(false);
  const [packageInput, setPackageInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const t = translations[locale];

  if (!isOpen) return null;

  const handleCloudSave = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/cloud-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionData: sessionState }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '클라우드 저장에 실패했습니다.');
      }
      setGeneratedCode(data.syncCode);
      setStatusMessage({
        type: 'success',
        text: `클라우드 저장 완료! 동기화 코드: [${data.syncCode}]`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || '클라우드 저장 중 통신 에러가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const code = inputCode.trim().toUpperCase();
      const res = await fetch(`/api/cloud-load/${code}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '세션을 불러오지 못했습니다.');
      }
      onLoadSession(data.data);
      setStatusMessage({
        type: 'success',
        text: `동기화 코드 [${code}]로부터 세션을 완벽히 복원했습니다!`,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || '세션 로드 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySavePackage = () => {
    const pkg = generateSavePackageText(
      sessionState.worldInfo,
      sessionState.character,
      sessionState.dcRecords,
      sessionState.currentTurn
    );
    navigator.clipboard.writeText(pkg);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2000);
  };

  const handleImportSavePackage = () => {
    if (!packageInput.trim()) return;
    try {
      let jsonStr = packageInput.trim();
      const match = packageInput.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      }
      const parsed = JSON.parse(jsonStr);
      if (!parsed.characterState || !parsed.worldInfo) {
        throw new Error('유효한 세이브 패키지 구조가 아닙니다.');
      }

      const restoredSession: GameSessionState = {
        ...sessionState,
        character: {
          ...sessionState.character,
          name: parsed.characterState.name || sessionState.character.name,
          title: parsed.characterState.title || sessionState.character.title,
          age: parsed.characterState.age || sessionState.character.age,
          stats: parsed.characterState.stats || sessionState.character.stats,
          inventory: parsed.characterState.inventory || sessionState.character.inventory,
          metaElements: parsed.characterState.metaElements || sessionState.character.metaElements,
          chronology: parsed.characterState.chronology || sessionState.character.chronology,
        },
        worldInfo: {
          ...sessionState.worldInfo,
          worldName: parsed.worldInfo.worldName || sessionState.worldInfo.worldName,
          genre: parsed.worldInfo.genre || sessionState.worldInfo.genre,
          npcs: parsed.worldInfo.npcs || sessionState.worldInfo.npcs,
          factions: parsed.worldInfo.factions || sessionState.worldInfo.factions,
          seeds: parsed.worldInfo.activeSeeds || sessionState.worldInfo.seeds,
          offCameraEvents: parsed.worldInfo.offCameraEvents || sessionState.worldInfo.offCameraEvents,
          chapters: parsed.worldInfo.chapters || sessionState.worldInfo.chapters,
        },
        currentTurn: parsed.currentTurn || sessionState.currentTurn,
        updatedAt: Date.now(),
      };

      onLoadSession(restoredSession);
      setStatusMessage({
        type: 'success',
        text: '세이브 패키지 데이터를 성공적으로 적재했습니다!',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `패키지 파싱 실패: ${err.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/40 rounded-xl shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-700/30 text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100">{t.modals.cloudSyncTitle}</h2>
              <p className="text-xs text-stone-400">PC / 모바일 간 6자리 무손실 세션 동기화</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex px-6 border-b border-stone-800 bg-stone-950/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'cloud'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            6자리 클라우드 동기화
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'package'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            무손실 세이브 패키지 (JSON/Markdown)
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              {/* 1. Cloud Save */}
              <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      {t.cloud.saveTitle}
                    </h3>
                    <p className="text-xs text-stone-400">{t.cloud.saveDesc}</p>
                  </div>
                  <button
                    onClick={handleCloudSave}
                    disabled={isLoading}
                    className="px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {isLoading ? '업로드 중...' : '저장 & 코드 발급'}
                  </button>
                </div>

                {generatedCode && (
                  <div className="p-3 bg-stone-900 border border-amber-900/50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider block">
                        발급된 6자리 동기화 코드
                      </span>
                      <span className="text-xl font-black font-mono tracking-widest text-stone-100">
                        {generatedCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md text-xs flex items-center gap-1.5 transition-colors border border-stone-700"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? '복사됨' : '코드 복사'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Cloud Load */}
              <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                    <DownloadCloud className="w-4 h-4 text-sky-400" />
                    {t.cloud.loadTitle}
                  </h3>
                  <p className="text-xs text-stone-400">{t.cloud.loadDesc}</p>
                </div>

                <form onSubmit={handleCloudLoad} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="예: X9K2A7"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="flex-1 uppercase bg-stone-900 border border-stone-700 rounded-lg px-4 py-2 text-sm font-mono tracking-wider text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-center font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || inputCode.trim().length < 6}
                    className="px-4 py-2 bg-sky-800 hover:bg-sky-700 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    불러오기
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'package' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg text-xs text-stone-400 leading-relaxed">
                토큰 기억 한계 도달 시 또는 장기 백업용으로 6대 핵심 요소(스탯, 인물망, 정보한계선, 복선, DC통계,
                챕터)를 완벽히 보존하는 텍스트 패키지입니다.
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-stone-300">내보내기 (현재 세션)</span>
                <button
                  onClick={handleCopySavePackage}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-stone-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedPackage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPackage ? '패키지 복사됨' : '원클릭 패키지 복사'}</span>
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800">
                <span className="text-xs font-semibold text-stone-300">가져오기 (패키지 텍스트 붙여넣기)</span>
                <textarea
                  rows={4}
                  placeholder="복사해둔 세이브 패키지 JSON 또는 마크다운 코드블록을 붙여넣으세요..."
                  value={packageInput}
                  onChange={(e) => setPackageInput(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleImportSavePackage}
                  disabled={!packageInput.trim()}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  패키지 데이터 복원 적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
