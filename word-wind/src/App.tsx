import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { GlobalStyle } from './components/GlobalStyles'
import { gradientShift, pulse } from './components/animations'
import { WordCard } from './components/WordCard'
import { SettingsModal } from './components/SettingsModal'
import { UnknownWordsPage } from './components/UnknownWordsPage'
import { TestPage } from './components/TestPage'
import { supabase } from './utils/supabase'
import type { Translation, Phrase, Sentence, UnknownWord } from './types'

// 主容器
const Container = styled.div<{ bg: string; textColor: string }>`
  min-height: 100vh;
  background: ${props => props.bg};
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  font-family: 'Inter', sans-serif;
  color: ${props => props.textColor};
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.3) 0%, transparent 50%);
    animation: ${pulse} 8s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 80px 10px;
    align-items: stretch;
  }
`

// 下拉框容器
const Sidebar = styled.div`
  position: fixed;
  top: 80px;
  left: 20px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;

  @media (max-width: 768px) {
    position: static;
    width: 100%;
    margin-bottom: 20px;
    padding: 15px;
  }
`

// 下拉框样式
const Select = styled.select<{ textColor: string }>`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 16px;
  cursor: pointer;
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.3);
  }
`

// 显示框样式
const DisplayBox = styled.div<{ textColor: string }>`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 16px;
  margin-top: 10px;
  white-space: pre-line;
`

const PageSelectorForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`

const PageInput = styled.input<{ textColor: string }>`
  min-width: 0;
  width: 92px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 16px;

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: currentColor;
    opacity: 0.7;
  }
`

const PageJumpButton = styled.button<{ textColor: string }>`
  padding: 10px 12px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 16px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
  }
`

// 固定设置按钮
const FixedSettingsButton = styled.button<{ textColor: string }>`
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  &:focus {
    outline: none;
  }
  z-index: 10;

  @media (max-width: 768px) {
    position: static;
    padding: 8px 15px;
    font-size: 14px;
  }
`

// 生词本按钮 + 计数器
const VocabBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ff4757;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.4);
`

const ButtonWithBadge = styled.div`
  position: fixed;
  right: 20px;
  top: 150px;
  z-index: 100;
`

const UnknownWordsBtn = styled.button<{ textColor: string }>`
  position: relative;
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: ${p => p.textColor};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

// 测试按钮
const TestButton = styled(FixedSettingsButton)`
  top: 220px;
`

// 大箭头按钮
const ArrowButton = styled.button<{ textColor: string }>`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: ${props => props.textColor};
  font-size: 18px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.5;
  }
`

// 左箭头按钮
const LeftArrowButton = styled(ArrowButton)`
  position: fixed;
  bottom: 200px;
  left: 50px;
  z-index: 10;

  @media (max-width: 768px) {
    position: static;
  }
`

// 右箭头按钮
const RightArrowButton = styled(ArrowButton)`
  position: fixed;
  bottom: 200px;
  right: 50px;
  z-index: 10;

  @media (max-width: 768px) {
    position: static;
  }
`

// 箭头按钮容器（移动端）
const ArrowContainer = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
  }
`

// 按钮容器（移动端）
const ButtonContainer = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
  }
