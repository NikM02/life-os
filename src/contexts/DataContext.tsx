import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { supabase } from '@/lib/supabase';
import {
    VisionData, Goal, ExecutionData, Transaction,
    Investment, Budget, ContentPipelineData, KnowledgeEntry, Habit, HealthEntry,
    TimeBlock, WeeklyReview, DailyReflection
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
    reflections: DailyReflection[];
    setReflections: (data: DailyReflection[]) => void;
    user: any | null;
    pushAllToCloud: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = React.useState<any | null>(null);
    const [isInitialLoadDone, setIsInitialLoadDone] = React.useState(false);

    const [vision, setVision] = useLocalStorage<VisionData>('lifeos-vision', {
        principles: [],
        threeYearVision: '',
        oneYearVision: '',
        quarterlyGoals: { q1: '', q2: '', q3: '', q4: '' },
        coreSections: {
            health: '', family: '', career: '', financial: '',
            personalGrowth: '', spirituality: '', socialImpact: '', joyExperience: ''
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
    const [reflections, setReflections] = useLocalStorage<DailyReflection[]>('lifeos-reflections', []);

    // Handle Auth changes
    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toSnakeCase = (obj: any) => {
        const snake: any = {};
        for (const key in obj) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            snake[snakeKey] = obj[key];
        }
        return snake;
    };

    const toCamelCase = (obj: any) => {
        const camel: any = {};
        for (const key in obj) {
            const camelKey = key.replace(/([-_][a-z])/g, group =>
                group.toUpperCase().replace('-', '').replace('_', '')
            );
            camel[camelKey] = obj[key];
        }
        return camel;
    };

    // Fetch initial data from Supabase once logged in
    React.useEffect(() => {
        if (!user) {
            setIsInitialLoadDone(false);
            return;
        }

        const loadSupabaseData = async () => {
            const tables = ['vision', 'goals', 'execution', 'transactions', 'investments', 'budgets', 'content', 'library', 'habits', 'health', 'blocks', 'reviews', 'reflections'];

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('user_id', user.id);

                if (data && !error) {
                    if (data.length > 0) {
                        // Data exists in Supabase, load it
                        const mappedData = data.map(item => toCamelCase(item));
                        switch (table) {
                            case 'vision': if (data[0]) setVision(data[0].data); break;
                            case 'goals': setGoals(mappedData); break;
                            case 'execution': if (data[0]) setExecution(data[0].data); break;
                            case 'transactions': setTransactions(mappedData); break;
                            case 'investments': setInvestments(mappedData); break;
                            case 'budgets': setBudgets(mappedData); break;
                            case 'content': if (data[0]) setContent(data[0].data); break;
                            case 'library': setLibrary(mappedData); break;
                            case 'habits': setHabits(mappedData); break;
                            case 'health': setHealth(mappedData); break;
                            case 'blocks': setBlocks(mappedData); break;
                            case 'reviews': setReviews(mappedData); break;
                            case 'reflections': setReflections(mappedData); break;
                        }
                    } else {
                        // Table is empty in Supabase, check if we have local data to push
                        let localData: any = null;
                        let isArray = true;
                        switch (table) {
                            case 'vision': localData = vision; isArray = false; break;
                            case 'goals': localData = goals; break;
                            case 'execution': localData = execution; isArray = false; break;
                            case 'transactions': localData = transactions; break;
                            case 'investments': localData = investments; break;
                            case 'budgets': localData = budgets; break;
                            case 'content': localData = content; isArray = false; break;
                            case 'library': localData = library; break;
                            case 'habits': localData = habits; break;
                            case 'health': localData = health; break;
                            case 'blocks': localData = blocks; break;
                            case 'reviews': localData = reviews; break;
                            case 'reflections': localData = reflections; break;
                        }

                        if (localData && (isArray ? localData.length > 0 : Object.keys(localData).length > 0)) {
                            console.log(`Initial push for table ${table}`);
                            if (isArray) {
                                const snakeData = localData.map((item: any) => ({ ...toSnakeCase(item), user_id: user.id }));
                                await supabase.from(table).insert(snakeData);
                            } else {
                                await supabase.from(table).upsert({ user_id: user.id, data: localData, updated_at: new Date().toISOString() });
                            }
                        }
                    }
                }
            }
            setIsInitialLoadDone(true);
        };

        loadSupabaseData();
    }, [user]);

    // Sync helpers (generic upsert)
    const sync = async (table: string, data: any, isArray: boolean = true) => {
        if (!user || !isInitialLoadDone) return;

        try {
            if (isArray) {
                // Delete existing records to sync fresh (simple replacement)
                const { error: deleteError } = await supabase.from(table).delete().eq('user_id', user.id);
                if (deleteError) throw deleteError;

                if (data.length > 0) {
                    const snakeData = data.map((item: any) => ({ ...toSnakeCase(item), user_id: user.id }));
                    const { error: insertError } = await supabase.from(table).insert(snakeData);
                    if (insertError) throw insertError;
                }
            } else {
                // Upsert single objects (stored in JSONB 'data' column, so no mapping needed for internal keys)
                await supabase.from(table).upsert({
                    user_id: user.id,
                    data,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            }
        } catch (err) {
            console.error(`Sync error for table ${table}:`, err);
        }
    };

    // Manual push all data to Supabase
    const pushAllToCloud = async () => {
        if (!user || !isInitialLoadDone) return;

        const tables = [
            { name: 'vision', data: vision, isArray: false },
            { name: 'goals', data: goals, isArray: true },
            { name: 'execution', data: execution, isArray: false },
            { name: 'transactions', data: transactions, isArray: true },
            { name: 'investments', data: investments, isArray: true },
            { name: 'budgets', data: budgets, isArray: true },
            { name: 'content', data: content, isArray: false },
            { name: 'library', data: library, isArray: true },
            { name: 'habits', data: habits, isArray: true },
            { name: 'health', data: health, isArray: true },
            { name: 'blocks', data: blocks, isArray: true },
            { name: 'reviews', data: reviews, isArray: true },
            { name: 'reflections', data: reflections, isArray: true },
        ];

        for (const table of tables) {
            await sync(table.name, table.data, table.isArray);
        }
    };

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
            reflections, setReflections,
            user,
            pushAllToCloud
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
