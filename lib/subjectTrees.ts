import type { KnowledgeNode } from "@/lib/mockLearningData";

export function buildSubjectTree(goal: string): KnowledgeNode[] {
  const g = goal.toLowerCase();
  if (g.includes("统计")) return buildStatisticsTree();
  if (g.includes("设计数学")) return buildDesignMathTree();
  if (g.includes("arduino") || g.includes("单片机")) return buildArduinoTree();
  if (g.includes("python")) return buildPythonTree();
  if (g.includes("cad") || g.includes("制图") || g.includes("工程图")) return buildCADTree();
  return buildDefaultTree(goal);
}

function id(): string { return Math.random().toString(36).slice(2,9); }

function make(
  title: string, summary: string, type: KnowledgeNode["type"],
  importance: number, difficulty: number, children: KnowledgeNode[],
  tags: string[] = [], order: string = "1", practice: string = ""
): KnowledgeNode {
  return {
    id: id(), title, summary, type, importance, difficulty,
    priority: importance, reason: "学科核心", canSkip: false,
    tags, status: "pending", order,
    practiceAdvice: practice || `认真学习并掌握${title}`,
    keyPoints: [], difficultPoints: [], examPoints: [], children,
  };
}

function buildStatisticsTree(): KnowledgeNode[] {
  return [
    make("数据与变量", "了解数据类型和变量分类，是统计学的基础", "concept", 4, 1, [
      make("定性数据", "按类别或属性分类的数据，如性别、颜色", "concept", 3, 1, []),
      make("定量数据", "以数值形式表示的数据，如身高、体重", "concept", 3, 1, []),
      make("离散变量", "取值可数的变量，如掷骰子点数", "concept", 4, 2, []),
      make("连续变量", "取值可无限细分的变量，如时间、温度", "concept", 4, 2, []),
    ], ["基础", "概念"], "1"),
    make("描述统计", "用数字和图表概括数据特征", "concept", 5, 2, [
      make("集中趋势", "反映数据中心位置的统计量", "concept", 5, 2, [
        make("均值", "所有数据之和除以个数，最常用的集中趋势指标", "concept", 5, 2, []),
        make("中位数", "排序后位于中间位置的数值，不受极端值影响", "concept", 4, 2, []),
        make("众数", "数据中出现频率最高的值", "concept", 3, 1, []),
      ], ["重点", "公式"], "2.1"),
      make("离散程度", "反映数据的波动和分散程度", "concept", 5, 2, [
        make("极差", "最大值与最小值之差，最简单的离散指标", "tool", 2, 1, []),
        make("方差", "各数据与均值差的平方的平均数", "concept", 5, 3, [], "2.2.2", "理解方差公式的推导过程"),
        make("标准差", "方差的平方根，与实际单位一致", "concept", 5, 3, [], "2.2.3", "掌握标准差的意义和计算"),
      ], ["重点", "公式"], "2.2"),
      make("图表表达", "用图形直观展示数据分布", "skill", 3, 2, [
        make("频数分布表", "按组距整理数据的基本表格", "tool", 3, 2, []),
        make("直方图", "用矩形直观展示数据分布", "tool", 4, 2, []),
        make("箱线图", "展示数据五数概括的简洁图表", "tool", 3, 3, []),
      ], ["技能"], "2.3"),
    ], ["核心", "重点"], "2"),
    make("概率基础", "学习随机现象和概率计算规则", "concept", 5, 2, [
      make("随机事件", "可能发生也可能不发生的事件", "concept", 4, 2, [
        make("事件类型", "独立事件、互斥事件、对立事件", "concept", 3, 2, []),
      ], [], "3.1"),
      make("概率规则", "概率的基本运算法则", "concept", 5, 3, [
        make("加法规则", "P(A∪B) = P(A) + P(B) - P(A∩B)", "concept", 5, 3, []),
        make("乘法规则", "P(A∩B) = P(A) × P(B|A)", "concept", 5, 3, []),
      ], ["公式"], "3.2"),
      make("条件概率", "给定条件下事件发生的概率", "concept", 5, 3, [
        make("贝叶斯定理", "利用先验概率计算后验概率", "concept", 4, 4, []),
      ], ["难点"], "3.3"),
    ], ["核心"], "3"),
    make("概率分布", "描述随机变量取值规律的数学模型", "concept", 5, 3, [
      make("正态分布", "自然界最常见的连续型概率分布", "concept", 5, 3, [
        make("标准正态分布", "均值为0标准差为1的特殊正态分布", "concept", 5, 3, []),
        make("正态分布特性", "68-95-99.7经验法则", "concept", 4, 3, []),
      ], ["重点", "考点"]),
      make("抽样分布", "样本统计量的概率分布", "concept", 5, 3, [
        make("中心极限定理", "样本均值近似正态分布的重要定理", "concept", 5, 4, []),
      ], ["难点"]),
    ], ["核心"], "4"),
    make("推断统计", "从样本数据推断总体特征", "concept", 5, 4, [
      make("参数估计", "用样本统计量估计总体参数", "method", 5, 4, [
        make("点估计", "用单一数值估计总体参数", "method", 4, 3, []),
        make("区间估计", "给出参数的可能范围", "concept", 5, 4, []),
      ], ["重点"]),
      make("置信区间", "参数估计的可靠范围", "concept", 5, 4, [
        make("均值的置信区间", "利用样本均值和标准误差计算", "method", 5, 4, []),
      ], ["考点"]),
      make("假设检验", "对总体参数提出假设并进行检验", "method", 5, 4, [
        make("原假设与备择假设", "H₀和H₁的定义和设定", "concept", 5, 3, []),
        make("p值与显著性水平", "判断检验结果的核心指标", "concept", 5, 4, []),
        make("t检验", "小样本均值比较的常用方法", "method", 4, 4, []),
        make("卡方检验", "分类变量关联性检验", "method", 4, 4, []),
      ], ["难点", "考点"]),
    ], ["进阶"], "5"),
    make("回归与相关", "研究变量之间关系的统计方法", "concept", 5, 4, [
      make("相关分析", "衡量变量间的线性关系强度", "concept", 4, 3, [
        make("皮尔逊相关系数", "衡量线性相关程度的指标", "formula", 5, 3, []),
      ], ["公式"]),
      make("线性回归", "建立因变量与自变量之间线性关系的模型", "method", 5, 4, [
        make("最小二乘法", "拟合回归直线的标准方法", "method", 5, 4, []),
        make("回归方程", "Y = a + bX 的解读", "concept", 5, 3, []),
        make("残差分析", "检验回归模型适用性的重要工具", "concept", 4, 4, []),
      ], ["重点", "考点"]),
    ], ["进阶"], "6"),
  ];
}

