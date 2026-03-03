import { Goal, Habit, HealthEntry, TimeBlock, WeeklyReview, Transaction, Investment, VisionData, Budget } from '@/types/lifeos';
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
    const reflections: any[] = JSON.parse(localStorage.getItem('lifeos-reflections') || '[]');

    const rows: string[][] = [
      ['Date/Month', 'Type', 'Item', 'Status/Value', 'Details']
    ];

    // Process Vision
    if (vision.oneYearVision) rows.push(['Vision', '1-Year', 'Vision Text', vision.oneYearVision, 'Main Vision']);
    if (vision.threeYearVision) rows.push(['Vision', '3-Year', 'Vision Text', vision.threeYearVision, 'Long-term Vision']);
    if (vision.principles) vision.principles.forEach((p, i) => rows.push(['Vision', 'Principle', `Principle ${i + 1}`, p, 'Guiding Principle']));

    // Process Content
    if (content.items) {
      content.items.forEach(item => {
        rows.push([item.dueDate || 'Unknown', 'Content', item.title, item.status, `Channel: ${item.channel}, Priority: ${item.priority}`]);
      });
    }

    // Process Library
    library.forEach(entry => {
      rows.push(['Unknown', 'Library', entry.name, entry.status, `Category: ${entry.category}`]);
    });

    // Process Budgets
    budgets.forEach(b => {
      rows.push([b.month, 'Budget', b.category, formatCurrency(b.limit), 'Monthly Limit']);
    });

    // Process Reflections
    reflections.forEach(r => {
      rows.push([r.date, 'Reflection', 'Daily Entry', r.text.slice(0, 50) + '...', 'Day Reflection']);
    });

    // Process Goals
    goals.forEach(goal => {
      const date = goal.createdAt ? new Date(goal.createdAt).toISOString().slice(0, 7) : 'Unknown';
      rows.push([date, 'Goal', goal.title, goal.status, `${goal.progress}% progress`]);
    });

    // Process Habits
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        const month = date.slice(0, 7);
        rows.push([month, 'Habit', habit.name, 'Completed', `Date: ${date}`]);
      });
      const currentMonth = new Date().toISOString().slice(0, 7);
      rows.push([currentMonth, 'Habit-Streak', habit.name, habit.streak.toString(), 'Current Streak']);
    });

    // Process Health
    health.forEach(entry => {
      const month = entry.date.slice(0, 7);
      rows.push([month, 'Health', 'Mood', entry.mood.toString(), `Date: ${entry.date}`]);
      rows.push([month, 'Health', 'Sleep', `${entry.sleep}h`, `Date: ${entry.date}`]);
      rows.push([month, 'Health', 'Water', `${entry.water}L`, `Date: ${entry.date}`]);
      if (entry.workout) {
        rows.push([month, 'Health', 'Workout', entry.workout, `Date: ${entry.date}`]);
      }
    });

    // Process Blocks (Tasks)
    blocks.forEach(block => {
      const month = block.date.slice(0, 7);
      rows.push([month, 'Task', block.title, block.completed ? 'Completed' : 'Pending', `Date: ${block.date}, MIT: ${block.isMIT}`]);
    });

    // Process Reviews
    reviews.forEach(review => {
      const month = review.weekStart.slice(0, 7);
      rows.push([month, 'Weekly Review', 'Wins', review.wins, `Week Start: ${review.weekStart}`]);
      rows.push([month, 'Weekly Review', 'Losses', review.losses, `Week Start: ${review.weekStart}`]);
    });

    // Process Finance
    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      rows.push([month, 'Finance', t.type, formatCurrency(t.amount), `Category: ${t.category}${t.source ? `, Source: ${t.source}` : ''}${t.note ? `, Note: ${t.note}` : ''}`]);
    });

    investments.forEach(inv => {
      const month = inv.date.slice(0, 7);
      rows.push([month, 'Investment', inv.type, formatCurrency(inv.amount), `Name: ${inv.name}`]);
    });

    // Convert to CSV string
    const csvContent = rows.map(e => e.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `life_os_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export data:', error);
    alert('Failed to export data. Please check console for details.');
  }
};

export const exportVisionDataToCSV = (vision: VisionData) => {
  try {
    const rows: string[][] = [
      ['Section', 'Sub-Section', 'Content']
    ];

    // Principles
    vision.principles.forEach((p, i) => {
      rows.push(['Principles', `Principle ${i + 1}`, p]);
    });

    // Timeline
    rows.push(['Timeline', '3-Year Vision', vision.threeYearVision]);
    rows.push(['Timeline', '1-Year Sub-Vision', vision.oneYearVision]);
    rows.push(['Timeline', 'Q1 (Jan-Mar)', vision.quarterlyGoals.q1]);
    rows.push(['Timeline', 'Q2 (Apr-Jun)', vision.quarterlyGoals.q2]);
    rows.push(['Timeline', 'Q3 (Jul-Sep)', vision.quarterlyGoals.q3]);
    rows.push(['Timeline', 'Q4 (Oct-Dec)', vision.quarterlyGoals.q4]);

    // Core Sections
    rows.push(['8 Core Areas', 'Health', vision.coreSections.health]);
    rows.push(['8 Core Areas', 'Family', vision.coreSections.family]);
    rows.push(['8 Core Areas', 'Career', vision.coreSections.career]);
    rows.push(['8 Core Areas', 'Financial', vision.coreSections.financial]);
    rows.push(['8 Core Areas', 'Personal Growth', vision.coreSections.personalGrowth]);
    rows.push(['8 Core Areas', 'Spirituality', vision.coreSections.spirituality]);
    rows.push(['8 Core Areas', 'Social Impact', vision.coreSections.socialImpact]);
    rows.push(['8 Core Areas', 'Joy & Experience', vision.coreSections.joyExperience]);

    // Convert to CSV string
    const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vision_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export vision data:', error);
    alert('Failed to export vision data. Please check console for details.');
  }
};
export const exportFinanceDataToCSV = (transactions: Transaction[], investments: Investment[], budgets: Budget[]) => {
  try {
    const rows: string[][] = [
      ['Date/Month', 'Type', 'Category/Name', 'Amount (INR)', 'Details']
    ];

    // Transactions
    transactions.forEach(t => {
      rows.push([t.date, t.type, t.category, t.amount.toString(), t.source ? `Source: ${t.source}` : '']);
    });

    // Investments
    investments.forEach(inv => {
      rows.push([inv.date.slice(0, 10), 'Investment', inv.name, inv.amount.toString(), `Type: ${inv.type}`]);
    });

    // Budgets
    budgets.forEach(b => {
      rows.push([b.month, 'Budget', b.category, b.limit.toString(), 'Monthly Limit']);
    });

    const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export finance data:', error);
    alert('Failed to export finance data. Please check console for details.');
  }
};
export const exportGoalsDataToCSV = (goals: Goal[]) => {
  try {
    const rows: string[][] = [['Title', 'Category', 'Timeframe', 'Status', 'Progress (%)', 'Description']];
    goals.forEach(g => {
      rows.push([g.title, g.category, g.timeframe, g.status, g.progress.toString(), g.description || '']);
    });
    downloadCSV(rows, 'goals_export');
  } catch (error) {
    console.error('Failed to export goals data:', error);
  }
};

export const exportExecutionDataToCSV = (tasks: any[]) => {
  try {
    const rows: string[][] = [['Task', 'Priority', 'Status', 'Due Date']];
    tasks.forEach(t => {
      rows.push([t.content, t.priority, t.status, t.dueDate || '']);
    });
    downloadCSV(rows, 'execution_export');
  } catch (error) {
    console.error('Failed to export execution data:', error);
  }
};

export const exportHabitsDataToCSV = (habits: Habit[], health: HealthEntry[]) => {
  try {
    const rows: string[][] = [['Type', 'Name/Date', 'Status/Value', 'Details']];
    habits.forEach(h => {
      rows.push(['Habit', h.name, `Streak: ${h.streak}`, `Completions: ${h.completedDates.length}`]);
    });
    health.forEach(entry => {
      rows.push(['Health', entry.date, `Mood: ${entry.mood}, Sleep: ${entry.sleep}h, Water: ${entry.water}L`, entry.workout || '']);
    });
    downloadCSV(rows, 'habits_health_export');
  } catch (error) {
    console.error('Failed to export habits data:', error);
  }
};

export const exportContentDataToCSV = (items: any[]) => {
  try {
    const rows: string[][] = [['Title', 'Channel', 'Status', 'Priority', 'Due Date']];
    items.forEach(item => {
      rows.push([item.title, item.channel, item.status, item.priority, item.dueDate || '']);
    });
    downloadCSV(rows, 'content_pipeline_export');
  } catch (error) {
    console.error('Failed to export content data:', error);
  }
};

export const exportLibraryDataToCSV = (items: any[]) => {
  try {
    const rows: string[][] = [['Name', 'Category', 'Status', 'Progress (%)', 'Format']];
    items.forEach(item => {
      rows.push([item.name, item.category, item.status, item.progress?.toString() || '0', item.format || '']);
    });
    downloadCSV(rows, 'library_export');
  } catch (error) {
    console.error('Failed to export library data:', error);
  }
};

export const exportReflectionsDataToCSV = (items: any[]) => {
  try {
    const rows: string[][] = [['Date', 'Reflection Snippet']];
    items.forEach(item => {
      rows.push([item.date, item.text]);
    });
    downloadCSV(rows, 'reflections_export');
  } catch (error) {
    console.error('Failed to export reflections data:', error);
  }
};

const downloadCSV = (rows: string[][], filename: string) => {
  const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
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
