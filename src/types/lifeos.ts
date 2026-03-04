export interface VisionPillar {
  id: string;
  title: string;
  description: string;
}

export interface VisionObjective {
  id: string;
  title: string;
  description: string;
}

export interface VisionArea {
  id: string;
  name: string;
  description: string;
}

export interface VisionData {
  pillars: VisionPillar[]; // 3 core pillars
  threeYearVision: string;
  oneYearVision: string;
  objectives: VisionObjective[]; // 5 core objectives
  areas: {
    health: string;
    career: string;
    family: string;
    personal: string;
    finance: string;
    relationship: string;
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
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
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


export interface Habit {
  id: string;
  name: string;
  category: GoalCategory;
  streak: number;
  completedDates: string[];
  priority: 'Low' | 'Medium' | 'High';
  startDate?: string;
  endDate?: string;
  weekdays?: number[]; // 0-6 for Sun-Sat
  description?: string;
}

export interface HealthEntry {
  date: string;
  sleep: number;
  water: number;
  workout: string;
  mood: number;
  energy: number;
}

export type HealthData = HealthEntry;

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
  description?: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: string;
  limit: number;
  spent?: number;
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
  startDate?: string;
  endDate?: string;
  velocity?: number; // Represented in hours
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
  deadline?: string;
  linkedIds?: string[];
}
