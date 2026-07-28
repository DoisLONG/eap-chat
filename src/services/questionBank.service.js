const STORAGE_KEY = "bluedot_question_bank_mock_v1";

const materials = [
  { id: "mat-ai-portal", name: "AI Portal 产品使用手册", primaryCategory: "product", secondaryCategory: "aiPortal" },
  { id: "mat-ai-hub", name: "AI Hub 知识运营规范", primaryCategory: "product", secondaryCategory: "aiHub" },
  { id: "mat-beat", name: "BEAT 智能陪练操作指南", primaryCategory: "product", secondaryCategory: "beat" },
  { id: "mat-bams", name: "BAMS 发布管理手册", primaryCategory: "product", secondaryCategory: "bams" },
  { id: "mat-charter", name: "公司章程与员工行为规范", primaryCategory: "operation", secondaryCategory: "companyCharter" },
  { id: "mat-k8s", name: "K8s 集群运维手册", primaryCategory: "technology", secondaryCategory: "k8s" },
];

const seedQuestions = [
  {
    id: "qb-001",
    text: "在 AI Portal 中创建知识库后，完成资料检索配置前应优先检查哪一项？",
    type: "choice",
    primaryCategory: "product",
    secondaryCategory: "aiPortal",
    materialId: "mat-ai-portal",
    options: ["资料状态是否解析完成", "页面主题颜色", "员工头像", "浏览器缩放比例"],
    answer: "资料状态是否解析完成",
    analysis: "知识库只有在资料解析完成后才能进入后续检索配置与验证流程。",
  },
  {
    id: "qb-002",
    text: "请简述 AI Portal 知识库发布前的必要检查步骤。",
    type: "essay",
    primaryCategory: "product",
    secondaryCategory: "aiPortal",
    materialId: "mat-ai-portal",
    options: [],
    answer: "确认资料解析完成，核对权限范围，执行检索测试并完成发布确认。",
    analysis: "答案应覆盖资料状态、权限配置、检索验证和发布确认四个关键环节。",
  },
  {
    id: "qb-003",
    text: "AI Hub 中维护知识条目时，以下哪种做法最有利于后续检索？",
    type: "choice",
    primaryCategory: "product",
    secondaryCategory: "aiHub",
    materialId: "mat-ai-hub",
    options: ["为条目补充清晰标题和业务标签", "只保留截图", "删除来源说明", "将多项流程写在一个无标题段落中"],
    answer: "为条目补充清晰标题和业务标签",
    analysis: "结构化标题、标签和来源信息能提高内容可发现性与维护效率。",
  },
  {
    id: "qb-004",
    text: "请说明知识条目失效后在 AI Hub 中应如何处理。",
    type: "essay",
    primaryCategory: "product",
    secondaryCategory: "aiHub",
    materialId: "mat-ai-hub",
    options: [],
    answer: "标记失效原因，更新或下线条目，并同步通知相关内容负责人。",
    analysis: "处理重点是防止失效信息继续被检索和复用，同时保留可追溯记录。",
  },
  {
    id: "qb-005",
    text: "BEAT 智能陪练任务发布前，需要优先确认的内容是什么？",
    type: "choice",
    primaryCategory: "product",
    secondaryCategory: "beat",
    materialId: "mat-beat",
    options: ["参与人员与训练目标", "背景音乐", "页面壁纸", "系统语言"],
    answer: "参与人员与训练目标",
    analysis: "参与范围和训练目标决定任务配置、题目匹配和后续评价维度。",
  },
  {
    id: "qb-006",
    text: "请描述一次有效陪练任务结束后应关注的结果。",
    type: "essay",
    primaryCategory: "product",
    secondaryCategory: "beat",
    materialId: "mat-beat",
    options: [],
    answer: "关注完成情况、答题表现、薄弱知识点和后续训练建议。",
    analysis: "陪练结果应能够反映完成度、掌握情况与可执行的改进方向。",
  },
  {
    id: "qb-007",
    text: "BAMS 发布操作中，灰度发布的主要目的是什么？",
    type: "choice",
    primaryCategory: "product",
    secondaryCategory: "bams",
    materialId: "mat-bams",
    options: ["在有限范围内验证发布效果", "跳过版本检查", "自动删除旧版本", "扩大所有用户权限"],
    answer: "在有限范围内验证发布效果",
    analysis: "灰度发布用于控制风险、观察关键指标，并在必要时快速回退。",
  },
  {
    id: "qb-008",
    text: "请列举 BAMS 发布后需要观察的两类信息。",
    type: "essay",
    primaryCategory: "product",
    secondaryCategory: "bams",
    materialId: "mat-bams",
    options: [],
    answer: "运行状态与错误告警、核心业务指标与用户反馈。",
    analysis: "发布后的技术稳定性和业务效果都需要持续观察。",
  },
  {
    id: "qb-009",
    text: "员工在公司章程要求下处理外部沟通时，应优先遵循什么原则？",
    type: "choice",
    primaryCategory: "operation",
    secondaryCategory: "companyCharter",
    materialId: "mat-charter",
    options: ["信息真实、授权明确、表达规范", "个人偏好优先", "口头承诺即可", "不需要保留记录"],
    answer: "信息真实、授权明确、表达规范",
    analysis: "外部沟通应符合公司制度、授权边界和信息安全要求。",
  },
  {
    id: "qb-010",
    text: "请说明发现流程违反公司章程时的基本上报原则。",
    type: "essay",
    primaryCategory: "operation",
    secondaryCategory: "companyCharter",
    materialId: "mat-charter",
    options: [],
    answer: "如实记录情况，按既定渠道及时上报，并配合后续核查。",
    analysis: "上报应保持事实完整、及时且遵循内部处理流程。",
  },
  {
    id: "qb-011",
    text: "K8s 工作负载发布失败时，首先应查看哪类信息？",
    type: "choice",
    primaryCategory: "technology",
    secondaryCategory: "k8s",
    materialId: "mat-k8s",
    options: ["Pod 事件和容器日志", "桌面壁纸", "浏览器书签", "个人日程"],
    answer: "Pod 事件和容器日志",
    analysis: "Pod 事件和容器日志能直接反映调度、镜像、配置和运行时错误。",
  },
  {
    id: "qb-012",
    text: "请简述 K8s 服务变更后的基本验证步骤。",
    type: "essay",
    primaryCategory: "technology",
    secondaryCategory: "k8s",
    materialId: "mat-k8s",
    options: [],
    answer: "检查工作负载状态、服务连通性、关键日志和监控指标，并确认回滚方案可用。",
    analysis: "验证应覆盖资源状态、访问链路、运行日志和业务指标。",
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const withMaterialName = (question) => ({
  ...question,
  materialName: materials.find((material) => material.id === question.materialId)?.name || "--",
});

function readQuestions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return JSON.parse(stored);
  } catch {
    // 本地存储不可用时使用内存种子数据，不阻断页面浏览。
  }
  return clone(seedQuestions);
}

function saveQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // 模拟数据持久化失败不影响本次页面交互。
  }
}

function matches(question, filters) {
  const keyword = filters.keyword?.trim().toLowerCase();
  return (
    (!keyword || question.text.toLowerCase().includes(keyword)) &&
    (!filters.primaryCategory || question.primaryCategory === filters.primaryCategory) &&
    (!filters.secondaryCategory || question.secondaryCategory === filters.secondaryCategory) &&
    (!filters.materialId || question.materialId === filters.materialId) &&
    (!filters.type || question.type === filters.type)
  );
}

export async function getQuestionBankList({ filters = {}, page = 1, pageSize = 8 } = {}) {
  const filtered = readQuestions().filter((question) => matches(question, filters));
  const start = (page - 1) * pageSize;
  return {
    items: clone(filtered.slice(start, start + pageSize).map(withMaterialName)),
    total: filtered.length,
  };
}

export async function getQuestionBankDetail(id) {
  const question = readQuestions().find((item) => item.id === id);
  return question ? clone(withMaterialName(question)) : null;
}

export async function deleteQuestionBankItems(ids) {
  const selectedIds = new Set(ids);
  const questions = readQuestions().filter((question) => !selectedIds.has(question.id));
  saveQuestions(questions);
  return { deletedCount: selectedIds.size };
}

export async function updateQuestionBankItem(id, changes) {
  const questions = readQuestions();
  const index = questions.findIndex((question) => question.id === id);
  if (index < 0) return null;

  questions[index] = {
    ...questions[index],
    text: typeof changes.text === "string" ? changes.text.trim() : questions[index].text,
    answer: typeof changes.answer === "string" ? changes.answer.trim() : questions[index].answer,
  };
  saveQuestions(questions);
  return clone(withMaterialName(questions[index]));
}

export function getQuestionBankMaterials({ primaryCategory = "", secondaryCategory = "" } = {}) {
  return clone(
    materials.filter(
      (material) =>
        (!primaryCategory || material.primaryCategory === primaryCategory) &&
        (!secondaryCategory || material.secondaryCategory === secondaryCategory),
    ),
  );
}
