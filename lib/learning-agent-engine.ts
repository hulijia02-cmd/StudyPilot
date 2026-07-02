import {
  defaultLearningGoal,
  type ChatMessage,
  type DailyPlan,
  type KnowledgeNode,
  type KnowledgeStatus,
  type KnowledgeType,
  type LearningProgram,
} from "@/lib/mockLearningData";

type DomainProfile = {
  domain: string;
  beginnerAction: string;
  outcome: string;
  modules: Array<{
    title: string;
    summary: string;
    type: KnowledgeType;
    importance: 1 | 2 | 3 | 4 | 5;
    difficulty: 1 | 2 | 3 | 4 | 5;
    children: string[];
  }>;
  projects: string[];
};

export function createLearningProgram(rawGoal: string): LearningProgram {
  const goal = normalizeGoal(rawGoal);
  const profile = getDomainProfile(goal);
  const tree = createKnowledgeTree(goal, profile);

  return {
    goal,
    domain: profile.domain,
    outcome: profile.outcome,
    recommendedTasks: [
      `完成「${profile.modules[0].title}」的零基础导学`,
      `用自己的话解释：${profile.modules[1].title} 为什么重要`,
      `完成一个 15 分钟小练习：${profile.beginnerAction}`,
    ],
    plan: createThirtyDayPlan(goal, profile),
    tree,
    progress: goal === defaultLearningGoal ? 32 : 8,
    aiSuggestion: `先从「${profile.modules[0].title}」建立全局认知，再进入「${profile.modules[1].title}」做第一个可验证练习。`,
  };
}

export function createInitialTeacherMessages(program: LearningProgram): ChatMessage[] {
  return [
    {
      id: "ai-1",
      role: "ai",
      content: `我已经切换到「${program.goal}」学习模式。第一步不是直接讲一堆知识，而是先帮你建立全景地图：这门内容属于「${program.domain}」，最终目标是${program.outcome}。今天建议先做：${program.recommendedTasks[0]}。`,
    },
  ];
}

export function answerLearningQuestion({
  goal,
  question,
  selectedNode,
}: {
  goal: string;
  question: string;
  selectedNode: KnowledgeNode;
}) {
  const intent = detectIntent(question);

  if (intent === "plan") {
    return `针对「${goal}」，我建议按“认知-核心概念-方法练习-项目应用-复盘考核”的顺序学。你当前可以先学「${selectedNode.title}」：${selectedNode.summary}。学完后用一个小练习验证，而不是只看懂文字。`;
  }

  if (intent === "why") {
    return `你问的是原因。我用零基础方式解释：${selectedNode.title} 的作用是帮助你${selectedNode.keyPoints[0]}。如果跳过它，后面做题或项目时容易卡在「${selectedNode.difficultPoints[0]}」。`;
  }

  if (intent === "practice") {
    return `我给你 3 个练习：1. 用一句话解释「${selectedNode.title}」。2. 举一个生活例子说明它。3. 做一个 10 分钟小任务：${selectedNode.practiceAdvice}`;
  }

  if (intent === "mistake") {
    return `这个问题通常不是“没学会”，而是缺少排查顺序。先检查概念：${selectedNode.summary}；再检查重点：${selectedNode.keyPoints.join("、")}；最后看易错点：${selectedNode.difficultPoints.join("、")}。`;
  }

  return `我会围绕「${goal}」回答，而不是固定讲 Arduino。你现在问到的内容可以放在「${selectedNode.title}」下理解：${selectedNode.summary}。重点是：${selectedNode.keyPoints.join("、")}。建议下一步：${selectedNode.practiceAdvice}`;
}

export function quickTeacherResponse(label: string, goal: string, selectedNode: KnowledgeNode) {
  const actions: Record<string, string> = {
    讲简单点: `把「${selectedNode.title}」想成一个工具：它帮你解决“${selectedNode.summary}”这类问题。先记住一句话，再看例子，最后做一个小练习。`,
    生成思维导图: `# ${goal}\n## ${selectedNode.title}\n- 一句话：${selectedNode.summary}\n- 重点：${selectedNode.keyPoints.join("、")}\n- 难点：${selectedNode.difficultPoints.join("、")}\n- 练习：${selectedNode.practiceAdvice}`,
    生成练习题: `练习题：\n1. 选择题：${selectedNode.title} 最核心的作用是什么？\n2. 判断题：只背定义就等于掌握，对吗？\n3. 简答题：请用一个生活例子解释「${selectedNode.title}」。\n参考答案：围绕“${selectedNode.summary}”回答，并能说出一个应用场景。`,
    总结重点: `「${selectedNode.title}」重点：${selectedNode.keyPoints.join("；")}。难点：${selectedNode.difficultPoints.join("；")}。考点：${selectedNode.examPoints.join("；")}。`,
  };

  return actions[label] ?? answerLearningQuestion({ goal, question: label, selectedNode });
}

