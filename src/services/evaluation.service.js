const STORAGE_KEY = "bluedot_evaluation_mock_v1";

const seedRecords = [
  {
    id: "ev-001", employeeName: "陈晨", examId: "exam-ai-portal", examName: "AI Portal 产品知识考核", primaryCategory: "product", secondaryCategory: "aiPortal", status: "completed", totalQuestions: 20, correct: 17, wrong: 3, score: 86, totalScore: 100, submittedAt: "2026-07-18 10:22", duration: "38分钟",
    answers: [
      { text: "知识库发布前应优先完成哪项检查？", type: "choice", employeeAnswer: "资料状态是否解析完成", answer: "资料状态是否解析完成", points: 5, score: 5, analysis: "资料解析完成后才能进行检索验证和发布。" },
      { text: "请简述知识库发布前的必要检查步骤。", type: "essay", employeeAnswer: "检查资料、权限和检索效果后发布。", answer: "确认资料解析完成，核对权限范围，执行检索测试并完成发布确认。", points: 10, score: 8, analysis: "已覆盖主要步骤，但缺少发布确认说明。" },
    ],
  },
  {
    id: "ev-002", employeeName: "林晓", examId: "exam-charter", examName: "公司章程与行为规范考试", primaryCategory: "operation", secondaryCategory: "companyCharter", status: "completed", totalQuestions: 20, correct: 14, wrong: 6, score: 72, totalScore: 100, submittedAt: "2026-07-18 11:08", duration: "45分钟",
    answers: [
      { text: "外部沟通时应优先遵循什么原则？", type: "choice", employeeAnswer: "个人偏好优先", answer: "信息真实、授权明确、表达规范", points: 5, score: 0, analysis: "外部沟通必须遵循公司制度和授权边界。" },
    ],
  },
  {
    id: "ev-003", employeeName: "周航", examId: "exam-k8s", examName: "K8s 运维基础测试", primaryCategory: "technology", secondaryCategory: "k8s", status: "pending", totalQuestions: 20, correct: 0, wrong: 0, score: null, totalScore: 100, submittedAt: "--", duration: "--", answers: [],
  },
  {
    id: "ev-004", employeeName: "王怡", examId: "exam-ai-hub", examName: "AI Hub 知识运营考核", primaryCategory: "product", secondaryCategory: "aiHub", status: "completed", totalQuestions: 15, correct: 13, wrong: 2, score: 88, totalScore: 100, submittedAt: "2026-07-19 09:35", duration: "31分钟",
    answers: [
      { text: "维护知识条目时，哪种做法有利于后续检索？", type: "choice", employeeAnswer: "为条目补充清晰标题和业务标签", answer: "为条目补充清晰标题和业务标签", points: 5, score: 5, analysis: "结构化标题和标签有助于内容检索。" },
    ],
  },
  {
    id: "ev-005", employeeName: "张敏", examId: "exam-beat", examName: "BEAT 陪练任务配置考试", primaryCategory: "product", secondaryCategory: "beat", status: "completed", totalQuestions: 20, correct: 18, wrong: 2, score: 91, totalScore: 100, submittedAt: "2026-07-19 14:12", duration: "35分钟",
    answers: [
      { text: "陪练任务发布前需要优先确认什么？", type: "choice", employeeAnswer: "参与人员与训练目标", answer: "参与人员与训练目标", points: 5, score: 5, analysis: "参与范围和训练目标决定任务配置。" },
    ],
  },
  {
    id: "ev-006", employeeName: "赵凯", examId: "exam-bams", examName: "BAMS 发布管理测试", primaryCategory: "product", secondaryCategory: "bams", status: "completed", totalQuestions: 15, correct: 11, wrong: 4, score: 76, totalScore: 100, submittedAt: "2026-07-20 10:46", duration: "42分钟",
    answers: [
      { text: "灰度发布的主要目的是什么？", type: "choice", employeeAnswer: "在有限范围内验证发布效果", answer: "在有限范围内验证发布效果", points: 5, score: 5, analysis: "灰度发布用于控制风险并验证效果。" },
    ],
  },
  {
    id: "ev-007", employeeName: "刘洋", examId: "exam-k8s", examName: "K8s 运维基础测试", primaryCategory: "technology", secondaryCategory: "k8s", status: "completed", totalQuestions: 20, correct: 16, wrong: 4, score: 82, totalScore: 100, submittedAt: "2026-07-20 15:20", duration: "46分钟",
    answers: [
      { text: "工作负载发布失败时，首先应查看哪类信息？", type: "choice", employeeAnswer: "Pod 事件和容器日志", answer: "Pod 事件和容器日志", points: 5, score: 5, analysis: "日志和事件能直接反映部署失败原因。" },
    ],
  },
  {
    id: "ev-008", employeeName: "黄璐", examId: "exam-charter", examName: "公司章程与行为规范考试", primaryCategory: "operation", secondaryCategory: "companyCharter", status: "pending", totalQuestions: 20, correct: 0, wrong: 0, score: null, totalScore: 100, submittedAt: "--", duration: "--", answers: [],
  },
  {
    id: "ev-009", employeeName: "孙悦", examId: "exam-ai-portal", examName: "AI Portal 产品知识考核", primaryCategory: "product", secondaryCategory: "aiPortal", status: "completed", totalQuestions: 20, correct: 19, wrong: 1, score: 95, totalScore: 100, submittedAt: "2026-07-21 09:18", duration: "29分钟",
    answers: [
      { text: "知识库发布前应优先完成哪项检查？", type: "choice", employeeAnswer: "资料状态是否解析完成", answer: "资料状态是否解析完成", points: 5, score: 5, analysis: "回答正确。" },
    ],
  },
  {
    id: "ev-010", employeeName: "何帆", examId: "exam-beat", examName: "BEAT 陪练任务配置考试", primaryCategory: "product", secondaryCategory: "beat", status: "completed", totalQuestions: 20, correct: 15, wrong: 5, score: 78, totalScore: 100, submittedAt: "2026-07-21 16:05", duration: "44分钟",
    answers: [
      { text: "请描述有效陪练任务结束后应关注的结果。", type: "essay", employeeAnswer: "看完成情况和得分。", answer: "关注完成情况、答题表现、薄弱知识点和后续训练建议。", points: 10, score: 6, analysis: "回答不够完整，缺少薄弱点和训练建议。" },
    ],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

function readRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return JSON.parse(stored);
  } catch {
    // 本地存储不可用时使用内存种子数据，不阻断页面浏览。
  }
  return clone(seedRecords);
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 模拟数据持久化失败不影响本次页面交互。
  }
}

