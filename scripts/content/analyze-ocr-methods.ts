import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

type Category = {
  id: string
  label: string
  pattern: RegExp
}

type CategoryCount = {
  total: number
  hsk2: number
  hsk3: number
  files: Set<string>
}

type FileStats = {
  path: string
  corpus: 'hsk2' | 'hsk3'
  kind: 'textbook' | 'workbook' | 'writing'
  lines: number
  headings: number
  images: number
  audioCueLines: number
  activityLines: number
}

const projectRoot = process.cwd()
const textbookRoot = resolve(projectRoot, 'docs/textbooks')
const reportPath = resolve(
  projectRoot,
  'docs/course-production/research/ocr-method-frequency.md',
)

const sectionCategories: Category[] = [
  { id: 'objectives', label: '目标', pattern: /目标|Objectives?/i },
  { id: 'warm-up', label: '热身', pattern: /热身|Warm[- ]?up/i },
  { id: 'text', label: '情境课文', pattern: /课文|Texts?/i },
  { id: 'vocabulary', label: '生词与词汇', pattern: /生词|词汇|New Words|Vocabulary/i },
  {
    id: 'language-focus',
    label: '语言点讲解',
    pattern: /小语讲堂|语法|注释|词语例释|Grammar|Notes?/i,
  },
  {
    id: 'practice',
    label: '综合练习',
    pattern: /综合练习|练习|Exercises?|Practice/i,
  },
  {
    id: 'classroom-task',
    label: '课堂与角色任务',
    pattern: /课堂活动|双人活动|小组活动|角色扮演|Pair Work|Group Work|Role[- ]?play/i,
  },
  { id: 'summary', label: '复习与小结', pattern: /学习小结|复习|Review|Summary/i },
  {
    id: 'pronunciation',
    label: '语音与拼音',
    pattern: /语音|声母|韵母|声调|拼音|音节|Pronunciation|Pinyin|Tones?/i,
  },
  { id: 'listening', label: '听力', pattern: /听力|Listening/i },
  { id: 'reading', label: '阅读', pattern: /阅读|Reading/i },
  { id: 'writing', label: '书写与写作', pattern: /书写|写作|Writing/i },
  { id: 'characters', label: '汉字', pattern: /汉字|Chinese Characters?/i },
  { id: 'culture', label: '文化', pattern: /文化|Culture/i },
]

const activityCategories: Category[] = [
  {
    id: 'single-choice',
    label: '选择',
    pattern: /选择|选出|请选择|choose|multiple choice/i,
  },
  {
    id: 'true-false',
    label: '判断',
    pattern: /判断.{0,8}(对错|正误|正确)|是否正确|true or false/i,
  },
  {
    id: 'cloze',
    label: '填空与补全',
    pattern: /填空|补全|完成句子|完成对话|fill in|complete the (sentence|dialogue)/i,
  },
  {
    id: 'ordering',
    label: '排序与组句',
    pattern: /连词成句|排序|排列|调整顺序|rearrange|put.{0,20}order/i,
  },
  {
    id: 'matching',
    label: '搭配与配对',
    pattern: /搭配|配对|相连|连线|match/i,
  },
  {
    id: 'short-answer',
    label: '回答问题',
    pattern: /回答.{0,12}问题|回答下列|answer the questions?/i,
  },
  {
    id: 'repeat-read',
    label: '跟读与朗读',
    pattern: /跟读|朗读|read aloud|listen and repeat/i,
  },
  {
    id: 'role-play',
    label: '角色扮演',
    pattern: /分角色|角色扮演|role[- ]?play/i,
  },
  { id: 'retell', label: '复述', pattern: /复述|retell/i },
  {
    id: 'sentence-creation',
    label: '造句与句子应用',
    pattern: /造句|仿写|模仿.{0,8}句|make sentences?|write sentences?/i,
  },
  {
    id: 'dictation-spelling',
    label: '听写与拼写',
    pattern: /听写|写出听到|标注声调|看拼音.{0,8}写汉字|dictation/i,
  },
  {
    id: 'free-response',
    label: '自由口语与写作',
    pattern: /看图.{0,12}(说|描述|写)|写一段|命题写作|短文写作|复述/i,
  },
  {
    id: 'image-task',
    label: '图片刺激任务',
    pattern: /看图|看图片|根据图片|图片.{0,8}(选择|回答|描述)|look at the pictures?/i,
  },
  {
    id: 'audio-task',
    label: '音频刺激任务',
    pattern: /听录音|听.{0,12}(选择|判断|回答|写出)|listen.{0,24}(choose|answer|write)/i,
  },
  {
    id: 'character-practice',
    label: '汉字笔画与书写',
    pattern: /笔画|笔顺|描写|摹写|偏旁|部件|stroke order|trace chinese/i,
  },
]

