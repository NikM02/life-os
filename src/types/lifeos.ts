export interface VisionData {
  principles: string[];
  threeYearVision: string;
  oneYearVision: string;
  quarterlyGoals: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  coreSections: {
    health: string;
    family: string;
    career: string;
    financial: string;
    personalGrowth: string;
    spirituality: string;
    socialImpact: string;
    joyExperience: string;
  };
}

export type GoalCategory = 'Wealth' | 'Health' | 'Skills' | 'Relationships' | 'Spiritual' | 'Lifestyle' | 'Books' | 'Finance' | 'Networking';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Half Done' | 'Completed';
export type GoalTimeframe = 'Monthly' | 'Weekly';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  timeframe: GoalTimeframe;
  parentId?: string;
  progress: number;
  isHabit?: boolean;
  createdAt: string;
  fromDate?: string;
  toDate?: string;
  remarks?: string;
  linkedIds?: string[];
}

export interface TimeBlock {
  id: string;
  title: string;
  startHour: number;
  endHour: number;
  isMIT: boolean;
  completed: boolean;
  date: string;
}

export interface DailyReflection {
  id: string;
  date: string;
  text: string;
}

export interface Habit {
  id: string;
  name: string;
  category: GoalCategory;
  streak: number;
  completedDates: string[];
}

export interface HealthEntry {
  date: string;
  sleep: number;
  water: number;
  workout: string;
  mood: number;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  wins: string;
  losses: string;
  lessons: string;
  energy: number;
  goalProgress: number;
}

// Finance Tracker Types
export type TransactionType = 'Income' | 'Expense';
export type IncomeSource = 'Job' | 'YouTube' | 'AdSense' | 'PayPal' | 'Other';
export type InvestmentType = 'Bonds' | 'Stocks' | 'FD' | 'SIP' | 'Commodities';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  source?: IncomeSource;
  note?: string;
  linkedIds?: string[];
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  amount: number;
  date: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: string;
  limit: number;
}

export interface FinanceDistribution {
  emergencyFund: number; // 25%
  investments: number; // 25%
  bills: number; // 30%
  spending: number; // 20%
}

// Execution Kanban Types
export type KanbanPriority = 'Low' | 'Medium' | 'High';

export interface KanbanTask {
  id: string;
  content: string;
  description?: string;
  status: string; // columnId
  priority: KanbanPriority;
  dueDate?: string;
  velocity?: number; // Represented in hours
  createdAt: string;
  linkedIds?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface ExecutionData {
  tasks: KanbanTask[];
  columns: KanbanColumn[];
}

// Content Pipeline Types
export type ContentStatus = 'Idea' | 'Script & Thumbnail' | 'Outline & Draft' | 'Published';

export interface ContentItem {
  id: string;
  title: string;
  channel: string;
  status: ContentStatus;
  priority: 'Low' | 'Medium' | 'High';
  hook?: string;
  description?: string;
  dueDate?: string;
  publishedDate?: string;
  // Performance
  views48h?: number;
  views7d?: number;
  ctr?: number;
  notes?: string;
  linkedIds?: string[];
}

export interface ContentSOP {
  channel: string;
  scriptTemplate: string;
  filmingChecklist: string[];
  editingChecklist: string[];
  uploadChecklist: string[];
}

export interface ContentPipelineData {
  items: ContentItem[];
  sops: ContentSOP[];
}
// Knowledge Library Types
export type KnowledgeCategory = 'Books' | 'Course' | 'Article' | 'Video' | 'Others';
export type KnowledgeStatus = 'Not Started' | 'Half Done' | 'Completed';

export interface KnowledgeEntry {
  id: string;
  name: string;
  description: string;
  category: KnowledgeCategory;
  status: KnowledgeStatus;
  link?: string;
  isLiked: boolean;
  createdAt: string;
  linkedIds?: string[];
}
