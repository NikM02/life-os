import { Goal, Habit, HealthEntry, TimeBlock, WeeklyReview, Transaction, Investment, VisionData, Budget, ContentPipelineData } from '@/types/lifeos';
import { formatCurrency } from './finance-utils';

export const exportAllDataToCSV = () => {
  try {
    const goals: Goal[] = JSON.parse(localStorage.getItem('lifeos-goals') || '[]');
    const habits: Habit[] = JSON.parse(localStorage.getItem('lifeos-habits') || '[]');
    const health: HealthEntry[] = JSON.parse(localStorage.getItem('lifeos-health') || '[]');
    const blocks: TimeBlock[] = JSON.parse(localStorage.getItem('lifeos-blocks') || '[]');
    const reviews: WeeklyReview[] = JSON.parse(localStorage.getItem('lifeos-reviews') || '[]');
    const transactions: Transaction[] = JSON.parse(localStorage.getItem('lifeos-transactions') || '[]');
    const investments: Investment[] = JSON.parse(localStorage.getItem('lifeos-investments') || '[]');
    const vision: VisionData = JSON.parse(localStorage.getItem('lifeos-vision') || '{}');
    const content: { items: any[] } = JSON.parse(localStorage.getItem('lifeos-content') || '{"items":[]}');
    const library: any[] = JSON.parse(localStorage.getItem('lifeos-library') || '[]');
    const budgets: Budget[] = JSON.parse(localStorage.getItem('lifeos-budgets') || '[]');

    const rows: string[][] = [
      ['Category', 'Sub-Category', 'Item', 'Status/Value', 'Details']
    ];

    // Vision
    if (vision.threeYearVision) rows.push(['Vision', '3-Year', 'Trajectory', vision.threeYearVision, 'Long-term']);
    if (vision.oneYearVision) rows.push(['Vision', '1-Year', 'Azimuth', vision.oneYearVision, 'Short-term']);
    (vision.pillars || []).forEach(p => rows.push(['Vision', 'Pillar', p.title, p.description, 'Core Pillar']));
    (vision.objectives || []).forEach(o => rows.push(['Vision', 'Objective', o.title, o.description, 'Core Objective']));

    // Content
    (content.items || []).forEach(item => {
      rows.push(['Content', item.channel, item.title, item.status, `Priority: ${item.priority}`]);
    });

    // Library
    library.forEach(entry => {
      rows.push(['Library', entry.category, entry.name, entry.status, '']);
    });

    // Finance
    budgets.forEach(b => {
      rows.push(['Finance', 'Budget', b.category, formatCurrency(b.limit), b.month]);
    });
    transactions.forEach(t => {
      rows.push(['Finance', 'Transaction', t.category, formatCurrency(t.amount), `${t.type} on ${t.date}`]);
    });
    investments.forEach(inv => {
      rows.push(['Finance', 'Investment', inv.name, formatCurrency(inv.amount), inv.type]);
    });

    // Goals
    goals.forEach(goal => {
      rows.push(['Goal', goal.category, goal.title, goal.status, `${goal.progress}%`]);
    });

    // Habits & Health
    habits.forEach(habit => {
      rows.push(['Habit', habit.category, habit.name, habit.streak.toString(), 'Current Streak']);
    });
    health.forEach(entry => {
      rows.push(['Health', 'Daily', entry.date, `Mood: ${entry.mood}`, `Sleep: ${entry.sleep}h`]);
    });

    downloadCSV(rows, 'life_os_full_export');
  } catch (error) {
    console.error('Failed to export all data:', error);
  }
};

export const exportVisionDataToCSV = (vision: VisionData) => {
  try {
    const rows: string[][] = [['Category', 'Title/Type', 'Content']];
    (vision.pillars || []).forEach((p) => {
      rows.push(['Core Pillar', p.title, p.description || '']);
    });
    rows.push(['Timeline', '3-Year Vision', vision.threeYearVision || '']);
    rows.push(['Timeline', '1-Year Sub-Vision', vision.oneYearVision || '']);
    (vision.objectives || []).forEach((obj) => {
      rows.push(['Core Objective', obj.title, obj.description || '']);
    });
    if (vision.areas) {
      Object.entries(vision.areas).forEach(([key, value]) => {
        rows.push(['Domain Area', key, value || '']);
      });
    }
    downloadCSV(rows, 'vision_export');
  } catch (error) {
    console.error('Failed to export vision data:', error);
  }
};

export const exportGoalsDataToCSV = (goals: Goal[]) => {
  try {
    const rows: string[][] = [['Title', 'Category', 'Quarter', 'Status', 'Progress (%)', 'Description']];
    goals.forEach(g => {
      rows.push([g.title, g.category, g.quarter || 'N/A', g.status, g.progress.toString(), g.description || '']);
    });
    downloadCSV(rows, 'goals_export');
  } catch (error) {
    console.error('Failed to export goals data:', error);
  }
};