const markdownFiles = collectMarkdownFiles(textbookRoot)
const sectionCounts = createCountMap(sectionCategories)
const activityCounts = createCountMap(activityCategories)
const fileStats = markdownFiles.map((filePath) =>
  analyzeFile(filePath, sectionCounts, activityCounts),
)
const report = renderReport(fileStats, sectionCounts, activityCounts)

if (process.argv.includes('--check')) {
  const current = readFileSync(reportPath, 'utf8')
  if (current !== report) {
    throw new Error(
      'OCR method report is stale. Run `bun run content:analyze` to regenerate it.',
    )
  }
} else {
  mkdirSync(dirname(reportPath), { recursive: true })
  writeFileSync(reportPath, report)
  console.log(`Wrote ${relative(projectRoot, reportPath)}`)
}

function collectMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = resolve(directory, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(entryPath)
      return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
    })
    .sort(compareStrings)
}

function createCountMap(categories: Category[]) {
  return new Map<string, CategoryCount>(
    categories.map((category) => [
      category.id,
      { total: 0, hsk2: 0, hsk3: 0, files: new Set<string>() },
    ]),
  )
}

function analyzeFile(
  filePath: string,
  sections: Map<string, CategoryCount>,
  activities: Map<string, CategoryCount>,
): FileStats {
  const path = relative(projectRoot, filePath)
  const corpus = path.includes('/hsk3/') ? 'hsk3' : 'hsk2'
  const kind = path.toLowerCase().includes('workbook')
    ? 'workbook'
    : path.toLowerCase().includes('writing')
      ? 'writing'
      : 'textbook'
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)
  if (lines.at(-1) === '') lines.pop()

  let headings = 0
  let images = 0
  let audioCueLines = 0
  let activityLines = 0

  lines.forEach((rawLine) => {
    const line = normalizeLine(rawLine)
    const isHeading = /^#{1,6}\s/.test(rawLine)
    if (isHeading) headings += 1
    images += rawLine.match(/<img\b/gi)?.length ?? 0
    if (/听录音|音频|Listening|\bListen\b/i.test(line)) audioCueLines += 1

    if (isHeading) {
      countMatches(line, path, corpus, sectionCategories, sections)
    }

    if (isInstructionCandidate(rawLine, line)) {
      const matched = countMatches(
        line,
        path,
        corpus,
        activityCategories,
        activities,
      )
      if (matched) activityLines += 1
    }
  })

  return {
    path,
    corpus,
    kind,
    lines: lines.length,
    headings,
    images,
    audioCueLines,
    activityLines,
  }
}

