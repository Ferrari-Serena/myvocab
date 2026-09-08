import { useState } from 'react'
import styled from 'styled-components'
import type { UnknownWord, TestQuestion } from '../types'
import { generateMultipleChoiceQuestions, generateFillBlankQuestions } from '../utils/testGenerator'

// ─── 页面 ───
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
  top: 0; left: 0; right: 0;
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
  transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
`

// ─── 模式切换 ───
const ModeToggle = styled.div`
  display: flex;
  gap: 8px;
`
const ModeBtn = styled.button<{ $active: boolean }>`
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid ${p => p.$active ? '#667eea' : 'rgba(255,255,255,0.15)'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)'};
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.85; }
`

// ─── 题目区域 ───
const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const QuestionCard = styled.div<{ $correct?: boolean | null }>`
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid ${p =>
    p.$correct === true ? '#4cd964' :
    p.$correct === false ? '#ff4757' :
    'rgba(255, 255, 255, 0.1)'};
  transition: border-color 0.3s;
`

const QNum = styled.span`
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`

const QStem = styled.div`
  font-size: 18px;
  color: #fff;
  margin: 10px 0 16px;
  line-height: 1.6;
`

const Hint = styled.div`
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
`

// ─── 选项 ───
const OptionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const OptionBtn = styled.button<{ $selected: boolean; $revealed: boolean; $isCorrect: boolean }>`
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid ${p => {
    if (p.$revealed && p.$isCorrect) return '#4cd964'
    if (p.$revealed && p.$selected && !p.$isCorrect) return '#ff4757'
    if (p.$selected) return '#667eea'
    return 'rgba(255,255,255,0.12)'
  }};
  background: ${p => {
    if (p.$revealed && p.$isCorrect) return 'rgba(76, 217, 100, 0.15)'
    if (p.$revealed && p.$selected && !p.$isCorrect) return 'rgba(255, 71, 87, 0.15)'
    if (p.$selected) return 'rgba(102, 126, 234, 0.2)'
    return 'rgba(255,255,255,0.04)'
  }};
  color: #ddd;
  font-size: 15px;
  cursor: ${p => p.$revealed ? 'default' : 'pointer'};
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: ${p => !p.$revealed ? 'rgba(255,255,255,0.08)' : undefined};
  }
`

// ─── 填空输入 ───
const BlankInput = styled.input<{ $revealed: boolean; $isCorrect: boolean }>`
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid ${p =>
    p.$revealed
      ? p.$isCorrect ? '#4cd964' : '#ff4757'
      : 'rgba(255,255,255,0.15)'};
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: #667eea; }
`

const CorrectAnswer = styled.div`
  color: #4cd964;
  font-size: 13px;
  margin-top: 6px;
`

// ─── 提交区域 ───
const SubmitArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0 40px;
`

const SubmitBtn = styled.button`
  padding: 14px 60px;
  border: none;
  border-radius: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); }
  &:disabled { opacity: 0.5; cursor: default; transform: none; }
`

const ScoreDisplay = styled.div`
  font-size: 24px;
  color: #fff;
  font-weight: 700;

  span { color: #4cd964; }
`

// ─── 空/提示状态 ───
const EmptyState = styled.div`
  text-align: center;
  color: #888;
  font-size: 18px;
  padding: 80px 20px;

  .icon { font-size: 48px; display: block; margin-bottom: 12px; }
`

// ─── Props ───
interface TestPageProps {
  unknownWords: UnknownWord[]
  onBack: () => void
}