export const exportExecutionDataToCSV = (tasks: any[]) => {
  try {
    const rows: string[][] = [['Task', 'Priority', 'Status', 'Due Date', 'Description']];
    tasks.forEach(t => {
      rows.push([t.content, t.priority, t.status, t.dueDate || '', t.description || '']);
    });
    downloadCSV(rows, 'execution_export');
  } catch (error) {
    console.error('Failed to export execution data:', error);
  }
};

export const exportContentDataToCSV = (content: ContentPipelineData | any) => {
  try {
    const items = Array.isArray(content) ? content : (content.items || []);
    const rows: string[][] = [['ID', 'Asset Categories', 'Title', 'Description', 'Status', 'Velocity', 'Start Date', 'End Date']];
    items.forEach((item: any) => {
      rows.push([
        item.id,
        item.channel,
        item.title,
        item.description || '',
        item.status,
        (item.velocity || 0).toString(),
        item.startDate || '',
        item.endDate || ''
      ]);
    });
    downloadCSV(rows, 'content_pipeline_export');
  } catch (error) {
    console.error('Failed to export content data:', error);
  }
};

export const exportLibraryDataToCSV = (items: any[]) => {
  try {
    const rows: string[][] = [['id', 'title', 'description', 'type', 'deadline']];
    items.forEach(item => {
      rows.push([item.id, item.name, item.description || '', item.category, item.deadline || '']);
    });
    downloadCSV(rows, 'library_export');
  } catch (error) {
    console.error('Failed to export library data:', error);
  }
};

export const exportFinanceDataToCSV = (transactions: Transaction[], investments: Investment[], budgets: Budget[]) => {
  try {
    const rows: string[][] = [['Date/Month', 'Type', 'Category/Name', 'Amount (INR)', 'Details']];
    transactions.forEach(t => rows.push([t.date, t.type, t.category, t.amount.toString(), t.note || '']));
    investments.forEach(inv => rows.push([inv.date, 'Investment', inv.name, inv.amount.toString(), inv.type]));
    budgets.forEach(b => rows.push([b.month, 'Budget', b.category, b.limit.toString(), 'Limit']));
    downloadCSV(rows, 'finance_export');
  } catch (error) {
    console.error('Failed to export finance data:', error);
  }
};

export const exportHabitsDataToCSV = (habits: Habit[], health: HealthEntry[]) => {
  try {
    const rows: string[][] = [['Type', 'ID', 'Habit Name', 'Category', 'Priority', 'Start Date', 'End Date', 'Description', 'Streak']];
    habits.forEach(h => {
      rows.push(['Habit', h.id, h.name, h.category, h.priority, h.startDate || '', h.endDate || '', h.description || '', h.streak.toString()]);
    });
    downloadCSV(rows, 'habits_export');
  } catch (error) {
    console.error('Failed to export habits data:', error);
  }
};

export const exportHealthDataToCSV = (health: HealthEntry[]) => {
  try {
    const rows: string[][] = [['Date', 'Sleep (h)', 'Water (L)', 'Mood (1-10)', 'Energy (1-10)', 'Workout']];
    health.sort((a, b) => b.date.localeCompare(a.date)).forEach(h => {
      rows.push([h.date, h.sleep.toString(), h.water.toString(), h.mood.toString(), h.energy.toString(), h.workout || '']);
    });
    downloadCSV(rows, 'biological_archive');
  } catch (error) {
    console.error('Failed to export health data:', error);
  }
};

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const rows = [['ID', 'Categories', 'Balance', 'Transaction', 'Transaction Type', 'Date', 'Description', 'Amount']];
  let currentBalance = 0;
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
    if (t.type === 'Income') currentBalance += t.amount;
    else currentBalance -= t.amount;
    rows.push([t.id, t.category, currentBalance.toString(), t.note || '', t.type, t.date, t.note || '', t.amount.toString()]);
  });
  downloadCSV(rows, 'transactions_export');
};

export const exportBudgetsToCSV = (budgets: Budget[]) => {
  const rows = [['Categories', 'Month', 'Amount', 'Spent']];
  budgets.forEach(b => rows.push([b.category, b.month, b.limit.toString(), (b.spent || 0).toString()]));
  downloadCSV(rows, 'budgets_export');
};

export const exportPortfolioToCSV = (investments: Investment[]) => {
  const rows = [['Title', 'Type', 'Date', 'Amount', 'Description']];
  investments.forEach(inv => rows.push([inv.name, inv.type, inv.date, inv.amount.toString(), inv.description || '']));
  downloadCSV(rows, 'portfolio_export');
};

const downloadCSV = (rows: string[][], filename: string) => {
  const csvContent = rows.map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
