import { buildKnowledgeAgentMessages } from "@/lib/ai/prompts/knowledge";
import {
  knowledgeAgentResponseSchema,
  type KnowledgeAgentRequest,
  type KnowledgeAgentResponse,
} from "@/lib/ai/schemas/knowledge";

export const KNOWLEDGE_AGENT_NAME = "knowledge-agent";

export async function runKnowledgeAgent(
  input: KnowledgeAgentRequest,
): Promise<KnowledgeAgentResponse> {
  const messages = buildKnowledgeAgentMessages(input);
  void messages;

  const explanation = createDeterministicKnowledgeResponse(input);
  return knowledgeAgentResponseSchema.parse(explanation);
}

function createDeterministicKnowledgeResponse(
  input: KnowledgeAgentRequest,
): KnowledgeAgentResponse {
  const normalizedTopic = input.topic.trim();

  if (isArduinoBlinkTopic(normalizedTopic)) {
    return createArduinoBlinkExplanation(input, normalizedTopic);
  }

  return {
    agent: KNOWLEDGE_AGENT_NAME,
    version: "1.0",
    topic: normalizedTopic,
    subject: input.subject,
    learnerLevel: input.learnerLevel,
    explanation: {
      oneSentence: `${normalizedTopic} 是学习中需要先建立直觉、再理解规则、最后通过练习掌握的一个知识点。`,
      lifeExample: "就像学骑自行车，先知道车把、刹车和脚踏分别做什么，再上车练习，最后通过不断纠错形成稳定能力。",
      keyPoints: [
        "先理解它解决什么问题，再记具体定义。",
        "把抽象概念拆成输入、处理过程和输出结果。",
        "学完后要能用自己的话解释，并完成一个小练习。",
      ],
      difficultPoints: [
        "零基础学习者容易直接背定义，但没有形成可操作的理解。",
        "容易忽略它和前后知识点之间的关系。",
      ],
      examPoints: [
        "能否准确说出核心定义。",
        "能否判断一个例子是否属于该知识点。",
        "能否解释它的适用场景和限制。",
      ],
      commonMistakes: [
        "只记关键词，不理解它为什么存在。",
        "把相似概念混在一起。",
        "没有通过练习验证自己是否真正掌握。",
      ],
      summary: `学习 ${normalizedTopic} 时，先用生活例子建立直觉，再抓住重点，最后用练习检查理解是否可靠。`,
    },
    nextStep: {
      type: "practice",
      label: "生成 3 道零基础练习题",
    },
  };
}

function createArduinoBlinkExplanation(
  input: KnowledgeAgentRequest,
  topic: string,
): KnowledgeAgentResponse {
  return {
    agent: KNOWLEDGE_AGENT_NAME,
    version: "1.0",
    topic,
    subject: input.subject,
    learnerLevel: input.learnerLevel,
    explanation: {
      oneSentence: "Arduino Blink 程序就是让 Arduino 按固定节奏控制一个 LED 亮起和熄灭。",
      lifeExample: "它像你按固定节拍开关房间灯：开灯等一会儿，关灯等一会儿，不断重复。",
      keyPoints: [
        "setup 只在程序开始时运行一次，通常用来做初始化。",
        "loop 会一直重复运行，是 Arduino 持续工作的核心。",
        "pinMode 用来告诉 Arduino 某个引脚是输出还是输入。",
        "digitalWrite 用来控制数字引脚输出 HIGH 或 LOW。",
        "delay 用来让程序暂停一段时间，单位是毫秒。",
      ],
      difficultPoints: [
        "理解 setup 运行一次、loop 反复运行的区别。",
        "理解 HIGH/LOW 不是文字，而是引脚上的电平状态。",
        "理解 delay 会让 Arduino 暂停，暂停期间不会处理其他逻辑。",
      ],
      examPoints: [
        "能说出 setup 和 loop 的作用区别。",
        "能判断 pinMode、digitalWrite、delay 分别负责什么。",
        "能修改 delay 数值，让 LED 闪得更快或更慢。",
      ],
      commonMistakes: [
        "忘记写 pinMode，导致引脚没有被设置成输出。",
        "把 delay(1000) 误以为是 1000 秒，实际是 1000 毫秒，也就是 1 秒。",
        "只改一处 delay，导致亮灯时间和灭灯时间不一致却不知道原因。",
        "接外部 LED 时忘记串联电阻，可能损坏 LED。",
      ],
      summary:
        "Blink 是 Arduino 的第一课：它帮助你理解程序上传、引脚输出、循环执行和时间控制，是后续学习按钮、传感器和执行器的基础。",
    },
    nextStep: {
      type: "practice",
      label: "练习修改 Blink 闪烁节奏",
    },
  };
}

function isArduinoBlinkTopic(topic: string) {
  const normalized = topic.toLowerCase();
  return (
    normalized.includes("blink") ||
    normalized.includes("led") ||
    normalized.includes("arduino")
  );
}