function buildDesignMathTree(): KnowledgeNode[] { return buildStatisticsTree(); }
function buildArduinoTree(): KnowledgeNode[] { return buildDefaultTree("Arduino"); }
function buildPythonTree(): KnowledgeNode[] { return buildDefaultTree("Python"); }
function buildCADTree(): KnowledgeNode[] { return buildDefaultTree("CAD"); }

function buildDefaultTree(goal: string): KnowledgeNode[] {
  const norm = goal.replace(/[/\\?%*:|"<>]/g, "").trim();
  const main = norm || "学习目标";
  return [
    make(main + "基础知识", "掌握" + main + "的基本概念和核心原理", "concept", 5, 2, [
      make("核心概念", main + "领域的基本定义和术语", "concept", 5, 2, [
        make("基本术语", "理解和掌握关键术语", "concept", 4, 1, []),
        make("核心原理", "掌握基本原理和规律", "concept", 4, 2, []),
      ], ["基础"]),
      make("基础知识分类", "对基础知识进行系统分类", "concept", 4, 2, [
        make("理论部分", "理论基础和重要定理", "concept", 4, 3, []),
        make("实践部分", "实践应用和操作方法", "skill", 4, 2, []),
      ], [], "2"),
    ], ["核心"], "1"),
    make("核心技能", "掌握" + main + "的核心技能和方法", "skill", 5, 3, [
      make("基本方法", "最常用的方法和技巧", "skill", 4, 3, [
        make("方法一", "第一个核心方法", "method", 4, 3, []),
        make("方法二", "第二个核心方法", "method", 4, 3, []),
      ], []),
      make("进阶技巧", "提升效率和效果的高级技巧", "skill", 4, 4, [
        make("技巧一", "第一个进阶技巧", "skill", 3, 4, []),
        make("技巧二", "第二个进阶技巧", "skill", 3, 4, []),
      ], ["进阶"]),
    ], ["技能"], "3"),
    make("综合应用", "综合运用所学知识解决实际问题", "project", 4, 4, [
      make("应用场景", "典型的应用场景分析", "project", 4, 3, []),
      make("项目实践", "通过项目巩固所学知识", "project", 4, 4, [
        make("项目规划", "项目的整体规划和设计", "skill", 3, 3, []),
        make("项目实现", "项目的具体实现步骤", "project", 4, 4, []),
      ], ["实践"]),
    ], ["项目"], "4"),
  ];
}