function decorate(record) {
  const score = Number(record.score);
  const totalScore = Number(record.totalScore);
  return {
    ...record,
    correctRate: Number.isFinite(score) && totalScore ? Math.round((score / totalScore) * 100) : 0,
    unanswered: Math.max(0, record.totalQuestions - record.correct - record.wrong),
  };
}

function matches(record, filters) {
  const employeeName = filters.employeeName?.trim().toLowerCase();
  return (
    (!employeeName || record.employeeName.toLowerCase().includes(employeeName)) &&
    (!filters.primaryCategory || record.primaryCategory === filters.primaryCategory) &&
    (!filters.secondaryCategory || record.secondaryCategory === filters.secondaryCategory) &&
    (!filters.examId || record.examId === filters.examId) &&
    (!filters.status || record.status === filters.status)
  );
}

export async function getEvaluationList({ filters = {}, page = 1, pageSize = 8 } = {}) {
  const filtered = readRecords().filter((record) => matches(record, filters));
  const start = (page - 1) * pageSize;
  return {
    items: clone(filtered.slice(start, start + pageSize).map(decorate)),
    total: filtered.length,
  };
}

export async function getEvaluationDetail(id) {
  const record = readRecords().find((item) => item.id === id);
  return record ? clone(decorate(record)) : null;
}

export async function deleteEvaluationItems(ids) {
  const selectedIds = new Set(ids);
  const records = readRecords().filter((record) => !selectedIds.has(record.id));
  saveRecords(records);
  return { deletedCount: selectedIds.size };
}

export function getEvaluationExams({ primaryCategory = "", secondaryCategory = "" } = {}) {
  const unique = new Map();
  readRecords().forEach((record) => {
    if (
      (!primaryCategory || record.primaryCategory === primaryCategory) &&
      (!secondaryCategory || record.secondaryCategory === secondaryCategory)
    ) {
      unique.set(record.examId, {
        id: record.examId,
        name: record.examName,
        primaryCategory: record.primaryCategory,
        secondaryCategory: record.secondaryCategory,
      });
    }
  });
  return clone([...unique.values()]);
}
