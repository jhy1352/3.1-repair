import React, { useState, useEffect } from 'react';
import {
  GameSessionState,
  Character,
  WorldInfo,
  DCRecord,
  ChatMessage,
  GMResponseMetadata,
} from './types/trpg';
import {
  loadSessionState,
  saveSessionState,
  clearSessionStorage,
  createEmptyGameState,
} from './utils/factory';
import { parseGMResponseMetaData, generateSavePackageText } from './utils/parser';
import { SupportedLocale } from './locales';
import { CreationWizard } from './components/CreationWizard';
import { GameInterface } from './components/GameInterface';
import { WorldInfoModal } from './components/WorldInfoModal';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { DiceRoller } from './components/DiceRoller';
import { CloudSyncModal } from './components/CloudSyncModal';

export default function App() {
  const [session, setSession] = useState<GameSessionState>(() => loadSessionState());
  const [locale, setLocale] = useState<SupportedLocale>('ko');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal Open States
  const [isWorldInfoOpen, setIsWorldInfoOpen] = useState(false);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

  // Latest parsed metadata
  const [latestMetadata, setLatestMetadata] = useState<GMResponseMetadata | null>(null);

  // Sync to local storage whenever session updates
  useEffect(() => {
    saveSessionState(session);
  }, [session]);

  const handleToggleLocale = () => {
    setLocale((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  // Phase 1 -> Phase 2 -> Phase 3 completion
  const handleCompleteCreation = async (worldInfo: WorldInfo, character: Character) => {
    const initialSession: GameSessionState = {
      ...session,
      gameState: 'playing',
      worldInfo,
      character,
      currentTurn: 1,
      messages: [],
      updatedAt: Date.now(),
    };

    setSession(initialSession);

    // Trigger opening GM narrative introduction
    setIsLoading(true);
    try {
      const initialPrompt = `[캠페인 시작]\n세계관: ${worldInfo.worldName} (${worldInfo.genre})\n위치: ${worldInfo.currentLocation}\n주인공: ${character.name} (${character.title || '무명'}, ${character.age}세, ${character.gender})\n5대 메타 엘리먼트:\n- 출신/배경: ${character.metaElements.background.title} (${character.metaElements.background.description})\n- 결핍/약점: ${character.metaElements.flaw.title} (${character.metaElements.flaw.description})\n- 맹세/신념: ${character.metaElements.oath.title} (${character.metaElements.oath.description})\n- 심리적 닻: ${character.metaElements.anchor.title} (${character.metaElements.anchor.description})\n- 소속 세력: ${character.metaElements.faction.title} (${character.metaElements.faction.description})\n\n위 설정을 바탕으로 장대한 서막을 열어라. 주인공이 처한 첫 상황과 주변 풍류, 눈앞의 인물과 사건을 대문호의 필치로 전개하고 첫 선택지 또는 상황을 제시하라.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: initialPrompt, turn: 1 }],
          character,
          worldInfo,
          currentTurn: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'GM 서사 생성에 실패했습니다.');
      }

      // Parse 14th block metadata
      const rawText = data.narrativeProse || data.rawResponse || '';
      const { cleanProse, metadata, updatedWorldInfo, updatedCharacter } =
        parseGMResponseMetaData(rawText, worldInfo, character);

      const gmMessage: ChatMessage = {
        id: `msg_gm_1_${Date.now()}`,
        role: 'assistant',
        content: cleanProse,
        timestamp: Date.now(),
        turn: 1,
        metadata,
      };

      setLatestMetadata(metadata);
      setSession((prev) => ({
        ...prev,
        worldInfo: updatedWorldInfo,
        character: updatedCharacter,
        messages: [gmMessage],
        currentTurn: 1,
        updatedAt: Date.now(),
      }));
    } catch (err: any) {
      console.error('Error starting game:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `[시스템 오류 발생]: 서사를 불러오는 중 문제가 발생했습니다. (${err.message}). 하단 입력창을 통해 다시 시도해 주세요.`,
        timestamp: Date.now(),
        turn: 1,
      };
      setSession((prev) => ({
        ...prev,
        messages: [errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Player Sending Prompt / Message
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const nextTurn = session.currentTurn + 1;
    const userMessage: ChatMessage = {
      id: `msg_user_${nextTurn}_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
      turn: nextTurn,
    };

    const updatedMessages = [...session.messages, userMessage];

    setSession((prev) => ({
      ...prev,
      messages: updatedMessages,
      currentTurn: nextTurn,
      updatedAt: Date.now(),
    }));

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          character: session.character,
          worldInfo: session.worldInfo,
          currentTurn: nextTurn,
          dcRecords: session.dcRecords,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI GM 응답을 가져오지 못했습니다.');
      }

      // Parse 14th block
      const rawText = data.narrativeProse || data.rawResponse || '';
      const { cleanProse, metadata, updatedWorldInfo, updatedCharacter } =
        parseGMResponseMetaData(rawText, session.worldInfo, session.character);

      const gmMessage: ChatMessage = {
        id: `msg_gm_${nextTurn}_${Date.now()}`,
        role: 'assistant',
        content: cleanProse,
        timestamp: Date.now(),
        turn: nextTurn,
        metadata,
      };

      setLatestMetadata(metadata);
      setSession((prev) => ({
        ...prev,
        worldInfo: updatedWorldInfo,
        character: updatedCharacter,
        messages: [...updatedMessages, gmMessage],
        currentTurn: nextTurn,
        updatedAt: Date.now(),
      }));
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `[시스템 오류 발생]: ${err.message}`,
        timestamp: Date.now(),
        turn: nextTurn,
      };
      setSession((prev) => ({
        ...prev,
        messages: [...updatedMessages, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Session to Creation
  const handleResetSession = () => {
    if (window.confirm('새로운 모험을 시작하시겠습니까? 현재 세션 데이터가 초기화됩니다.')) {
      clearSessionStorage();
      setSession(createEmptyGameState());
      setLatestMetadata(null);
    }
  };

  // Load Session from Cloud / Package
  const handleLoadSession = (loadedState: GameSessionState) => {
    setSession(loadedState);
    if (loadedState.messages.length > 0) {
      const lastAssistantMsg = [...loadedState.messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg?.metadata) {
        setLatestMetadata(lastAssistantMsg.metadata);
      }
    }
  };

  // Record DC Check outcome to stats
  const handleRecordDC = (record: DCRecord) => {
    setSession((prev) => ({
      ...prev,
      dcRecords: [...(prev.dcRecords || []), record],
    }));
  };

  // Apply Roll outcome to prompt or send directly
  const handleApplyRollToPrompt = (rollData: {
    sides: number;
    rawRoll: number;
    modifier: number;
    total: number;
    targetDC?: number;
    outcomeLabel?: string;
  }) => {
    let rollText = `[주사위 D${rollData.sides} 판정: 눈금 ${rollData.rawRoll}`;
    if (rollData.modifier !== 0) {
      rollText += ` + 보정치 ${rollData.modifier >= 0 ? `+${rollData.modifier}` : rollData.modifier}`;
    }
    rollText += ` = 최종 ${rollData.total}`;
    if (rollData.targetDC) {
      rollText += ` vs 목표 DC ${rollData.targetDC} -> ${rollData.outcomeLabel || ''}`;
    }
    rollText += `]`;

    handleSendMessage(rollText);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-800 selection:text-stone-100">
      {session.gameState === 'creation' ? (
        <CreationWizard
          onComplete={handleCompleteCreation}
          locale={locale}
          initialWorld={session.worldInfo}
          initialCharacter={session.character}
        />
      ) : (
        <GameInterface
          messages={session.messages}
          character={session.character}
          worldInfo={session.worldInfo}
          currentTurn={session.currentTurn}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenWorldInfo={() => setIsWorldInfoOpen(true)}
          onOpenCharacterSheet={() => setIsCharacterSheetOpen(true)}
          onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
          onOpenCloudSync={() => setIsCloudSyncOpen(true)}
          onResetSession={handleResetSession}
          locale={locale}
          onToggleLocale={handleToggleLocale}
          latestMetadata={latestMetadata}
          dcRecords={session.dcRecords || []}
        />
      )}

      {/* World Info Modal */}
      <WorldInfoModal
        isOpen={isWorldInfoOpen}
        onClose={() => setIsWorldInfoOpen(false)}
        worldInfo={session.worldInfo}
        latestMetadata={latestMetadata}
        locale={locale}
      />

      {/* Character Sheet Modal */}
      <CharacterSheetModal
        isOpen={isCharacterSheetOpen}
        onClose={() => setIsCharacterSheetOpen(false)}
        character={session.character}
        onUpdateCharacter={(updated) => setSession((prev) => ({ ...prev, character: updated }))}
        locale={locale}
      />

      {/* Dice Roller Modal */}
      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        onApplyRollToPrompt={handleApplyRollToPrompt}
        dcRecords={session.dcRecords || []}
        onRecordDC={handleRecordDC}
        currentTurn={session.currentTurn}
        locale={locale}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        sessionState={session}
        onLoadSession={handleLoadSession}
        locale={locale}
      />
    </div>
  );
}
