import { buildMindMapAgentMessages } from "@/lib/ai/prompts/mindmap";
import {
  mindMapAgentResponseSchema,
  type LearningStatus,
  type MindMapAgentRequest,
  type MindMapAgentResponse,
} from "@/lib/ai/schemas/mindmap";

export const MINDMAP_AGENT_NAME = "mindmap-agent";

const legend: Record<LearningStatus, string> = {
  not_started: "未开始",
  learning: "学习中",
  completed: "已完成",
  weak: "薄弱",
  review_due: "待复习",
};

export async function runMindMapAgent(
  input: MindMapAgentRequest,
): Promise<MindMapAgentResponse> {
  const messages = buildMindMapAgentMessages(input);
  void messages;

  const response = createDeterministicMindMapResponse(input);
  return mindMapAgentResponseSchema.parse(response);
}

function createDeterministicMindMapResponse(
  input: MindMapAgentRequest,
): MindMapAgentResponse {
  const tree = isArduinoContent(input)
    ? createArduinoTree(input)
    : createGenericTree(input);
  const markdown = renderMarkmapMarkdown(tree);

  return {
    agent: MINDMAP_AGENT_NAME,
    version: "1.0",
    title: input.title,
    subject: input.subject,
    format: "markmap-markdown",
    markdown,
    legend,
    tree,
  };
}

function createArduinoTree(input: MindMapAgentRequest): MindMapAgentResponse["tree"] {
  return {
    id: "root",
    title: input.title,
    status: "learning",
    children: [
      {
        id: "arduino-foundation",
        title: "入门基础",
        status: statusFor(input, "入门基础", "completed"),
        children: [
          {
            id: "arduino-board-and-ide",
            title: "Arduino 板卡与 IDE",
            status: statusFor(input, "Arduino 板卡与 IDE", "completed"),
            children: [],
          },
          {
            id: "blink-program",
            title: "Blink 程序",
            status: statusFor(input, "Blink 程序", "learning"),
            children: [
              {
                id: "setup-function",
                title: "setup 初始化",
                status: statusFor(input, "setup 初始化", "learning"),
                children: [],
              },
              {
                id: "loop-function",
                title: "loop 循环执行",
                status: statusFor(input, "loop 循环执行", "learning"),
                children: [],
              },
              {
                id: "delay-timing",
                title: "delay 时间控制",
                status: statusFor(input, "delay 时间控制", "weak"),
                children: [],
              },
            ],
          },
          {
            id: "setup-loop",
            title: "setup 与 loop",
            status: statusFor(input, "setup 与 loop", "learning"),
            children: [],
          },
        ],
      },
      {
        id: "circuit-and-io",
        title: "基础电路与输入输出",
        status: statusFor(input, "基础电路与输入输出", "learning"),
        children: [
          {
            id: "breadboard-resistor-led",
            title: "面包板、电阻与 LED",
            status: statusFor(input, "面包板、电阻与 LED", "weak"),
            children: [
              {
                id: "breadboard-rails",
                title: "面包板连通规则",
                status: statusFor(input, "面包板连通规则", "weak"),
                children: [],
              },
              {
                id: "led-polarity",
                title: "LED 极性",
                status: statusFor(input, "LED 极性", "weak"),
                children: [],
              },
              {
                id: "current-limiting-resistor",
                title: "限流电阻",
                status: statusFor(input, "限流电阻", "weak"),
                children: [],
              },
            ],
          },
          {
            id: "digital-output",
            title: "数字输出",
            status: statusFor(input, "数字输出", "learning"),
            children: [],
          },
          {
            id: "button-input",
            title: "按钮输入",
            status: statusFor(input, "按钮输入", "not_started"),
            children: [],
          },
        ],
      },
      {
        id: "sensor-and-actuator",
        title: "传感器与执行器",
        status: statusFor(input, "传感器与执行器", "not_started"),
        children: [
          {
            id: "analog-read",
            title: "模拟输入 analogRead",
            status: statusFor(input, "模拟输入 analogRead", "not_started"),
            children: [
              {
                id: "analog-range",
                title: "0-1023 数值范围",
                status: statusFor(input, "0-1023 数值范围", "not_started"),
                children: [],
              },
              {
                id: "serial-monitor",
                title: "串口监视器观察数据",
                status: statusFor(input, "串口监视器观察数据", "not_started"),
                children: [],
              },
            ],
          },
          {
            id: "sensor-threshold",
            title: "传感器阈值判断",
            status: statusFor(input, "传感器阈值判断", "not_started"),
            children: [],
          },
          {
            id: "servo-buzzer",
            title: "舵机与蜂鸣器控制",
            status: statusFor(input, "舵机与蜂鸣器控制", "not_started"),
            children: [],
          },
        ],
      },
      {
        id: "project-practice",
        title: "项目实战",
        status: statusFor(input, "项目实战", "not_started"),
        children: [
          {
            id: "smart-night-light",
            title: "智能夜灯",
            status: statusFor(input, "智能夜灯", "not_started"),
            children: [],
          },
          {
            id: "distance-alarm",
            title: "距离报警器",
            status: statusFor(input, "距离报警器", "not_started"),
            children: [],
          },
          {
            id: "debugging-review",
            title: "调试与复盘",
            status: statusFor(input, "调试与复盘", "review_due"),
            children: [],
          },
        ],
      },
    ],
  };
}

function createGenericTree(input: MindMapAgentRequest): MindMapAgentResponse["tree"] {
  const title = input.title.trim();

  return {
    id: "root",
    title,
    status: "learning",
    children: [
      {
        id: "concepts",
        title: "核心概念",
        status: statusFor(input, "核心概念", "learning"),
        children: [
          {
            id: "definition",
            title: "定义",
            status: statusFor(input, "定义", "learning"),
            children: [],
          },
          {
            id: "use-cases",
            title: "使用场景",
            status: statusFor(input, "使用场景", "not_started"),
            children: [],
          },
        ],
      },
      {
        id: "practice",
        title: "练习与应用",
        status: statusFor(input, "练习与应用", "not_started"),
        children: [
          {
            id: "basic-practice",
            title: "基础练习",
            status: statusFor(input, "基础练习", "not_started"),
            children: [],
          },
          {
            id: "mistake-review",
            title: "错题复盘",
            status: statusFor(input, "错题复盘", "review_due"),
            children: [],
          },
        ],
      },
    ],
  };
}

function renderMarkmapMarkdown(tree: MindMapAgentResponse["tree"]) {
  const lines = [`# ${withStatus(tree.title, tree.status)}`];

  tree.children.forEach((levelOne) => {
    lines.push(`- ${withStatus(levelOne.title, levelOne.status)}`);
    levelOne.children.forEach((levelTwo) => {
      lines.push(`  - ${withStatus(levelTwo.title, levelTwo.status)}`);
      levelTwo.children.forEach((levelThree) => {
        lines.push(`    - ${withStatus(levelThree.title, levelThree.status)}`);
      });
    });
  });

  return lines.join("\n");
}

function withStatus(title: string, status: LearningStatus) {
  return `${title} 「status: ${status}」`;
}

function statusFor(
  input: MindMapAgentRequest,
  title: string,
  fallback: LearningStatus,
): LearningStatus {
  return input.knownStatuses[title] ?? fallback;
}

function isArduinoContent(input: MindMapAgentRequest) {
  const value = `${input.title} ${input.subject} ${input.content}`.toLowerCase();
  return value.includes("arduino") || value.includes("led") || value.includes("blink");
}
