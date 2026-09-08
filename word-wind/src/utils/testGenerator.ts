import type { UnknownWord, MultipleChoiceQuestion, FillBlankQuestion } from '../types'

/** Fisher-Yates 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 计算应出题量：根据词汇量 10-20 题，允许同一单词出现多题 */
function calcCount(poolSize: number): number {
  if (poolSize < 1) return 0
  if (poolSize <= 5) return Math.min(10, poolSize)
  return Math.min(20, Math.max(10, poolSize))
}

/** 随机采样 count 个单词（允许重复） */
function sampleWords(pool: UnknownWord[], count: number): UnknownWord[] {
  if (pool.length === 0) return []
  const result: UnknownWord[] = []
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

/** 生成选择题 */
export function generateMultipleChoiceQuestions(
  unknownWords: UnknownWord[],
  providedCount?: number
): MultipleChoiceQuestion[] {
  const count = providedCount ?? calcCount(unknownWords.length)
  if (unknownWords.length === 0 || count === 0) return []

  const targets = sampleWords(unknownWords, count)

  return targets.map((target, id) => {
    // 取第一个释义作为题干
    const firstTrans = target.translations[0]
    const definition = firstTrans
      ? `${firstTrans.type ? firstTrans.type + ' ' : ''}${firstTrans.translation}`
      : target.word

    // 干扰池：从其他单词选取
    const distractorPool = unknownWords.filter(w => w.word !== target.word)
    const shuffledPool = shuffle(distractorPool)

    // 取 3 个干扰词
    const distractors: string[] = []
    for (const w of shuffledPool) {
      if (distractors.length >= 3) break
      if (!distractors.includes(w.word)) {
        distractors.push(w.word)
      }
    }

    // 如果干扰词不够，补随机单词（从池中再抽）
    while (distractors.length < 3 && shuffledPool.length > 0) {
      const extra = shuffledPool[distractors.length % shuffledPool.length]
      if (!distractors.includes(extra.word)) {
        distractors.push(extra.word)
      } else {
        break // 无法再增加
      }
    }

    // 构建选项数组并打乱
    const options = [target.word, ...distractors]
    const shuffledOptions = shuffle(options)
    const correctIndex = shuffledOptions.indexOf(target.word)

    return {
      id,
      type: 'multiple-choice',
      targetWord: target.word,
      definition,
      options: shuffledOptions,
      correctIndex,
      userAnswer: null,
    }
  })
}

/**
 * 在句子中挖掉单词（不区分大小写，匹配单词边界）
 */
function blankOutWord(sentence: string, word: string): string {
  // 转义正则特殊字符，使用单词边界匹配
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
  return sentence.replace(regex, '______')
}

/** 生成填空题 */
export function generateFillBlankQuestions(
  unknownWords: UnknownWord[],
  providedCount?: number
): FillBlankQuestion[] {
  // 只筛选有例句的单词
  const withSentences = unknownWords.filter(w => w.sentences.length > 0)
  if (withSentences.length === 0) return []

  const count = providedCount ?? calcCount(withSentences.length)
  const targets = sampleWords(withSentences, count)

  return targets.map((target, id) => {
    // 随机选一个例句
    const sentence = target.sentences[Math.floor(Math.random() * target.sentences.length)]

    return {
      id,
      type: 'fill-blank',
      targetWord: target.word,
      sentenceWithBlank: blankOutWord(sentence.sentence, target.word),
      sentenceTranslation: sentence.translation,
      userAnswer: '',
    }
  })
}