export const TestPage = ({ unknownWords, onBack }: TestPageProps) => {
  const [mode, setMode] = useState<'multiple-choice' | 'fill-blank'>('multiple-choice')
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)

  // 按模式生成题目（切换模式时重新生成）
  const [questions, setQuestions] = useState<TestQuestion[]>(() =>
    generateMultipleChoiceQuestions(unknownWords)
  )

  const switchMode = (newMode: 'multiple-choice' | 'fill-blank') => {
    setMode(newMode)
    setSubmitted(false)
    setScore(null)
    if (newMode === 'multiple-choice') {
      setQuestions(generateMultipleChoiceQuestions(unknownWords))
    } else {
      setQuestions(generateFillBlankQuestions(unknownWords))
    }
  }

  // 选择题：更新用户选择
  const handleChoiceSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIndex || q.type !== 'multiple-choice') return q
        return { ...q, userAnswer: optIndex }
      })
    )
  }

  // 填空题：更新用户输入
  const handleBlankInput = (qIndex: number, value: string) => {
    if (submitted) return
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIndex || q.type !== 'fill-blank') return q
        return { ...q, userAnswer: value }
      })
    )
  }

  // 提交评分
  const handleSubmit = () => {
    let correct = 0
    for (const q of questions) {
      if (q.type === 'multiple-choice') {
        if (q.userAnswer === q.correctIndex) correct++
      } else {
        if (q.userAnswer.trim().toLowerCase() === q.targetWord.toLowerCase()) correct++
      }
    }
    setScore({ correct, total: questions.length })
    setSubmitted(true)
  }

  // 全部作答的判定
  const allAnswered = questions.every(q =>
    q.type === 'multiple-choice'
      ? q.userAnswer !== null
      : q.userAnswer.trim().length > 0
  )

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={onBack}>← 返回</BackBtn>
        <ModeToggle>
          <ModeBtn
            $active={mode === 'multiple-choice'}
            onClick={() => switchMode('multiple-choice')}
          >
            看释义选单词
          </ModeBtn>
          <ModeBtn
            $active={mode === 'fill-blank'}
            onClick={() => switchMode('fill-blank')}
          >
            看句子填单词
          </ModeBtn>
        </ModeToggle>
        <div /> {/* spacer */}
      </TopBar>

      <Content>
        {questions.length === 0 ? (
          <EmptyState>
            <span className="icon">📝</span>
            {mode === 'fill-blank'
              ? '生词中没有带例句的，无法生成填空题。请先添加一些有例句的单词。'
              : '还没有生词，请先在主页标记一些不认识的单词。'}
          </EmptyState>
        ) : (
          <>
            {questions.map((q, qi) => (
              <QuestionCard
                key={q.id}
                $correct={
                  submitted
                    ? q.type === 'multiple-choice'
                      ? q.userAnswer === q.correctIndex
                      : q.userAnswer.trim().toLowerCase() === q.targetWord.toLowerCase()
                    : null
                }
              >
                <QNum>第 {qi + 1} 题</QNum>

                {q.type === 'multiple-choice' ? (
                  <>
                    <QStem>{q.definition}</QStem>
                    <OptionGrid>
                      {q.options.map((opt, oi) => {
                        const isSelected = q.userAnswer === oi
                        const isCorrect = oi === q.correctIndex
                        const label = String.fromCharCode(65 + oi) // A, B, C, D
                        return (
                          <OptionBtn
                            key={oi}
                            $selected={isSelected}
                            $revealed={submitted}
                            $isCorrect={isCorrect}
                            onClick={() => handleChoiceSelect(qi, oi)}
                          >
                            {label}. {opt}
                            {submitted && isCorrect && ' ✓'}
                            {submitted && isSelected && !isCorrect && ' ✗'}
                          </OptionBtn>
                        )
                      })}
                    </OptionGrid>
                  </>
                ) : (
                  <>
                    <QStem>{q.sentenceWithBlank}</QStem>
                    <Hint>提示：{q.sentenceTranslation}</Hint>
                    <BlankInput
                      type="text"
                      placeholder="输入单词..."
                      value={q.userAnswer}
                      $revealed={submitted}
                      $isCorrect={
                        q.userAnswer.trim().toLowerCase() === q.targetWord.toLowerCase()
                      }
                      onChange={e => handleBlankInput(qi, e.target.value)}
                      disabled={submitted}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {submitted &&
                      q.userAnswer.trim().toLowerCase() !== q.targetWord.toLowerCase() && (
                        <CorrectAnswer>
                          正确答案：{q.targetWord}
                        </CorrectAnswer>
                      )}
                  </>
                )}
              </QuestionCard>
            ))}

            <SubmitArea>
              {!submitted ? (
                <SubmitBtn onClick={handleSubmit} disabled={!allAnswered}>
                  提交 ({questions.filter(q =>
                    q.type === 'multiple-choice' ? q.userAnswer !== null : q.userAnswer.trim().length > 0
                  ).length}/{questions.length} 已答)
                </SubmitBtn>
              ) : (
                <>
                  <ScoreDisplay>
                    得分：<span>{score!.correct}</span> / {score!.total}
                  </ScoreDisplay>
                  <SubmitBtn onClick={() => switchMode(mode)}>
                    重新出题
                  </SubmitBtn>
                </>
              )}
            </SubmitArea>
          </>
        )}
      </Content>
    </Page>
  )
}