function normalizeGoal(rawGoal: string) {
  const goal = rawGoal.trim();
  return goal || defaultLearningGoal;
}

function detectIntent(question: string) {
  const text = question.toLowerCase();
  if (text.includes("计划") || text.includes("怎么学") || text.includes("路线")) {
    return "plan";
  }
  if (text.includes("为什么") || text.includes("原因") || text.includes("why")) {
    return "why";
  }
  if (text.includes("练习") || text.includes("题") || text.includes("作业")) {
    return "practice";
  }
  if (text.includes("错") || text.includes("不会") || text.includes("卡住") || text.includes("不懂")) {
    return "mistake";
  }
  return "explain";
}

function getDomainProfile(goal: string): DomainProfile {
  const lower = goal.toLowerCase();

  if (goal.includes("数学") || lower.includes("math")) {
    return {
      domain: "数学思维 / 建模 / 解题能力",
      beginnerAction: "把一个概念画成图，再做 3 道基础题",
      outcome: "能理解核心概念、建立解题步骤，并把数学用于真实问题分析",
      modules: [
        module("数学认知", "理解这门数学内容解决什么问题，以及为什么要学。", "concept", 5, 1, ["学习目标", "先修知识", "常见误区"]),
        module("核心概念", "建立定义、符号、图像之间的对应关系。", "concept", 5, 3, ["定义理解", "符号语言", "图像直觉"]),
        module("基础运算", "掌握最小必需的计算规则。", "skill", 4, 3, ["公式变形", "代数操作", "单位与量纲"]),
        module("解题模型", "把题目拆成已知、未知、关系、步骤。", "skill", 5, 4, ["题型识别", "步骤模板", "反例检查"]),
        module("应用场景", "把数学用于设计、数据、工程或生活问题。", "project", 4, 3, ["比例关系", "估算", "建模"]),
        module("错题诊断", "从错题里定位概念、计算、审题或策略问题。", "exam", 4, 2, ["错因分类", "重做策略", "迁移练习"]),
        module("综合项目", "完成一个可展示的小项目或案例分析。", "project", 5, 4, ["案例选择", "建模过程", "结果解释"]),
        module("复习考核", "用间隔复习和综合题确认真正掌握。", "exam", 4, 2, ["知识回忆", "限时练习", "复盘报告"]),
      ],
      projects: ["设计一个房间布局比例方案", "分析一组数据的趋势", "用函数描述一个真实变化过程"],
    };
  }

  if (goal.includes("设计") || lower.includes("design") || goal.includes("UI")) {
    return {
      domain: "设计基础 / 视觉表达 / 产品体验",
      beginnerAction: "临摹一个优秀界面，并标出层级、间距、颜色和字体",
      outcome: "能做出结构清晰、视觉统一、可解释的设计方案",
      modules: [
        module("设计认知", "理解设计不是装饰，而是解决信息表达和使用问题。", "concept", 5, 1, ["设计目标", "用户场景", "评价标准"]),
        module("视觉层级", "让用户一眼知道先看什么、后看什么。", "concept", 5, 3, ["大小对比", "留白", "重点引导"]),
        module("版式网格", "用网格和对齐建立秩序感。", "tool", 5, 3, ["栅格", "对齐", "间距"]),
        module("字体与颜色", "通过字体、颜色和对比控制情绪和可读性。", "skill", 4, 3, ["字体层级", "色彩角色", "对比度"]),
        module("组件设计", "把按钮、卡片、表单做成可复用模块。", "skill", 4, 3, ["状态", "一致性", "可点击区域"]),
        module("交互流程", "让用户知道当前在哪、下一步做什么。", "skill", 5, 4, ["导航", "反馈", "错误处理"]),
        module("作品实战", "完成一套可展示的 App 或小程序页面。", "project", 5, 4, ["首页", "核心流程", "展示说明"]),
        module("设计评审", "用标准检查设计是否清晰、可用、一致。", "exam", 4, 2, ["可读性", "一致性", "完成度"]),
      ],
      projects: ["设计一个学习 App 首页", "重做一个小程序核心流程", "建立一套按钮和卡片组件"],
    };
  }

  if (goal.includes("Python") || lower.includes("python") || goal.includes("编程")) {
    return {
      domain: "编程基础 / 自动化 / 项目实践",
      beginnerAction: "写一个能运行的小脚本，并解释每一行代码",
      outcome: "能独立写出小程序，理解变量、条件、循环、函数和调试",
      modules: [
        module("编程认知", "理解程序是让计算机按步骤执行任务。", "concept", 5, 1, ["输入", "处理", "输出"]),
        module("环境搭建", "安装工具并运行第一段代码。", "tool", 5, 2, ["解释器", "编辑器", "运行方式"]),
        module("变量类型", "保存和处理数字、文本、列表等数据。", "concept", 5, 2, ["变量", "字符串", "列表"]),
        module("流程控制", "用条件和循环表达逻辑。", "skill", 5, 3, ["if", "for", "while"]),
        module("函数模块", "把重复逻辑封装成可复用能力。", "skill", 4, 3, ["参数", "返回值", "模块"]),
        module("文件数据", "读取文件、处理表格或文本。", "tool", 4, 3, ["文件读写", "CSV", "异常"]),
        module("项目实战", "完成一个自动化或数据处理项目。", "project", 5, 4, ["需求拆解", "编码", "调试"]),
        module("复习考核", "用题目和项目复盘确认掌握。", "exam", 4, 2, ["错题", "重构", "讲解"]),
      ],
      projects: ["批量整理文件", "制作成绩统计脚本", "写一个命令行待办工具"],
    };
  }

  if (goal.includes("Arduino") || lower.includes("arduino")) {
    return {
      domain: "Arduino / 创客硬件 / 入门嵌入式开发",
      beginnerAction: "上传 Blink 程序，让 LED 按节奏闪烁",
      outcome: "能独立完成传感器读取、执行器控制和一个可演示硬件小项目",
      modules: [
        module("入门认知", "先知道 Arduino 是什么、能做什么，以及学习路线长什么样。", "concept", 5, 1, ["开发板", "输入输出", "项目路线"]),
        module("环境搭建", "安装工具、连接板卡、上传第一个 Blink 程序。", "tool", 5, 2, ["Arduino IDE", "开发板端口", "Blink"]),
        module("基础语法", "掌握读懂 Arduino 程序所需的最小代码知识。", "skill", 4, 3, ["setup", "loop", "变量"]),
        module("电子基础", "理解电路安全、面包板、电阻、LED 极性和 GND。", "concept", 5, 4, ["面包板", "电阻", "GND"]),
        module("输入输出", "读取按钮和传感器，控制 LED、蜂鸣器等输出设备。", "skill", 5, 3, ["digitalRead", "digitalWrite", "analogRead"]),
        module("常用模块", "使用传感器、舵机、蜂鸣器、显示屏等模块做交互。", "tool", 4, 4, ["舵机", "蜂鸣器", "显示屏"]),
        module("项目实战", "把知识组合成能展示的作品。", "project", 5, 5, ["智能夜灯", "距离报警器", "自动浇水"]),
        module("复习考核", "用练习、错题和项目复盘确认是否真正掌握。", "exam", 4, 2, ["错题复盘", "作品讲解", "综合测试"]),
      ],
      projects: ["智能夜灯", "距离报警器", "自动浇水原型"],
    };
  }

  return {
    domain: "通用自学 / 知识建构 / 项目实践",
    beginnerAction: "用一句话解释目标，并完成一个最小练习",
    outcome: `能系统掌握「${goal}」的核心知识，并完成一个可展示成果`,
    modules: [
      module("学习目标澄清", "先明确学这件事是为了解决什么问题。", "concept", 5, 1, ["目标", "边界", "成果"]),
      module("基础概念", "建立最小必要概念库。", "concept", 5, 2, ["定义", "例子", "反例"]),
      module("核心方法", "掌握最常用的操作步骤。", "skill", 5, 3, ["流程", "方法", "模板"]),
      module("工具资源", "找到合适工具、资料和练习环境。", "tool", 4, 2, ["资料", "工具", "案例"]),
      module("典型任务", "用真实任务检验理解。", "skill", 4, 3, ["任务拆解", "练习", "反馈"]),
      module("难点突破", "集中处理容易卡住的部分。", "concept", 5, 4, ["误区", "难点", "纠错"]),
      module("项目应用", "做一个能展示学习成果的小项目。", "project", 5, 4, ["选题", "制作", "展示"]),
      module("复盘考核", "用复盘和测试确认是否真正学会。", "exam", 4, 2, ["回忆", "测试", "改进"]),
    ],
    projects: [`完成一个「${goal}」入门作品`, `做一份「${goal}」学习报告`, `录制 2 分钟讲解视频`],
  };
}

