import React, { useState } from 'react';
import {
  Dices,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  X,
  Send,
} from 'lucide-react';
import { rollCryptoDie, evaluateDCCheck, calculateDCDistribution, CheckOutcome } from '../utils/dice';
import { DCRecord } from '../types/trpg';
import { SupportedLocale, translations } from '../locales';

interface DiceRollerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onApplyRollToPrompt?: (rollData: {
    sides: number;
    rawRoll: number;
    modifier: number;
    total: number;
    targetDC?: number;
    outcomeLabel?: string;
  }) => void;
  dcRecords?: DCRecord[];
  onRecordDC?: (record: DCRecord) => void;
  currentTurn?: number;
  locale: SupportedLocale;
  isInline?: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  isOpen = true,
  onClose,
  onApplyRollToPrompt,
  dcRecords = [],
  onRecordDC,
  currentTurn = 1,
  locale,
  isInline = false,
}) => {
  const [selectedSides, setSelectedSides] = useState<number>(20);
  const [targetDC, setTargetDC] = useState<number>(10);
  const [modifier, setModifier] = useState<number>(0);
  const [actionDesc, setActionDesc] = useState<string>('');
  const [lastRawRoll, setLastRawRoll] = useState<number | null>(null);
  const [lastOutcome, setLastOutcome] = useState<CheckOutcome | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const t = translations[locale];

  if (!isOpen && !isInline) return null;

  const distribution = calculateDCDistribution(dcRecords);

  const handleRoll = () => {
    setIsRolling(true);
    // Visual rolling flicker effect
    let count = 0;
    const interval = setInterval(() => {
      setLastRawRoll(rollCryptoDie(selectedSides));
      count++;
      if (count >= 6) {
        clearInterval(interval);
        const finalRoll = rollCryptoDie(selectedSides);
        setLastRawRoll(finalRoll);
        setIsRolling(false);

        if (selectedSides === 20) {
          const outcome = evaluateDCCheck(finalRoll, modifier, targetDC);
          setLastOutcome(outcome);

          if (onRecordDC) {
            onRecordDC({
              turn: currentTurn,
              action: actionDesc || '판정 투척',
              targetDC,
              rawRoll: finalRoll,
              modifier,
              finalTotal: finalRoll + modifier,
              outcome: outcome.outcome,
              timestamp: Date.now(),
            });
          }
        } else {
          setLastOutcome(null);
        }
      }
    }, 45);
  };

  const handleApply = () => {
    if (lastRawRoll === null || !onApplyRollToPrompt) return;
    onApplyRollToPrompt({
      sides: selectedSides,
      rawRoll: lastRawRoll,
      modifier,
      total: lastRawRoll + modifier,
      targetDC: selectedSides === 20 ? targetDC : undefined,
      outcomeLabel: lastOutcome?.label,
    });
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-4 text-stone-200">
      {/* Dice Selection */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400">주사위 선택 (CSPRNG):</span>
        <div className="flex gap-1.5">
          {[4, 6, 8, 10, 12, 20, 100].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSelectedSides(s);
                setLastRawRoll(null);
                setLastOutcome(null);
              }}
              className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                selectedSides === s
                  ? 'bg-amber-700 text-stone-100 border border-amber-500'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              D{s}
            </button>
          ))}
        </div>
      </div>

      {/* Target DC & Modifier Controls (for D20 checks) */}
      {selectedSides === 20 && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-stone-950/60 border border-stone-800 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-amber-300/90 font-medium">목표 DC (5 ~ 15)</label>
              <span className="text-xs font-bold text-amber-400 font-mono">DC {targetDC}</span>
            </div>
            <input
              type="range"
              min={5}
              max={15}
              value={targetDC}
              onChange={(e) => setTargetDC(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500 block mt-0.5">
              정규 균등 분포(5~15) 프로토콜 적용
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-stone-300 font-medium">스탯/상황 보정치</label>
              <span className="text-xs font-bold text-stone-200 font-mono">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setModifier((m) => m - 1)}
                className="w-7 h-7 bg-stone-800 hover:bg-stone-700 rounded text-xs font-bold text-stone-300"
              >
                -
              </button>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(Number(e.target.value))}
                className="w-full text-center bg-stone-900 border border-stone-700 rounded h-7 text-xs font-mono text-stone-100"
              />
              <button
                type="button"
                onClick={() => setModifier((m) => m + 1)}
                className="w-7 h-7 bg-stone-800 hover:bg-stone-700 rounded text-xs font-bold text-stone-300"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Purpose Input */}
      <div>
        <input
          type="text"
          placeholder="판정 의도/행동 (예: 주루 2층에서 뛰어내려 착지, 맥을 짚어 내력 확인)..."
          value={actionDesc}
          onChange={(e) => setActionDesc(e.target.value)}
          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Roll Action & Display */}
      <div className="flex flex-col items-center justify-center p-6 bg-stone-950/80 border border-stone-800/80 rounded-xl space-y-3">
        <div className="relative flex items-center justify-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-inner transition-transform ${
              isRolling
                ? 'rotate-12 scale-105 border-amber-400 bg-amber-950/30'
                : lastOutcome
                ? 'border-amber-600/60 bg-stone-900'
                : 'border-stone-700 bg-stone-900'
            }`}
          >
            <span className="text-3xl font-black font-mono tracking-tighter text-stone-100">
              {lastRawRoll !== null ? lastRawRoll : `D${selectedSides}`}
            </span>
          </div>
          {lastRawRoll === 1 && (
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white shadow">
              FUMBLE
            </span>
          )}
          {lastRawRoll === 20 && (
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-stone-950 shadow">
              NAT 20
            </span>
          )}
        </div>

        {/* Calculation Result */}
        {lastRawRoll !== null && (
          <div className="text-center space-y-1">
            <div className="text-xs text-stone-400 font-mono">
              눈금 <span className="text-stone-100 font-bold">{lastRawRoll}</span>
              {modifier !== 0 && (
                <span>
                  {' '}
                  + 보정치 <span className="text-stone-100 font-bold">{modifier}</span>
                </span>
              )}{' '}
              ={' '}
              <span className="text-amber-400 font-bold text-sm">
                {lastRawRoll + modifier}
              </span>
              {selectedSides === 20 && <span> (vs DC {targetDC})</span>}
            </div>

            {lastOutcome && (
              <div
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${lastOutcome.colorClass} inline-block`}
              >
                {lastOutcome.label}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-stone-100 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Dices className="w-4 h-4" />
          <span>{isRolling ? 'CSPRNG 암호학적 난수 추출 중...' : `D${selectedSides} 주사위 투척`}</span>
        </button>

        {lastRawRoll !== null && onApplyRollToPrompt && (
          <button
            onClick={handleApply}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-amber-900/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>프롬프트 입력창에 판정 결과 주입</span>
          </button>
        )}
      </div>

      {/* Long-Term DC Uniform Distribution Graph (5 to 15) */}
      <div className="p-3 bg-stone-950/40 border border-stone-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5 font-medium">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            목표 DC(5~15) 균등 분포 통계
          </span>
          <span>누적 판정: {dcRecords.length}회</span>
        </div>

        <div className="grid grid-cols-11 gap-1 items-end h-16 pt-2">
          {Array.from({ length: 11 }, (_, i) => i + 5).map((dc) => {
            const count = distribution[dc] || 0;
            const maxCount = Math.max(...Object.values(distribution), 1);
            const heightPercent = Math.max((count / maxCount) * 100, 8);
            return (
              <div key={dc} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-mono text-stone-400">{count > 0 ? count : ''}</span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all ${
                    count > 0
                      ? 'bg-amber-600/80 border-t border-amber-400'
                      : 'bg-stone-800/40'
                  }`}
                />
                <span className="text-[10px] font-mono text-stone-500">{dc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-900/40 rounded-xl shadow-2xl overflow-hidden text-stone-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-2.5">
            <Dices className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-stone-100 text-sm">{t.modals.diceModalTitle}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
};