function normalizeLine(line: string) {
  return line
    .replace(/^#{1,6}\s*/, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isInstructionCandidate(rawLine: string, line: string) {
  if (!line || line.length > 220) return false
  if (/^\s*(<table|<tr|<td|<div|<img)/i.test(rawLine)) return false
  return true
}

function countMatches(
  line: string,
  path: string,
  corpus: 'hsk2' | 'hsk3',
  categories: Category[],
  counts: Map<string, CategoryCount>,
) {
  let matched = false
  categories.forEach((category) => {
    if (!category.pattern.test(line)) return
    const count = counts.get(category.id)
    if (!count) return
    count.total += 1
    count[corpus] += 1
    count.files.add(path)
    matched = true
  })
  return matched
}

function renderReport(
  files: FileStats[],
  sections: Map<string, CategoryCount>,
  activities: Map<string, CategoryCount>,
) {
  const totals = files.reduce(
    (result, file) => ({
      files: result.files + 1,
      lines: result.lines + file.lines,
      headings: result.headings + file.headings,
      images: result.images + file.images,
      audioCueLines: result.audioCueLines + file.audioCueLines,
      activityLines: result.activityLines + file.activityLines,
    }),
    {
      files: 0,
      lines: 0,
      headings: 0,
      images: 0,
      audioCueLines: 0,
      activityLines: 0,
    },
  )

  return `# OCR 教材教学方法频次报告

> 本报告由 \`bun run content:analyze\` 根据 \`docs/textbooks/\` 自动生成。只统计归一化教学栏目和学习动作，不复制教材正文、原题或图片内容。

## 1. 语料概况

| 指标 | 数量 |
|---|---:|
| Markdown 文件 | ${totals.files} |
| 文本行 | ${totals.lines} |
| Markdown 标题 | ${totals.headings} |
| OCR 图片引用 | ${totals.images} |
| 音频提示行 | ${totals.audioCueLines} |
| 匹配到学习动作的行 | ${totals.activityLines} |

\`hsk2\` 表示旧版标准教程样本，\`hsk3\` 表示新版 HSK Course 样本。中英双语重复、OCR 漏标标题和识别错误会影响绝对数量，因此频次只用于课程分类与交互优先级判断。

## 2. 教学栏目

只统计 Markdown 标题，降低正文和 HTML 表格造成的误判。

${renderCategoryTable(sectionCategories, sections)}

## 3. 学习动作

统计长度不超过 220 字且不是 HTML 表格/图片节点的指令候选行。同一行可能同时属于输入形式和作答形式，例如“听录音选择答案”会同时计入音频刺激和选择。

${renderCategoryTable(activityCategories, activities)}

## 4. 文件密度

| 文件 | 语料 | 类型 | 行数 | 标题 | 图片引用 | 音频提示行 | 学习动作行 |
|---|---|---|---:|---:|---:|---:|---:|
${files
  .map(
    (file) =>
      `| \`${file.path.replace('docs/textbooks/', '')}\` | ${file.corpus} | ${file.kind} | ${file.lines} | ${file.headings} | ${file.images} | ${file.audioCueLines} | ${file.activityLines} |`,
  )
  .join('\n')}

## 5. 使用限制

- 频次不是版权许可，也不是课程内容来源。
- 不根据单个教材栏目直接创建组件；先归并为稳定学习动作。
- 不把教材原文、题目、图片 URL 或音频引用写入课程 JSON。
- 课程类型和难度顺序仍需官方大纲与人工教研复核。
- 新增或更新 OCR 文件后必须重新生成报告并审核分类规则。
`
}

function renderCategoryTable(
  categories: Category[],
  counts: Map<string, CategoryCount>,
) {
  return [
    '| 归一化类别 | 总命中 | hsk2 | hsk3 | 涉及文件 |',
    '|---|---:|---:|---:|---:|',
    ...categories
      .map((category) => ({ category, count: counts.get(category.id) }))
      .sort((left, right) => {
        const difference = (right.count?.total ?? 0) - (left.count?.total ?? 0)
        return difference || compareStrings(left.category.id, right.category.id)
      })
      .map(({ category, count }) => {
        if (!count) throw new Error(`Missing count for ${category.id}`)
        return `| ${category.label} | ${count.total} | ${count.hsk2} | ${count.hsk3} | ${count.files.size} |`
      }),
  ].join('\n')
}

function compareStrings(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0
}