function module(
  title: string,
  summary: string,
  type: KnowledgeType,
  importance: 1 | 2 | 3 | 4 | 5,
  difficulty: 1 | 2 | 3 | 4 | 5,
  children: string[],
) {
  return { title, summary, type, importance, difficulty, children };
}

function createThirtyDayPlan(goal: string, profile: DomainProfile): DailyPlan[] {
  return Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const moduleIndex = Math.min(Math.floor(index / 4), profile.modules.length - 1);
    const current = profile.modules[moduleIndex];

    return {
      day,
      title: `Day ${day}：${current.title}`,
      estimatedTime: day % 5 === 0 ? "45 分钟" : "30 分钟",
      focus: `围绕「${goal}」学习：${current.summary}`,
      practice: day % 4 === 0 ? `做一个阶段小项目：${profile.projects[moduleIndex % profile.projects.length]}` : `完成练习：${current.children[index % current.children.length]}`,
      details: [
        `AI 老师先讲清「${current.title}」的一句话解释`,
        "完成 1 个可检查的小练习",
        "记录今天的重点、难点和一个易错点",
      ],
    };
  });
}

function createKnowledgeTree(goal: string, profile: DomainProfile): KnowledgeNode[] {
  return profile.modules.map((item, index) => ({
    id: slug(`${goal}-${item.title}`),
    title: item.title,
    summary: item.summary,
    importance: item.importance,
    difficulty: item.difficulty,
    status: index === 0 ? "learning" : "not_started",
    type: item.type,
    order: `第 ${index + 1} 步`,
    keyPoints: [`理解「${item.title}」解决什么问题`, "能举出一个生活或项目例子", "能完成一个最小练习"],
    difficultPoints: [`容易把「${item.title}」当成孤立知识点，而不是放回「${goal}」的学习目标里理解`],
    examPoints: ["能说清定义", "能判断应用场景", "能完成基础练习"],
    practiceAdvice: `围绕「${item.title}」做一个 10-15 分钟小练习，并写下结果。`,
    tags: createTags(item.type, item.importance, item.difficulty, index),
    children: item.children.map((child, childIndex) =>
      createChildNode(goal, item.title, child, childIndex),
    ),
  }));
}

