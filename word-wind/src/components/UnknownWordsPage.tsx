import { useCallback, useState, useRef } from 'react'
import styled from 'styled-components'
import { Flashcard } from './Flashcard'
import type { UnknownWord } from '../types'

// ─── 整体页面 ───
const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e, #533483);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: 100px 20px 80px;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`

// ─── 顶栏 ───
const TopBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
`

const CountLabel = styled.span`
  color: #999;
  font-size: 14px;
`

// ─── 区域分隔 ───
const SectionDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 24px auto 12px;
  padding: 0 8px;
  color: #888;
  font-size: 13px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
`

// ─── 词网格 ───
const WordGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
`

const WordChip = styled.div<{ $fading: boolean }>`
  font-size: 24px;
  padding: 8px 15px;
  border-radius: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  user-select: none;
  transition: all 0.35s ease;
  opacity: ${p => p.$fading ? 0.25 : 1};

  &:hover {
    background: ${p => p.$fading ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.14)'};
    transform: ${p => p.$fading ? 'scale(1)' : 'scale(1.05)'};
  }
`

const EatenChip = styled.div`
  font-size: 24px;
  padding: 8px 15px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: default;
  user-select: none;
  transition: all 0.35s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

// ─── 空状态 ───
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #888;
  font-size: 18px;
  gap: 12px;

  .icon { font-size: 48px; }
`

// ─── Props ───
interface UnknownWordsPageProps {
  unknownWords: UnknownWord[]
  eatenWords: UnknownWord[]
  onBack: () => void
  onRemove: (index: number) => void
  onPlayPhonetic: (word: string, type: 'us' | 'uk') => void
}

export const UnknownWordsPage = ({
  unknownWords,
  eatenWords,
  onBack,
  onRemove,
  onPlayPhonetic,
}: UnknownWordsPageProps) => {
  const [flashcardWord, setFlashcardWord] = useState<UnknownWord | null>(null)
  const [fadingIndices, setFadingIndices] = useState<Set<number>>(new Set())
  const fadeTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const handleRightClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault()
      if (fadingIndices.has(index)) return

      // 触发淡化动画
      setFadingIndices(prev => {
        const next = new Set(prev)
        next.add(index)
        return next
      })

      // 动画结束后执行蚕食（移入 eatenWords）
      const timer = setTimeout(() => {
        onRemove(index)
        setFadingIndices(prev => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
        fadeTimers.current.delete(index)
      }, 350)

      fadeTimers.current.set(index, timer)
    },
    [fadingIndices, onRemove]
  )

  const totalCount = unknownWords.length + eatenWords.length

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={onBack}>← 返回</BackBtn>
        <CountLabel>
          生词 {unknownWords.length} 个{ eatenWords.length > 0 ? `  ·  已学会 ${eatenWords.length} 个` : '' }
        </CountLabel>
        <div />
      </TopBar>

      {totalCount === 0 ? (
        <EmptyState>
          <span className="icon">📭</span>
          <span>还没有生词</span>
          <span style={{ fontSize: 14 }}>回到主页，遇到不认识的单词点击"加入生词本"按钮来添加</span>
        </EmptyState>
      ) : (
        <>
          {/* 生词区 */}
          {unknownWords.length > 0 && (
            <WordGrid>
              {unknownWords.map((w, i) => (
                <WordChip
                  key={`u-${w.word}-${i}`}
                  $fading={fadingIndices.has(i)}
                  onClick={() => {
                    if (!fadingIndices.has(i)) setFlashcardWord(w)
                  }}
                  onContextMenu={e => handleRightClick(e, i)}
                  title="左键查看详情 | 右键标记为已学会"
                >
                  {w.word}
                </WordChip>
              ))}
            </WordGrid>
          )}

          {/* 已学会区（蚕食后的词，淡色保留） */}
          {eatenWords.length > 0 && (
            <>
              <SectionDivider>已学会 · {eatenWords.length} 个</SectionDivider>
              <WordGrid>
                {eatenWords.map((w, i) => (
                  <EatenChip key={`e-${w.word}-${i}`} title="已学会">
                    {w.word}
                  </EatenChip>
                ))}
              </WordGrid>
            </>
          )}
        </>
      )}

      {flashcardWord && (
        <Flashcard
          word={flashcardWord}
          onClose={() => setFlashcardWord(null)}
          onPlayPhonetic={onPlayPhonetic}
        />
      )}
    </Page>
  )
}
