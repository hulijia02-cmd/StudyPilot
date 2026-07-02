import { buildPracticeAgentMessages } from "@/lib/ai/prompts/practice";
import {
  practiceAgentResponseSchema,
  practiceScoreResponseSchema,
  type PracticeAgentRequest,
  type PracticeAgentResponse,
  type PracticeQuestion,
  type PracticeScoreResponse,
  type PracticeSubmission,
} from "@/lib/ai/schemas/practice";

export const PRACTICE_AGENT_NAME = "practice-agent";

export async function runPracticeAgent(
  input: PracticeAgentRequest,
): Promise<PracticeAgentResponse> {
  const messages = buildPracticeAgentMessages(input);
  void messages;

  const response = createDeterministicPracticeResponse(input);
  return practiceAgentResponseSchema.parse(response);
}

export function scorePracticeSubmission(
  submission: PracticeSubmission,
): PracticeScoreResponse {
  const results = submission.questions.map((question) => {
    const userAnswer = submission.answers[question.id];
    return scoreQuestion(question, userAnswer);
  });
  const totalScore = results.reduce((sum, item) => sum + item.score, 0);
  const totalPoints = results.reduce((sum, item) => sum + item.maxScore, 0);
  const accuracy = totalPoints === 0 ? 0 : totalScore / totalPoints;

  return practiceScoreResponseSchema.parse({
    agent: PRACTICE_AGENT_NAME,
    version: "1.0",
    topic: submission.topic,
    totalScore,
    totalPoints,
    accuracy,
    results,
    nextAction: {
      type: accuracy >= 0.8 ? "continue_learning" : "review_mistakes",
      label: accuracy >= 0.8 ? "继续学习下一个知识点" : "复盘错题并生成变式练习",
    },
  });
}

function createDeterministicPracticeResponse(
  input: PracticeAgentRequest,
): PracticeAgentResponse {
  const topic = input.topic.trim();
  const questions = createArduinoQuestions(topic, input).filter((question) =>
    input.questionTypes.includes(question.type),
  );

  return {
    agent: PRACTICE_AGENT_NAME,
    version: "1.0",
    topic,
    subject: input.subject,
    questions,
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
    autoScoringSupported: true,
  };
}

function createArduinoQuestions(
  topic: string,
  input: PracticeAgentRequest,
): PracticeQuestion[] {
  return [
    {
      id: "q1-single-choice",
      type: "single_choice",
      topic,
      difficulty: input.difficulty,
      question: "在 Arduino Blink 程序中，loop 函数的作用是什么？",
      options: [
        "A. 只在程序开始时运行一次",
        "B. 一直重复运行里面的代码",
        "C. 用来安装 Arduino IDE",
        "D. 用来给电脑供电",
      ],
      points: 10,
      standardAnswer: {
        value: "B",
        explanation: "loop 会不断重复执行，是 Arduino 持续控制硬件的核心。",
      },
      scoringRule: {
        method: "exact_match",
        maxScore: 10,
        keywords: [],
        requiredIncludes: [],
        rubric: [],
      },
    },
    {
      id: "q2-fill-blank",
      type: "fill_blank",
      topic,
      difficulty: input.difficulty,
      question: "在 Arduino 中，delay(1000) 表示程序暂停 ____ 秒。",
      points: 10,
      standardAnswer: {
        value: "1",
        explanation: "delay 的单位是毫秒，1000 毫秒等于 1 秒。",
      },
      scoringRule: {
        method: "exact_match",
        maxScore: 10,
        keywords: ["1", "一"],
        requiredIncludes: [],
        rubric: [],
      },
    },
    {
      id: "q3-true-false",
      type: "true_false",
      topic,
      difficulty: input.difficulty,
      question: "判断题：setup 函数会像 loop 一样一直重复运行。",
      points: 10,
      standardAnswer: {
        value: false,
        explanation: "setup 只在程序启动时运行一次，loop 才会反复运行。",
      },
      scoringRule: {
        method: "boolean_match",
        maxScore: 10,
        keywords: [],
        requiredIncludes: [],
        rubric: [],
      },
    },
    {
      id: "q4-short-answer",
      type: "short_answer",
      topic,
      difficulty: input.difficulty,
      question: "请用零基础能听懂的话解释 pinMode 的作用。",
      points: 20,
      standardAnswer: {
        value: "pinMode 用来告诉 Arduino 某个引脚接下来是作为输入还是输出使用。",
        explanation: "回答中应包含“告诉 Arduino”“引脚”“输入或输出”等核心意思。",
      },
      scoringRule: {
        method: "keyword_match",
        maxScore: 20,
        keywords: ["pinMode", "设置", "引脚", "输入", "输出"],
        requiredIncludes: [],
        rubric: [
          "说清楚 pinMode 作用：8 分",
          "提到设置引脚：4 分",
          "能区分输入和输出：8 分",
        ],
      },
    },
    {
      id: "q5-coding",
      type: "coding",
      topic,
      difficulty: input.difficulty,
      question: "写一段 Arduino 代码，让 13 号引脚的 LED 每 1 秒亮一次、灭一次。",
      points: 30,
      standardAnswer: {
        value:
          "void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }",
        explanation:
          "代码需要包含 setup、loop、pinMode(13, OUTPUT)、digitalWrite 和 delay(1000)。",
      },
      scoringRule: {
        method: "code_static_check",
        maxScore: 30,
        keywords: [],
        requiredIncludes: [
          "void setup",
          "void loop",
          "pinMode",
          "13",
          "OUTPUT",
          "digitalWrite",
          "HIGH",
          "LOW",
          "delay(1000)",
        ],
        rubric: [
          "包含 setup 和 loop 结构：8 分",
          "正确设置 13 号引脚输出：7 分",
          "正确使用 HIGH/LOW 控制亮灭：8 分",
          "使用 delay(1000) 控制 1 秒节奏：7 分",
        ],
      },
    },
  ];
}