`

function App() {
  // 从localStorage获取词库位置
  const getStoredIndex = (library: string) => {
    const stored = localStorage.getItem(`wordLibrary_${library}`)
    return stored ? parseInt(stored, 10) : 1
  }

  // 存储词库位置到localStorage
  const storeIndex = (library: string, index: number) => {
    localStorage.setItem(`wordLibrary_${library}`, index.toString())
  }

  // 从localStorage获取当前词库
  const getStoredLibrary = () => {
    const stored = localStorage.getItem('selectedLibrary')
    return stored || 'cet4'
  }

  // 处理词库切换
  const handleLibraryChange = (value: string) => {
    setSelectedLibrary(value)

    const index = getStoredIndex(value)
    setCurrentIndex(index)
    setPageInput(index.toString())

    localStorage.setItem('selectedLibrary', value)
  }

  const [word, setWord] = useState('')
  const [us, setUs] = useState('')
  const [uk, setUk] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [bgIndex, setBgIndex] = useState(0)
  // 已学会单词（蚕食后的词保留在此，持久化存储）
  const [eatenWords, setEatenWords] = useState<UnknownWord[]>(
    () => {
      const data = localStorage.getItem('eatenWords')
      if (!data) return []
      return JSON.parse(data).map((item: any) => ({
        word: item.word ?? '',
        us: item.us ?? '',
        uk: item.uk ?? '',
        translations: item.translations ?? [],
        phrases: item.phrases ?? [],
        sentences: item.sentences ?? [],
      }))
    }
  )

  const [showSettings, setShowSettings] = useState(false)
  const [showUnknownPage, setShowUnknownPage] = useState(false)
  const [showTestPage, setShowTestPage] = useState(false)
  const [selectedLibrary, setSelectedLibrary] = useState(getStoredLibrary)
  const [currentIndex, setCurrentIndex] = useState(() => getStoredIndex(selectedLibrary))
  const [pageInput, setPageInput] = useState(() => getStoredIndex(selectedLibrary).toString())
  const [totalWords, setTotalWords] = useState(0)
  const [unknownWords, setUnknownWords] = useState<UnknownWord[]>(
    () => {
      const data = localStorage.getItem('unknownWords')
      if (!data) return []
      // 迁移旧格式（只有 word + translations）到新格式（完整数据）
      return JSON.parse(data).map((item: any) => ({
        word: item.word ?? '',
        us: item.us ?? '',
        uk: item.uk ?? '',
        translations: item.translations ?? [],
        phrases: item.phrases ?? [],
        sentences: item.sentences ?? [],
      }))
    }
  )
  const [isLoading, setIsLoading] = useState(false)
  const wordRequestLockedRef = useRef(false)
  const wordRequestIdRef = useRef(0)

  const clampIndex = useCallback(
    (index: number) => Math.min(Math.max(index, 1), Math.max(totalWords, 1)),
    [totalWords]
  )

  const backgrounds = [
    'linear-gradient(-45deg, #f5f5dc, #ede0c8, #f5f5dc)',
    'linear-gradient(-45deg, #f39c12, #e67e22, #e74c3c, #c0392b, #f39c12)',
    'linear-gradient(-45deg, #1abc9c, #16a085, #2ecc71, #27ae60, #1abc9c)',
    'linear-gradient(-45deg, #2196f3, #21cbf3, #2196f3)',
    'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e, #533483)'
  ]

  const themeColors = ['#f5f5dc', '#f39c12', '#1abc9c', '#2196f3', '#1a1a2e']

  const libraryNames: { [key: string]: string } = {
    chuzhong: '初中',
    gaozhong: '高中',
    cet4: 'CET4',
    cet6: 'CET6',
    kaoyan: '考研',
    toefl: '托福',
    sat: 'SAT'
  }

  useEffect(() => {
    const fetchTotalWords = async () => {
      const { count, error } = await supabase
        .from(selectedLibrary)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Failed to fetch total words:', error)
        return
      }

      setTotalWords(count as number)
    }

    fetchTotalWords()
  }, [selectedLibrary])

  useEffect(() => {
    const fetchWord = async () => {
      const requestId = wordRequestIdRef.current + 1
      wordRequestIdRef.current = requestId
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from(selectedLibrary)
          .select('*')
          .eq('id', currentIndex)
          .single()

        if (wordRequestIdRef.current !== requestId) {
          return
        }

        if (error) {
          console.error(error)
          return
        }

        setWord(data.word)
        setUs(data.us)
        setUk(data.uk)
        setTranslations(data.translations)
        setPhrases(data.phrases)
        setSentences(data.sentences)
      } finally {
        if (wordRequestIdRef.current === requestId) {
          setIsLoading(false)
          wordRequestLockedRef.current = false
        }
      }
    }

    fetchWord()
  }, [selectedLibrary, currentIndex])

  useEffect(() => {
    storeIndex(selectedLibrary, currentIndex)
  }, [selectedLibrary, currentIndex])

  useEffect(() => {
    setPageInput(currentIndex.toString())
  }, [currentIndex])

  // 音频播放 ref（有道词典在线 TTS，国内稳定访问）
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 通用发音函数（可按需传入单词，供 Flashcard 等组件使用）
  const playPhoneticForWord = (targetWord: string, type: 'us' | 'uk') => {
    if (!targetWord) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const voiceType = type === 'us' ? 0 : 1
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(targetWord)}&type=${voiceType}`
    const audio = new Audio(url)
    audio.volume = 0.8
    audioRef.current = audio
    audio.play().catch((e) => {
      console.warn('Word Wind audio play failed:', e.message)
      audioRef.current = null
    })
    audio.onended = () => {
      audioRef.current = null
    }
  }

  const playPhonetic = (type: 'us' | 'uk') => {
    playPhoneticForWord(word, type)
  }

  const handleDontKnow = (word: string, us: string, uk: string, translations: Translation[], phrases: Phrase[], sentences: Sentence[]) => {
    // 如果已在生词本中则跳过
    const existing: UnknownWord[] = JSON.parse(localStorage.getItem('unknownWords') || '[]')
    if (existing.some(w => w.word === word)) return
    existing.push({ word, us, uk, translations, phrases, sentences })
    localStorage.setItem('unknownWords', JSON.stringify(existing))
    setUnknownWords(existing)

    // 如果之前被蚕食过（在 eatenWords 中），重新加入时从 eaten 移除
    const eaten: UnknownWord[] = JSON.parse(localStorage.getItem('eatenWords') || '[]')
    const filteredEaten = eaten.filter(w => w.word !== word)
    if (filteredEaten.length !== eaten.length) {
      localStorage.setItem('eatenWords', JSON.stringify(filteredEaten))
      setEatenWords(filteredEaten)
    }
  }

  const handleRemoveUnknown = (index: number) => {
    const existing = [...unknownWords]
    const [removed] = existing.splice(index, 1)
    localStorage.setItem('unknownWords', JSON.stringify(existing))
    setUnknownWords(existing)

    // 蚕食：移到已学会列表
    if (removed) {
      const eaten: UnknownWord[] = JSON.parse(localStorage.getItem('eatenWords') || '[]')
      if (!eaten.some(w => w.word === removed.word)) {
        eaten.push(removed)
        localStorage.setItem('eatenWords', JSON.stringify(eaten))
        setEatenWords(eaten)
      }
    }
  }

  const changeWord = useCallback(
    (step: -1 | 1) => {
      if (isLoading || wordRequestLockedRef.current) {
        return
      }

      const nextIndex = clampIndex(currentIndex + step)

      if (nextIndex === currentIndex) {
        return
      }

      wordRequestLockedRef.current = true
      setCurrentIndex(nextIndex)
    },
    [clampIndex, currentIndex, isLoading]
  )

  const handlePageSelect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoading || wordRequestLockedRef.current || totalWords === 0) {
      return
    }

    const requestedIndex = Number.parseInt(pageInput, 10)
    if (Number.isNaN(requestedIndex)) {
      setPageInput(currentIndex.toString())
      return
    }

    const nextIndex = clampIndex(requestedIndex)
    setPageInput(nextIndex.toString())

    if (nextIndex === currentIndex) {
      return
    }

    wordRequestLockedRef.current = true
    setCurrentIndex(nextIndex)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName
      const isEditable =
        target?.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT'

      if (isEditable) {
        return
      }

      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault()
        changeWord(-1)
      }

      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault()
        changeWord(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeWord])

  // ─── 生词本页面（全页替换）───
  if (showUnknownPage) {
    return (
      <>
        <GlobalStyle />
        <UnknownWordsPage
          unknownWords={unknownWords}
          eatenWords={eatenWords}
          onBack={() => setShowUnknownPage(false)}
          onRemove={handleRemoveUnknown}
          onPlayPhonetic={playPhoneticForWord}
        />
      </>
    )
  }

  // ─── 测试页面（全页替换）───
  if (showTestPage) {
    return (
      <>
        <GlobalStyle />
        <TestPage
          unknownWords={unknownWords}
          onBack={() => setShowTestPage(false)}
        />
      </>
    )
  }

  // ─── 主页面 ───
  return (
    <>
      <GlobalStyle />
      <Container bg={backgrounds[bgIndex]} textColor={bgIndex === 0 ? '#000' : '#fff'}>
        <Sidebar>
          <Select
            textColor={bgIndex === 0 ? '#000' : '#fff'}
            value={selectedLibrary}
            onChange={e => handleLibraryChange(e.target.value)}
          >
            <option value="chuzhong">初中</option>
            <option value="gaozhong">高中</option>
            <option value="cet4">CET4</option>
            <option value="cet6">CET6</option>
            <option value="kaoyan">考研</option>
            <option value="toefl">托福</option>
            <option value="sat">SAT</option>
          </Select>
          <DisplayBox textColor={bgIndex === 0 ? '#000' : '#fff'}>
            {`当前是${libraryNames[selectedLibrary]}词库\n第${currentIndex}个，共${totalWords}个`}
          </DisplayBox>
          <PageSelectorForm onSubmit={handlePageSelect}>
            <PageInput
              textColor={bgIndex === 0 ? '#000' : '#fff'}
              type="number"
              min={1}
              max={totalWords || undefined}
              inputMode="numeric"
              value={pageInput}
              placeholder="页码"
              onChange={event => setPageInput(event.target.value)}
              aria-label="选择页码"
            />
            <PageJumpButton
              textColor={bgIndex === 0 ? '#000' : '#fff'}
              type="submit"
              disabled={isLoading || totalWords === 0}
            >
              跳转
            </PageJumpButton>
          </PageSelectorForm>
        </Sidebar>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <WordCard
            word={word}
            us={us}
            uk={uk}
            translations={translations}
            phrases={phrases}
            sentences={sentences}
            bgIndex={bgIndex}
            isLoading={isLoading}
            onSettingsClick={() => setShowSettings(true)}
            onPlayPhonetic={playPhonetic}
            onDontKnow={handleDontKnow}
          />
        </div>
        <ArrowContainer>
          <LeftArrowButton
            textColor={bgIndex === 0 ? '#000' : '#fff'}
            onClick={() => changeWord(-1)}
            disabled={isLoading || currentIndex <= 1}
          >
            ⬅️ 上一个
          </LeftArrowButton>
          <RightArrowButton
            textColor={bgIndex === 0 ? '#000' : '#fff'}
            onClick={() => changeWord(1)}
            disabled={isLoading || currentIndex >= totalWords}
          >
            下一个 ➡️
          </RightArrowButton>
        </ArrowContainer>
        <ButtonContainer>
          <FixedSettingsButton
            textColor={bgIndex === 0 ? '#000' : '#fff'}
            onClick={() => setShowSettings(true)}
          >
            设置&反馈
          </FixedSettingsButton>
          <ButtonWithBadge>
            <UnknownWordsBtn
              textColor={bgIndex === 0 ? '#000' : '#fff'}
              onClick={() => setShowUnknownPage(true)}
            >
              生词本
              {unknownWords.length > 0 && (
                <VocabBadge>{unknownWords.length > 99 ? '99+' : unknownWords.length}</VocabBadge>
              )}
            </UnknownWordsBtn>
          </ButtonWithBadge>
          <TestButton
            textColor={bgIndex === 0 ? '#000' : '#fff'}
            onClick={() => setShowTestPage(true)}
          >
            测试
          </TestButton>
        </ButtonContainer>
        <SettingsModal
          show={showSettings}
          onClose={() => setShowSettings(false)}
          backgrounds={backgrounds}
          themeColors={themeColors}
          onSelectBackground={index => setBgIndex(index)}
        />
      </Container>
    </>
  )
}

export default App