function createChildNode(goal: string, parentTitle: string, title: string, index: number): KnowledgeNode {
  const status: KnowledgeStatus = index === 0 ? "learning" : "not_started";

  return {
    id: slug(`${goal}-${parentTitle}-${title}`),
    title,
    summary: `这是「${parentTitle}」模块下的核心知识点，用来支撑「${goal}」的真实应用。`,
    importance: index < 2 ? 5 : 4,
    difficulty: index === 0 ? 2 : index === 1 ? 3 : 4,
    status,
    type: index === 2 ? "project" : "concept",
    order: index === 0 ? "先学" : index === 1 ? "再学" : "最后练",
    keyPoints: [`知道「${title}」是什么`, `知道「${title}」什么时候用`, `能把「${title}」讲给别人听`],
    difficultPoints: [`容易只记住「${title}」这个词，但不会用它解决问题`],
    examPoints: [`能解释「${title}」`, `能完成一个与「${title}」相关的小题`],
    practiceAdvice: `用 3 句话解释「${title}」，再做一个与「${goal}」相关的小例子。`,
    tags: createTags(index === 2 ? "project" : "concept", index < 2 ? 5 : 4, index === 2 ? 4 : 3, index),
    children: [
      leaf(goal, parentTitle, title, "一句话解释", "用一句话说清它解决什么问题。"),
      leaf(goal, parentTitle, title, "生活例子", "找一个生活或项目中的对应场景。"),
      leaf(goal, parentTitle, title, "练习验证", "通过一道题或一个小任务检查是否真的掌握。"),
    ],
  };
}

function leaf(goal: string, parentTitle: string, title: string, leafTitle: string, summary: string): KnowledgeNode {
  return {
    id: slug(`${goal}-${parentTitle}-${title}-${leafTitle}`),
    title: leafTitle,
    summary,
    importance: 4,
    difficulty: 2,
    status: "not_started",
    type: "skill",
    order: "具体知识点",
    keyPoints: [summary, "能说出来", "能做出来"],
    difficultPoints: ["容易看懂但不会复述"],
    examPoints: ["能独立完成并解释过程"],
    practiceAdvice: `围绕「${title}」完成「${leafTitle}」练习。`,
    tags: ["练习"],
    children: [],
  };
}

function createTags(type: KnowledgeType, importance: number, difficulty: number, index: number) {
  const tags: string[] = [];
  if (importance >= 5) tags.push("重点");
  if (difficulty >= 4) tags.push("难点");
  if (type === "project") tags.push("项目");
  if (index === 0) tags.push("学习中");
  return tags.length > 0 ? tags : ["基础"];
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
