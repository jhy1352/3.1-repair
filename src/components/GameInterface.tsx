import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Dices,
  BookOpen,
  User,
  Cloud,
  Globe,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  Info,
  Shield,
  Layers,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import {
  ChatMessage,
  Character,
  WorldInfo,
  DCRecord,
  GMResponseMetadata,
} from '../types/trpg';
import { SupportedLocale, translations } from '../locales';

interface GameInterfaceProps {
  messages: ChatMessage[];
  character: Character;
  worldInfo: WorldInfo;
  currentTurn: number;
  isLoading: boolean;
  onSendMessage: (promptText: string) => void;
  onOpenWorldInfo: () => void;
  onOpenCharacterSheet: () => void;
  onOpenDiceRoller: () => void;
  onOpenCloudSync: () => void;
  onResetSession: () => void;
  locale: SupportedLocale;
  onToggleLocale: () => void;
  latestMetadata?: GMResponseMetadata | null;
  dcRecords: DCRecord[];
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  messages,
  character,
  worldInfo,
  currentTurn,
  isLoading,
  onSendMessage,
  onOpenWorldInfo,
  onOpenCharacterSheet,
  onOpenDiceRoller,
  onOpenCloudSync,
  onResetSession,
  locale,
  onToggleLocale,
  latestMetadata,
  dcRecords,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false);
  const [copiedRawBlock, setCopiedRawBlock] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const t = translations[locale];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyRawBlock = () => {
    if (!latestMetadata?.rawBlock) return;
    navigator.clipboard.writeText(latestMetadata.rawBlock);
    setCopiedRawBlock(true);
    setTimeout(() => setCopiedRawBlock(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-stone-200 overflow-hidden font-sans selection:bg-amber-900/60 selection:text-stone-100">
      {/* Top Navbar Header */}
      <header className="h-14 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <h1 className="text-sm sm:text-base font-bold text-stone-100 tracking-tight">
              {worldInfo.worldName || 'TRPG 엔진'}
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-xs text-stone-400">
            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono text-[11px]">
              턴 {currentTurn}
            </span>
            <span className="text-stone-500">•</span>
            <span className="truncate max-w-[200px]">{character.location || '강호 일대'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* World Info Modal Button */}
          <button
            onClick={onOpenWorldInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors border border-stone-700/60"
            title="세계관 / 인물 / 복선 정보"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.nav.worldInfo}</span>
            {(worldInfo.npcs?.length || 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-800/40">
                {worldInfo.npcs.length}
              </span>
            )}
          </button>

          {/* Character Sheet Modal Button */}
          <button
            onClick={onOpenCharacterSheet}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors border border-stone-700/60"
            title="캐릭터 시트 & 소장품"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{character.name || t.nav.characterSheet}</span>
          </button>

          {/* Dice Roller Button */}
          <button
            onClick={onOpenDiceRoller}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors border border-stone-700/60"
            title="CSPRNG 암호학적 주사위"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.nav.diceRoller}</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenCloudSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors border border-stone-700/60"
            title="6자리 클라우드 동기화 & 세이브"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.nav.cloudSync}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLocale}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            title="언어 전환 (KO / EN)"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
            title="새 모험 시작 (초기화)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Narrative Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-amber-400/60" />
            <p className="text-base text-stone-300 font-serif">
              신필(神筆) 급 서사의 첫 장을 열어갑니다.
            </p>
            <p className="text-xs text-stone-500">
              하단 자유 프롬프트 입력창에 행동이나 발언을 선언하여 모험을 시작하세요.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`space-y-2 transition-opacity duration-300 ${
                msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
              }`}
            >
              {/* User Message Bubble */}
              {msg.role === 'user' && (
                <div className="max-w-[85%] bg-amber-950/40 border border-amber-800/40 rounded-2xl rounded-tr-xs p-4 text-stone-100 text-sm shadow-md">
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-amber-400 font-medium">
                    <User className="w-3 h-3" />
                    <span>{character.name || '플레이어'}</span>
                    <span className="text-stone-500 font-mono">턴 {msg.turn || currentTurn}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              )}

              {/* GM Narrative Prose */}
              {msg.role === 'assistant' && (
                <div className="w-full bg-stone-900/40 border border-stone-800/60 rounded-2xl p-5 sm:p-6 text-stone-200 text-sm sm:text-base leading-relaxed space-y-4 shadow-sm font-serif">
                  <div className="flex items-center justify-between border-b border-stone-800/60 pb-2.5 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                        AI 게임마스터 서사
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">턴 {msg.turn || currentTurn}</span>
                    </div>
                    {msg.metadata && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-sans">
                        실시간 정사 동기화 완료
                      </span>
                    )}
                  </div>

                  {/* Clean Literary Prose Content */}
                  <div className="whitespace-pre-wrap tracking-normal text-stone-200 font-normal leading-[1.8] text-[15px]">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-6 bg-stone-900/30 border border-stone-800/40 rounded-2xl flex items-center space-x-3 text-stone-400 text-xs">
            <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <div className="space-y-0.5 font-serif">
              <p className="text-stone-300 text-xs">
                실시간 외부 정사 팩트체크 및 인과적 심경 갱신 중...
              </p>
              <p className="text-[11px] text-stone-500">
                14번 시스템 메타데이터 파싱 및 UI 상태 자동 동기화 준비
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 14th Block Quick Inspector Drawer (Expandable) */}
      {latestMetadata && (
        <div className="border-t border-stone-800/80 bg-stone-950/90 text-xs px-4 sm:px-6 py-2 shrink-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
              className="flex items-center gap-2 text-stone-400 hover:text-amber-300 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">
                최근 14번 메타데이터 블록 ({latestMetadata.verified ? '실시간 검증됨' : '기록됨'})
              </span>
              {showMetadataDrawer ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleCopyRawBlock}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition-colors"
            >
              {copiedRawBlock ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedRawBlock ? '복사됨' : '원클릭 복사'}</span>
            </button>
          </div>

          {showMetadataDrawer && (
            <div className="max-w-4xl mx-auto mt-2 p-3 bg-stone-900 border border-stone-800 rounded-lg max-h-36 overflow-y-auto text-[11px] font-mono text-stone-300 whitespace-pre-wrap">
              {latestMetadata.rawBlock}
            </div>
          )}
        </div>
      )}

      {/* Bottom General Prompt Input (자유 프롬프트 입력창 - Section 3.16) */}
      <footer className="border-t border-stone-800 bg-stone-900/90 backdrop-blur-md p-3 sm:p-4 shrink-0 z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="자유 프롬프트 입력창: 행동 선언, 대화, 메타 질문, 연출 요청, 주사위 판정 요구 등..."
                disabled={isLoading}
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl p-3 pr-24 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 resize-none transition-all"
              />

              {/* Inline Quick Action Buttons */}
              <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenDiceRoller}
                  className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
                  title="CSPRNG 주사위 굴리기"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="h-11 px-4 sm:px-5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-stone-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">전송</span>
            </button>
          </form>

          {/* Status info line */}
          <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 font-mono">
            <span>Enter로 전송 • Shift + Enter 줄바꿈 • CSPRNG Cryptographic Dice Engine</span>
            <span>토큰 다이어트: 최근 10턴(20메시지) 무손실 유지</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
