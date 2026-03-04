import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
    VisionData, Goal, ExecutionData, Transaction,
    Investment, Budget, ContentPipelineData, KnowledgeEntry, Habit, HealthEntry,
    TimeBlock, WeeklyReview
} from '@/types/lifeos';

interface DataContextType {
    vision: VisionData;
    setVision: (data: VisionData) => void;
    goals: Goal[];
    setGoals: (goals: Goal[]) => void;
    execution: ExecutionData;
    setExecution: (data: ExecutionData) => void;
    transactions: Transaction[];
    setTransactions: (data: Transaction[]) => void;
    investments: Investment[];
    setInvestments: (data: Investment[]) => void;
    budgets: Budget[];
    setBudgets: (data: Budget[]) => void;
    content: ContentPipelineData;
    setContent: (data: ContentPipelineData) => void;
    library: KnowledgeEntry[];
    setLibrary: (data: KnowledgeEntry[]) => void;
    habits: Habit[];
    setHabits: (data: Habit[]) => void;
    health: HealthEntry[];
    setHealth: (data: HealthEntry[]) => void;
    blocks: TimeBlock[];
    setBlocks: (data: TimeBlock[]) => void;
    reviews: WeeklyReview[];
    setReviews: (data: WeeklyReview[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [vision, setVision] = useLocalStorage<VisionData>('lifeos-vision', {
        pillars: [
            { id: '1', title: 'Pillar I', description: '' },
            { id: '2', title: 'Pillar II', description: '' },
            { id: '3', title: 'Pillar III', description: '' }
        ],
        threeYearVision: '',
        oneYearVision: '',
        objectives: [
            { id: '1', title: 'Objective 1', description: '' },
            { id: '2', title: 'Objective 2', description: '' },
            { id: '3', title: 'Objective 3', description: '' },
            { id: '4', title: 'Objective 4', description: '' },
            { id: '5', title: 'Objective 5', description: '' }
        ],
        areas: {
            health: '',
            career: '',
            family: '',
            personal: '',
            finance: '',
            relationship: ''
        }
    });
    const [goals, setGoals] = useLocalStorage<Goal[]>('lifeos-goals', []);
    const [execution, setExecution] = useLocalStorage<ExecutionData>('lifeos-execution', {
        tasks: [],
        columns: [{ id: 'todo', title: 'To Do' }, { id: 'in-progress', title: 'In Progress' }, { id: 'done', title: 'Done' }]
    });
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('lifeos-transactions', []);
    const [investments, setInvestments] = useLocalStorage<Investment[]>('lifeos-investments', []);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>('lifeos-budgets', []);
    const [content, setContent] = useLocalStorage<ContentPipelineData>('lifeos-content', { items: [], sops: [] });
    const [library, setLibrary] = useLocalStorage<KnowledgeEntry[]>('lifeos-library', []);
    const [habits, setHabits] = useLocalStorage<Habit[]>('lifeos-habits', []);
    const [health, setHealth] = useLocalStorage<HealthEntry[]>('lifeos-health', []);
    const [blocks, setBlocks] = useLocalStorage<TimeBlock[]>('lifeos-blocks', []);
    const [reviews, setReviews] = useLocalStorage<WeeklyReview[]>('lifeos-reviews', []);

    return (
        <DataContext.Provider value={{
            vision, setVision,
            goals, setGoals,
            execution, setExecution,
            transactions, setTransactions,
            investments, setInvestments,
            budgets, setBudgets,
            content, setContent,
            library, setLibrary,
            habits, setHabits,
            health, setHealth,
            blocks, setBlocks,
            reviews, setReviews,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
