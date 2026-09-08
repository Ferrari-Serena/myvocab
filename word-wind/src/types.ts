// 共享类型定义 — Word Wind

export interface Translation {
  type: string
  translation: string
}

export interface Phrase {
  phrase: string
  translation: string
}

export interface Sentence {
  sentence: string
  translation: string
}

/** 完整单词数据（存储在 localStorage unknownWords 中） */
export interface UnknownWord {
  word: string
  us: string
  uk: string
  translations: Translation[]
  phrases: Phrase[]
  sentences: Sentence[]
}

// ─── 测试题目类型 ───

export interface MultipleChoiceQuestion {
  id: number
  type: 'multiple-choice'
  targetWord: string
  definition: string // 中文释义
  options: string[] // 4 个英文选项（已打乱）
  correctIndex: number // 正确选项在 options 中的索引
  userAnswer: number | null // 用户选择的索引（null = 未作答）
}

export interface FillBlankQuestion {
  id: number
  type: 'fill-blank'
  targetWord: string
  sentenceWithBlank: string // 挖空后的句子
  sentenceTranslation: string // 中文翻译提示
  userAnswer: string // 用户输入的答案（空字符串 = 未作答）
}

export type TestQuestion = MultipleChoiceQuestion | FillBlankQuestion
