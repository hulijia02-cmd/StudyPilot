import {
  learningPlannerResponseSchema,
  type LearningPlannerRequest,
  type LearningPlannerResponse,
} from "@/lib/ai/schemas/learning-planner";
import { buildLearningPlannerMessages } from "@/lib/ai/prompts/learning-planner";

export const LEARNING_PLANNER_AGENT_NAME = "learning-planner-agent";

export async function runLearningPlannerAgent(
  input: LearningPlannerRequest,
): Promise<LearningPlannerResponse> {
  const messages = buildLearningPlannerMessages(input);
  void messages;

  const plan = createDeterministicPlannerResponse(input);
  return learningPlannerResponseSchema.parse(plan);
}

function createDeterministicPlannerResponse(
  input: LearningPlannerRequest,
): LearningPlannerResponse {
  const weeklyHours = input.weeklyHours;
  const estimatedCompletionWeeks = input.deadlineWeeks ?? estimateArduinoWeeks(weeklyHours);
  const assumedCurrentLevel = normalizeLevel(input.currentLevel);
  const targetOutcome =
    input.targetOutcome ??
    "能独立使用 Arduino 完成传感器读取、执行器控制，并做出一个可演示的交互硬件小项目";

  return {
    agent: LEARNING_PLANNER_AGENT_NAME,
    version: "1.0",
    goalAnalysis: {
      normalizedGoal: "系统学习 Arduino，并完成一个可演示的入门硬件项目",
      domain: "Arduino / 入门嵌入式开发 / 创客硬件",
      assumedCurrentLevel,
      targetOutcome,
      constraints: [
        `每周学习时间约 ${weeklyHours} 小时`,
        "默认用户没有系统电子电路和 C/C++ 编程基础",
        "学习路径需要以动手实践为主，理论只保留完成项目所需部分",
      ],
      learnerRisks: [
        "一开始过度学习电路理论，导致迟迟不能做出作品",
        "不理解面包板、电阻、极性等基础概念，容易接线错误",
        "代码和硬件同时出错时，缺少排查顺序",
      ],
    },
    learningRoute: {
      title: "Arduino 从零到项目实战学习路线",
      phases: [
        {
          id: "phase-1",
          title: "建立 Arduino 入门直觉",
          objective: "理解 Arduino 是什么，完成开发环境搭建，并让第一个 LED 正常闪烁。",
          durationWeeks: 1,
          knowledgeNodes: [
            {
              id: "arduino-board-basics",
              title: "Arduino 板卡与开发环境",
              description: "认识 Arduino Uno、USB 连接、IDE、端口、上传流程。",
              difficulty: 1,
              prerequisites: [],
            },
            {
              id: "blink-first-program",
              title: "Blink 第一个程序",
              description: "理解 setup、loop、pinMode、digitalWrite、delay。",
              difficulty: 1,
              prerequisites: ["Arduino 板卡与开发环境"],
            },
          ],
          deliverable: "完成 LED 闪烁，并能解释代码每一行的作用。",
        },
        {
          id: "phase-2",
          title: "掌握基础电路与输入输出",
          objective: "理解数字输入输出、基础电路安全、按钮和 LED 控制。",
          durationWeeks: 2,
          knowledgeNodes: [
            {
              id: "basic-circuit",
              title: "基础电路与面包板",
              description: "理解电源、GND、电阻、面包板连通规则和 LED 极性。",
              difficulty: 2,
              prerequisites: ["Blink 第一个程序"],
            },
            {
              id: "digital-io",
              title: "数字输入输出",
              description: "使用按钮控制 LED，理解 HIGH、LOW、上拉和下拉。",
              difficulty: 2,
              prerequisites: ["基础电路与面包板"],
            },
          ],
          deliverable: "做出按钮控制 LED 的小电路。",
        },
        {
          id: "phase-3",
          title: "传感器与模拟信号",
          objective: "学会读取传感器数据，并把数据转化为可见反馈。",
          durationWeeks: 2,
          knowledgeNodes: [
            {
              id: "analog-input",
              title: "模拟输入",
              description: "理解 analogRead、0-1023 数值范围和电位器输入。",
              difficulty: 2,
              prerequisites: ["数字输入输出"],
            },
            {
              id: "sensor-basics",
              title: "常见传感器读取",
              description: "读取光敏、温湿度或距离传感器，并进行阈值判断。",
              difficulty: 3,
              prerequisites: ["模拟输入"],
            },
          ],
          deliverable: "做出光线变化触发 LED 或蜂鸣器的交互装置。",
        },
        {
          id: "phase-4",
          title: "执行器控制与综合项目",
          objective: "使用舵机、蜂鸣器或显示模块完成一个可演示项目。",
          durationWeeks: 2,
          knowledgeNodes: [
            {
              id: "actuator-control",
              title: "执行器控制",
              description: "控制舵机、蜂鸣器或 RGB LED，理解库的安装和调用。",
              difficulty: 3,
              prerequisites: ["常见传感器读取"],
            },
            {
              id: "project-debugging",
              title: "项目调试方法",
              description: "建立硬件、代码、电源、串口输出的排查顺序。",
              difficulty: 3,
              prerequisites: ["执行器控制"],
            },
          ],
          deliverable: "完成一个迷你智能夜灯、距离报警器或自动浇水原型。",
        },
      ],
    },
    learningPlan: {
      estimatedCompletionWeeks,
      weeklyHours,
      weeklyPlan: [
        {
          week: 1,
          theme: "开发环境与第一个 Arduino 程序",
          goals: ["完成 Arduino IDE 安装", "理解上传流程", "完成 Blink 实验"],
          tasks: ["连接 Arduino 板", "选择正确板卡和端口", "修改 Blink 闪烁间隔"],
          practice: ["把 LED 闪烁间隔改成 0.2 秒和 1 秒", "用自己的话解释 setup 和 loop"],
          assessment: "能独立上传程序，并能说明代码如何控制 LED。",
        },
        {
          week: 2,
          theme: "面包板、电阻和 LED 外接电路",
          goals: ["理解基础电路连接", "避免 LED 反接或无电阻直连", "完成外接 LED 控制"],
          tasks: ["学习面包板连通规则", "搭建外接 LED 电路", "用数字引脚控制 LED"],
          practice: ["让两个 LED 交替闪烁", "画出自己的接线图"],
          assessment: "能根据接线图复现 LED 电路，并排查常见连接错误。",
        },
        {
          week: 3,
          theme: "按钮输入与交互逻辑",
          goals: ["理解数字输入", "用按钮控制 LED", "理解输入抖动现象"],
          tasks: ["读取按钮状态", "实现按下亮灯", "尝试使用 INPUT_PULLUP"],
          practice: ["做一个按钮切换开关", "记录串口输出观察按钮状态"],
          assessment: "能解释按钮输入为什么需要稳定电平。",
        },
        {
          week: 4,
          theme: "模拟输入与传感器读取",
          goals: ["理解 analogRead", "读取电位器或光敏传感器", "完成阈值判断"],
          tasks: ["读取模拟数值", "使用串口监视器观察变化", "根据阈值控制 LED"],
          practice: ["用光线强弱控制 LED 亮灭", "调整阈值并记录结果"],
          assessment: "能把传感器数值转化成控制逻辑。",
        },
        {
          week: 5,
          theme: "执行器与 Arduino 库",
          goals: ["理解库的作用", "控制舵机或蜂鸣器", "组合输入和输出"],
          tasks: ["安装并使用一个 Arduino 库", "读取传感器后控制执行器", "加入串口调试输出"],
          practice: ["用距离或光线触发蜂鸣器", "用电位器控制舵机角度"],
          assessment: "能完成一个传感器到执行器的闭环交互。",
        },
        {
          week: 6,
          theme: "综合项目与调试复盘",
          goals: ["完成可演示项目", "形成调试流程", "整理作品说明"],
          tasks: ["选择一个项目主题", "拆解模块并逐个测试", "录制或展示最终效果"],
          practice: ["制作智能夜灯、距离报警器或自动浇水原型", "写出问题和解决记录"],
          assessment: "能独立展示项目功能、接线逻辑、核心代码和调试过程。",
        },
      ],
    },
    successCriteria: [
      "能独立完成 Arduino IDE 配置和程序上传",
      "能搭建基础 LED、按钮、传感器和执行器电路",
      "能读懂并修改 Arduino 入门代码",
      "能用串口监视器进行基础调试",
      "能完成一个可演示的 Arduino 综合小项目",
    ],
    nextAction: {
      type:
        input.currentLevel === "unknown" ? "ask_diagnostic_questions" : "start_first_lesson",
      label:
        input.currentLevel === "unknown"
          ? "先完成 3 个基础诊断问题"
          : "开始第一课：点亮 Arduino 的第一个 LED",
    },
  };
}

function normalizeLevel(level: LearningPlannerRequest["currentLevel"]) {
  const labels: Record<LearningPlannerRequest["currentLevel"], string> = {
    unknown: "未知基础，按零基础学习者处理",
    beginner: "零基础或刚接触硬件开发",
    some_experience: "有少量编程或电子制作经验",
    intermediate: "有一定编程和基础电路经验",
  };

  return labels[level];
}

function estimateArduinoWeeks(weeklyHours: number) {
  if (weeklyHours >= 10) {
    return 4;
  }

  if (weeklyHours >= 6) {
    return 6;
  }

  return 8;
}
