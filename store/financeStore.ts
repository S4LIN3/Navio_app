import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinancialTransaction, FinancialGoal, RecurringTransaction, Bill, Budget, BudgetCategory } from '@/types';

interface FinanceState {
  transactions: FinancialTransaction[];
  goals: FinancialGoal[];
  recurringTransactions: RecurringTransaction[];
  bills: Bill[];
  budgets: Budget[];
  budgetCategories: BudgetCategory[];
  isLoading: boolean;
  
  // Transaction methods
  addTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => FinancialTransaction | undefined;
  getTransactionsByCategory: (category: string) => FinancialTransaction[];
  getTransactionsByType: (type: FinancialTransaction['type']) => FinancialTransaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => FinancialTransaction[];
  
  // Financial goal methods
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  getGoalById: (id: string) => FinancialGoal | undefined;
  getGoalsByCategory: (category: FinancialGoal['category']) => FinancialGoal[];
  
  // Recurring transaction methods
  addRecurringTransaction: (transaction: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransactions: () => void;
  
  // Bill methods
  addBill: (bill: Bill) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  getUpcomingBills: (days?: number) => Bill[];
  
  // Budget methods
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addBudgetCategory: (category: Omit<BudgetCategory, 'id'>) => void;
  updateBudgetCategory: (id: string, category: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;
  getBudgetProgress: (budgetId: string) => { spent: number; remaining: number; percentage: number };
  
  // Summary methods
  getTotalIncome: (startDate?: string, endDate?: string) => number;
  getTotalExpenses: (startDate?: string, endDate?: string) => number;
  getNetIncome: (startDate?: string, endDate?: string) => number;
  getExpensesByCategory: (startDate?: string, endDate?: string) => Record<string, number>;
  getMonthlyExpenses: (year?: number) => number[];
  getMonthlyIncome: (year?: number) => number[];
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      recurringTransactions: [],
      bills: [],
      budgets: [],
      budgetCategories: [],
      isLoading: false,
      
      // Transaction methods
      addTransaction: (transaction) => {
        const newTransaction: FinancialTransaction = {
          id: Date.now().toString(),
          ...transaction,
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions]
        }));
      },
      
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...transaction } : t
          )
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },
      
      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },
      
      getTransactionsByCategory: (category) => {
        return get().transactions.filter((t) => t.category === category);
      },
      
      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },
      
      getTransactionsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return get().transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date).getTime();
          return transactionDate >= start && transactionDate <= end;
        });
      },
      
      // Financial goal methods
      addGoal: (goal) => {
        const newGoal: FinancialGoal = {
          id: Date.now().toString(),
          ...goal,
        };
        
        set((state) => ({
          goals: [newGoal, ...state.goals]
        }));
      },
      
      updateGoal: (id, goal) => {
        set((state) => ({
          goals: state.goals.map((g) => 
            g.id === id ? { ...g, ...goal } : g
          )
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id)
        }));
      },
      
      updateGoalProgress: (id, amount) => {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === id) {
              const newAmount = g.currentAmount + amount;
              return { 
                ...g, 
                currentAmount: Math.min(newAmount, g.targetAmount)
              };
            }
            return g;
          })
        }));
      },
      
      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },
      
      getGoalsByCategory: (category) => {
        return get().goals.filter((g) => g.category === category);
      },
      
      // Recurring transaction methods
      addRecurringTransaction: (transaction) => {
        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, transaction]
        }));
      },
      
      updateRecurringTransaction: (id, transaction) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((t) => 
            t.id === id ? { ...t, ...transaction } : t
          )
        }));
      },
      
      deleteRecurringTransaction: (id) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((t) => t.id !== id)
        }));
      },
      
      processRecurringTransactions: () => {
        const today = new Date();
        const { recurringTransactions, addTransaction } = get();
        
        recurringTransactions.forEach(transaction => {
          const lastProcessed = new Date(transaction.lastProcessed);
          let nextDate = new Date(lastProcessed);
          
          // Calculate next date based on frequency
          switch (transaction.frequency) {
            case 'daily':
              nextDate.setDate(lastProcessed.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(lastProcessed.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(lastProcessed.getMonth() + 1);
              break;
            case 'yearly':
              nextDate.setFullYear(lastProcessed.getFullYear() + 1);
              break;
          }
          
          // If next date is in the past or today, process the transaction
          while (nextDate <= today) {
            // Add transaction
            addTransaction({
              date: nextDate.toISOString().split('T')[0],
              amount: transaction.amount,
              description: transaction.description,
              category: transaction.category,
              type: transaction.type,
              isRecurring: true,
            });
            
            // Update last processed date
            set((state) => ({
              recurringTransactions: state.recurringTransactions.map((t) => 
                t.id === transaction.id ? { ...t, lastProcessed: nextDate.toISOString().split('T')[0] } : t
              )
            }));
            
            // Calculate next date for next iteration
            switch (transaction.frequency) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
              case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            }
          }
        });
      },
      
      // Bill methods
      addBill: (bill) => {
        set((state) => ({
          bills: [...state.bills, bill]
        }));
      },
      
      updateBill: (id, bill) => {
        set((state) => ({
          bills: state.bills.map((b) => 
            b.id === id ? { ...b, ...bill } : b
          )
        }));
      },
      
      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id)
        }));
      },
      
      toggleBillPaid: (id) => {
        set((state) => ({
          bills: state.bills.map((b) => 
            b.id === id ? { ...b, isPaid: !b.isPaid } : b
          )
        }));
      },
      
      getUpcomingBills: (days = 30) => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);
        
        return get().bills.filter(bill => {
          if (bill.isPaid) return false;
          
          const dueDate = new Date(bill.dueDate);
          return dueDate >= today && dueDate <= endDate;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },
      
      // Budget methods
      addBudget: (budget) => {
        const newBudget: Budget = {
          id: Date.now().toString(),
          ...budget,
        };
        
        set((state) => ({
          budgets: [...state.budgets, newBudget]
        }));
      },
      
      updateBudget: (id, budget) => {
        set((state) => ({
          budgets: state.budgets.map((b) => 
            b.id === id ? { ...b, ...budget } : b
          )
        }));
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id)
        }));
      },
      
      addBudgetCategory: (category) => {
        const newCategory: BudgetCategory = {
          id: Date.now().toString(),
          ...category,
        };
        
        set((state) => ({
          budgetCategories: [...state.budgetCategories, newCategory]
        }));
      },
      
      updateBudgetCategory: (id, category) => {
        set((state) => ({
          budgetCategories: state.budgetCategories.map((c) => 
            c.id === id ? { ...c, ...category } : c
          )
        }));
      },
      
      deleteBudgetCategory: (id) => {
        set((state) => ({
          budgetCategories: state.budgetCategories.filter((c) => c.id !== id)
        }));
      },
      
      getBudgetProgress: (budgetId) => {
        const budget = get().budgets.find(b => b.id === budgetId);
        if (!budget) return { spent: 0, remaining: 0, percentage: 0 };
        
        const categories = get().budgetCategories.filter(c => c.budgetId === budgetId);
        
        // Get transactions within budget period
        const transactions = get().getTransactionsByDateRange(budget.startDate, budget.endDate)
          .filter(t => t.type === 'expense');
        
        // Calculate total spent
        let spent = 0;
        categories.forEach(category => {
          const categoryTransactions = transactions.filter(t => t.category === category.name);
          const categorySpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
          spent += categorySpent;
        });
        
        const remaining = Math.max(0, budget.amount - spent);
        const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
        
        return { spent, remaining, percentage };
      },
      
      // Summary methods
      getTotalIncome: (startDate, endDate) => {
        let transactions = get().transactions.filter(t => t.type === 'income');
        
        if (startDate && endDate) {
          transactions = get().getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'income');
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },
      
      getTotalExpenses: (startDate, endDate) => {
        let transactions = get().transactions.filter(t => t.type === 'expense');
        
        if (startDate && endDate) {
          transactions = get().getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'expense');
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },
      
      getNetIncome: (startDate, endDate) => {
        return get().getTotalIncome(startDate, endDate) - get().getTotalExpenses(startDate, endDate);
      },
      
      getExpensesByCategory: (startDate, endDate) => {
        let transactions = get().transactions.filter(t => t.type === 'expense');
        
        if (startDate && endDate) {
          transactions = get().getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'expense');
        }
        
        return transactions.reduce((categories, t) => {
          const category = t.category;
          categories[category] = (categories[category] || 0) + t.amount;
          return categories;
        }, {} as Record<string, number>);
      },
      
      getMonthlyExpenses: (year = new Date().getFullYear()) => {
        const monthlyExpenses = Array(12).fill(0);
        
        get().transactions
          .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year)
          .forEach(transaction => {
            const month = new Date(transaction.date).getMonth();
            monthlyExpenses[month] += transaction.amount;
          });
        
        return monthlyExpenses;
      },
      
      getMonthlyIncome: (year = new Date().getFullYear()) => {
        const monthlyIncome = Array(12).fill(0);
        
        get().transactions
          .filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year)
          .forEach(transaction => {
            const month = new Date(transaction.date).getMonth();
            monthlyIncome[month] += transaction.amount;
          });
        
        return monthlyIncome;
      },
    }),
    {
      name: 'pln-finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);