function scoreQuestion(question: PracticeQuestion, userAnswer: string | boolean | undefined) {
  const maxScore = question.scoringRule.maxScore;

  if (userAnswer === undefined) {
    return {
      questionId: question.id,
      type: question.type,
      score: 0,
      maxScore,
      isCorrect: false,
      feedback: "未提交答案。",
    };
  }

  if (question.scoringRule.method === "boolean_match") {
    const isCorrect = userAnswer === question.standardAnswer.value;
    return scoreResult(question, isCorrect ? maxScore : 0, isCorrect);
  }

  const normalizedAnswer = normalizeAnswer(String(userAnswer));
  const standardAnswer = normalizeAnswer(String(question.standardAnswer.value));

  if (question.scoringRule.method === "exact_match") {
    const acceptableAnswers = [
      standardAnswer,
      ...question.scoringRule.keywords.map(normalizeAnswer),
    ];
    const isCorrect = acceptableAnswers.includes(normalizedAnswer);
    return scoreResult(question, isCorrect ? maxScore : 0, isCorrect);
  }

  if (question.scoringRule.method === "keyword_match") {
    const matchedCount = question.scoringRule.keywords.filter((keyword) =>
      normalizedAnswer.includes(normalizeAnswer(keyword)),
    ).length;
    const score = Math.round((matchedCount / question.scoringRule.keywords.length) * maxScore);
    return scoreResult(question, score, score === maxScore);
  }

  if (question.scoringRule.method === "code_static_check") {
    const matchedCount = question.scoringRule.requiredIncludes.filter((token) =>
      normalizedAnswer.includes(normalizeAnswer(token)),
    ).length;
    const score = Math.round(
      (matchedCount / question.scoringRule.requiredIncludes.length) * maxScore,
    );
    return scoreResult(question, score, score >= maxScore * 0.9);
  }

  return scoreResult(question, 0, false);
}

function scoreResult(question: PracticeQuestion, score: number, isCorrect: boolean) {
  return {
    questionId: question.id,
    type: question.type,
    score,
    maxScore: question.scoringRule.maxScore,
    isCorrect,
    feedback: isCorrect
      ? `回答正确。${question.standardAnswer.explanation}`
      : `需要复习。标准答案：${String(question.standardAnswer.value)}。${question.standardAnswer.explanation}`,
  };
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[。；;，,]/g, "");
}
