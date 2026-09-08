import { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { UnknownWord } from '../types'

// ─── 浮层背景 ───
const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.25s ease;
`

// ─── 卡片 ───
const Card = styled.div<{ $visible: boolean }>`
  position: relative;
  width: min(540px, 90vw);
  max-height: 85vh;
  overflow-y: auto;
  padding: 32px 28px 24px;
  border-radius: 20px;
  background: rgba(30, 30, 50, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  color: #fff;
  transform: ${p => p.$visible ? 'scale(1)' : 'scale(0.92)'};
  transition: transform 0.25s ease;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`

// ─── 关闭按钮 ───
const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 80, 80, 0.35);
    color: #fff;
  }
`

// ─── 单词 ───
const WordTitle = styled.h2`
  font-size: 2.6rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 14px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

// ─── 发音按钮 ───
const PhoneticRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
`
const PlayBtn = styled.button`
  padding: 6px 18px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.5);
  }
`

// ─── 区域标题 ───
const SectionTitle = styled.h4`
  font-size: 13px;
  color: #aaa;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

// ─── 释义条目 ───
const TransItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  line-height: 1.5;

  .pos {
    color: #4cd964;
    font-weight: 600;
    min-width: 32px;
    flex-shrink: 0;
  }
`

// ─── 例句条目 ───
const SentenceItem = styled.div`
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  line-height: 1.6;

  .en {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    margin-bottom: 4px;
  }
  .cn {
    color: #999;
    font-size: 13px;
  }
`

// ─── Props ───
interface FlashcardProps {
  word: UnknownWord
  onClose: () => void
  onPlayPhonetic: (word: string, type: 'us' | 'uk') => void
}

export const Flashcard = ({ word, onClose, onPlayPhonetic }: FlashcardProps) => {
  const [visible, setVisible] = useState(false)

  // 入场动画：下一帧触发
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250) // 等动画结束
  }

  return (
    <Overlay $visible={visible} onClick={handleClose}>
      <Card $visible={visible} onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={handleClose} title="关闭">✕</CloseBtn>

        <WordTitle>{word.word}</WordTitle>

        <PhoneticRow>
          <PlayBtn onClick={() => onPlayPhonetic(word.word, 'us')}>
            🇺🇸 美式 {word.us || ''}
          </PlayBtn>
          <PlayBtn onClick={() => onPlayPhonetic(word.word, 'uk')}>
            🇬🇧 英式 {word.uk || ''}
          </PlayBtn>
        </PhoneticRow>

        {word.translations.length > 0 && (
          <>
            <SectionTitle>释义</SectionTitle>
            {word.translations.map((t, i) => (
              <TransItem key={i}>
                <span className="pos">{t.type}</span>
                <span>{t.translation}</span>
              </TransItem>
            ))}
          </>
        )}

        {word.sentences.length > 0 && (
          <>
            <SectionTitle style={{ marginTop: 16 }}>例句</SectionTitle>
            {word.sentences.map((s, i) => (
              <SentenceItem key={i}>
                <div className="en">{s.sentence}</div>
                <div className="cn">{s.translation}</div>
              </SentenceItem>
            ))}
          </>
        )}

        {word.phrases.length > 0 && (
          <>
            <SectionTitle style={{ marginTop: 16 }}>词组</SectionTitle>
            {word.phrases.map((p, i) => (
              <TransItem key={i}>
                <span>{p.phrase} — {p.translation}</span>
              </TransItem>
            ))}
          </>
        )}
      </Card>
    </Overlay>
  )
}
