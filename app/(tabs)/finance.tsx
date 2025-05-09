import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  ChevronDown, 
  DollarSign, 
  Filter, 
  Plus, 
  Search, 
  X,
  BarChart3,
  Target,
  Clock,
  Repeat,
  Bell
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useFinanceStore } from '@/store/financeStore';
import { FinancialTransaction, FinancialGoal, RecurringTransaction } from '@/types';
import TransactionItem from '@/components/TransactionItem';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import FinancialGoalCard from '@/components/FinancialGoalCard';

export default function FinanceScreen() {
  const router = useRouter();
  const { 
    transactions, 
    addTransaction, 
    getTotalIncome, 
    getTotalExpenses, 
    getNetIncome,
    getExpensesByCategory,
    goals,
    addGoal,
    updateGoalProgress,
    recurringTransactions,
    addRecurringTransaction,
    processRecurringTransactions,
    bills,
    addBill,
    getUpcomingBills
  } = useFinanceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<FinancialTransaction['type'] | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<{start?: string; end?: string}>({});
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  const [addRecurringModalVisible, setAddRecurringModalVisible] = useState(false);
  const [addBillModalVisible, setAddBillModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'goals' | 'analytics' | 'budget'>('transactions');
  
  // New transaction form state
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<FinancialTransaction['type']>('expense');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // New goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalCurrentAmount, setNewGoalCurrentAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<FinancialGoal['category']>('savings');

  // New bill form state
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState('');
  const [newBillCategory, setNewBillCategory] = useState('');
  const [newBillRecurring, setNewBillRecurring] = useState(false);
  const [newBillFrequency, setNewBillFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Process recurring transactions on app load
  useEffect(() => {
    processRecurringTransactions();
  }, []);

  const categories = Array.from(
    new Set(transactions.map((transaction) => transaction.category))
  ).filter(Boolean);

  const defaultCategories = [
    'Food', 
    'Transportation', 
    'Housing', 
    'Entertainment', 
    'Shopping', 
    'Utilities', 
    'Healthcare', 
    'Education', 
    'Salary', 
    'Investment', 
    'Gift'
  ];

  const allCategories = [...new Set([...categories, ...defaultCategories])];

  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (
      searchQuery &&
      !transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (categoryFilter && transaction.category !== categoryFilter) {
      return false;
    }

    // Type filter
    if (typeFilter && transaction.type !== typeFilter) {
      return false;
    }

    // Date range filter
    if (dateRangeFilter.start && new Date(transaction.date) < new Date(dateRangeFilter.start)) {
      return false;
    }
    if (dateRangeFilter.end && new Date(transaction.date) > new Date(dateRangeFilter.end)) {
      return false;
    }

    return true;
  });

  const upcomingBills = getUpcomingBills();

  const handleAddTransaction = () => {
    if (!newAmount.trim() || isNaN(parseFloat(newAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return;
    }

    const amount = parseFloat(newAmount);

    if (isRecurring) {
      const recurringTransaction: RecurringTransaction = {
        id: Date.now().toString(),
        amount,
        description: newDescription,
        category: newCategory,
        type: newType,
        frequency: recurringFrequency,
        startDate: newDate,
        lastProcessed: newDate,
      };
      
      addRecurringTransaction(recurringTransaction);
      Alert.alert('Success', 'Recurring transaction added');
    } else {
      addTransaction({
        date: newDate,
        amount,
        description: newDescription,
        category: newCategory,
        type: newType,
      });
    }

    // Reset form
    setNewAmount('');
    setNewDescription('');
    setNewCategory('');
    setNewType('expense');
    setNewDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurringFrequency('monthly');

    setAddTransactionModalVisible(false);
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!newGoalAmount.trim() || isNaN(parseFloat(newGoalAmount))) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    const currentAmount = newGoalCurrentAmount ? parseFloat(newGoalCurrentAmount) : 0;

    if (currentAmount > targetAmount) {
      Alert.alert('Error', 'Current amount cannot be greater than target amount');
      return;
    }

    addGoal({
      title: newGoalTitle,
      targetAmount,
      currentAmount,
      deadline: newGoalDeadline || undefined,
      category: newGoalCategory,
    });

    // Reset form
    setNewGoalTitle('');
    setNewGoalAmount('');
    setNewGoalCurrentAmount('');
    setNewGoalDeadline('');
    setNewGoalCategory('savings');

    setAddGoalModalVisible(false);
  };

  const handleAddBill = () => {
    if (!newBillName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }

    if (!newBillAmount.trim() || isNaN(parseFloat(newBillAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!newBillDueDate.trim()) {
      Alert.alert('Error', 'Please enter a due date');
      return;
    }

    addBill({
      id: Date.now().toString(),
      name: newBillName,
      amount: parseFloat(newBillAmount),
      dueDate: newBillDueDate,
      category: newBillCategory || 'Bills',
      isPaid: false,
      isRecurring: newBillRecurring,
      frequency: newBillFrequency,
    });

    // Reset form
    setNewBillName('');
    setNewBillAmount('');
    setNewBillDueDate('');
    setNewBillCategory('');
    setNewBillRecurring(false);
    setNewBillFrequency('monthly');

    setAddBillModalVisible(false);
  };

  const resetFilters = () => {
    setCategoryFilter(null);
    setTypeFilter(null);
    setDateRangeFilter({});
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Type</Text>
              <View style={styles.filterOptions}>
                {['income', 'expense'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      typeFilter === type && styles.filterOptionSelected,
                    ]}
                    onPress={() => setTypeFilter(typeFilter === type ? null : type as FinancialTransaction['type'])}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        typeFilter === type && styles.filterOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptions}>
                {allCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      categoryFilter === category && styles.filterOptionSelected,
                    ]}
                    onPress={() => setCategoryFilter(categoryFilter === category ? null : category)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        categoryFilter === category && styles.filterOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Start Date</Text>
                  <View style={styles.formDateInput}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <TextInput
                      style={styles.formDateText}
                      value={dateRangeFilter.start}
                      onChangeText={(text) => setDateRangeFilter({ ...dateRangeFilter, start: text })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>End Date</Text>
                  <View style={styles.formDateInput}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <TextInput
                      style={styles.formDateText}
                      value={dateRangeFilter.end}
                      onChangeText={(text) => setDateRangeFilter({ ...dateRangeFilter, end: text })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Reset"
              onPress={resetFilters}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Apply Filters"
              onPress={applyFilters}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddTransactionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addTransactionModalVisible}
      onRequestClose={() => setAddTransactionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity
              onPress={() => setAddTransactionModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.formOptions}>
                {['income', 'expense'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.formOption,
                      newType === type && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewType(type as FinancialTransaction['type'])}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newType === type && styles.formOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Enter description"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <TextInput
                style={styles.formInput}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Enter category"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Suggested Categories</Text>
              <View style={styles.formOptions}>
                {defaultCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.formOption}
                    onPress={() => setNewCategory(category)}
                  >
                    <Text style={styles.formOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <View style={styles.formDateInput}>
                <Calendar size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formDateText}
                  value={newDate}
                  onChangeText={setNewDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.formCheckbox}>
                <TouchableOpacity
                  style={[styles.checkbox, isRecurring && styles.checkboxChecked]}
                  onPress={() => setIsRecurring(!isRecurring)}
                >
                  {isRecurring && <Repeat size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Recurring Transaction</Text>
              </View>
            </View>

            {isRecurring && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.formOptions}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((frequency) => (
                    <TouchableOpacity
                      key={frequency}
                      style={[
                        styles.formOption,
                        recurringFrequency === frequency && styles.formOptionSelected,
                      ]}
                      onPress={() => setRecurringFrequency(frequency as any)}
                    >
                      <Text
                        style={[
                          styles.formOptionText,
                          recurringFrequency === frequency && styles.formOptionTextSelected,
                        ]}
                      >
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddTransactionModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Transaction"
              onPress={handleAddTransaction}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddGoalModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addGoalModalVisible}
      onRequestClose={() => setAddGoalModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Financial Goal</Text>
            <TouchableOpacity
              onPress={() => setAddGoalModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                placeholder="Enter goal title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newGoalAmount}
                  onChangeText={setNewGoalAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newGoalCurrentAmount}
                  onChangeText={setNewGoalCurrentAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Deadline (YYYY-MM-DD)</Text>
              <View style={styles.formDateInput}>
                <Calendar size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formDateText}
                  value={newGoalDeadline}
                  onChangeText={setNewGoalDeadline}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.formOptions}>
                {['savings', 'investment', 'debt', 'purchase'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.formOption,
                      newGoalCategory === category && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewGoalCategory(category as FinancialGoal['category'])}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newGoalCategory === category && styles.formOptionTextSelected,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddGoalModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Goal"
              onPress={handleAddGoal}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddBillModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addBillModalVisible}
      onRequestClose={() => setAddBillModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Bill</Text>
            <TouchableOpacity
              onPress={() => setAddBillModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bill Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newBillName}
                onChangeText={setNewBillName}
                placeholder="Enter bill name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newBillAmount}
                  onChangeText={setNewBillAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Due Date (YYYY-MM-DD) *</Text>
              <View style={styles.formDateInput}>
                <Calendar size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formDateText}
                  value={newBillDueDate}
                  onChangeText={setNewBillDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <TextInput
                style={styles.formInput}
                value={newBillCategory}
                onChangeText={setNewBillCategory}
                placeholder="Enter category"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.formCheckbox}>
                <TouchableOpacity
                  style={[styles.checkbox, newBillRecurring && styles.checkboxChecked]}
                  onPress={() => setNewBillRecurring(!newBillRecurring)}
                >
                  {newBillRecurring && <Repeat size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Recurring Bill</Text>
              </View>
            </View>

            {newBillRecurring && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.formOptions}>
                  {['monthly', 'quarterly', 'yearly'].map((frequency) => (
                    <TouchableOpacity
                      key={frequency}
                      style={[
                        styles.formOption,
                        newBillFrequency === frequency && styles.formOptionSelected,
                      ]}
                      onPress={() => setNewBillFrequency(frequency as any)}
                    >
                      <Text
                        style={[
                          styles.formOptionText,
                          newBillFrequency === frequency && styles.formOptionTextSelected,
                        ]}
                      >
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddBillModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Bill"
              onPress={handleAddBill}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const renderAnalytics = () => {
    const expensesByCategory = getExpensesByCategory();
    const expenseData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    const monthlyData = [
      { name: 'Jan', income: 0, expense: 0 },
      { name: 'Feb', income: 0, expense: 0 },
      { name: 'Mar', income: 0, expense: 0 },
      { name: 'Apr', income: 0, expense: 0 },
      { name: 'May', income: 0, expense: 0 },
      { name: 'Jun', income: 0, expense: 0 },
      { name: 'Jul', income: 0, expense: 0 },
      { name: 'Aug', income: 0, expense: 0 },
      { name: 'Sep', income: 0, expense: 0 },
      { name: 'Oct', income: 0, expense: 0 },
      { name: 'Nov', income: 0, expense: 0 },
      { name: 'Dec', income: 0, expense: 0 },
    ];

    // Calculate monthly income and expenses
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    return (
      <ScrollView style={styles.analyticsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(getTotalIncome())}</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(getTotalExpenses())}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(getNetIncome())}</Text>
            <Text style={styles.statLabel}>Net</Text>
          </View>
        </View>

        <ChartCard
          title="Monthly Overview"
          data={monthlyData}
          type="bar"
          style={styles.chart}
          keys={['income', 'expense']}
          colors={[colors.success, colors.error]}
        />

        <ChartCard
          title="Expenses by Category"
          data={expenseData}
          type="pie"
          style={styles.chart}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recurring Transactions</Text>
        </View>

        {recurringTransactions.length > 0 ? (
          <View style={styles.recurringList}>
            {recurringTransactions.map(transaction => (
              <View key={transaction.id} style={styles.recurringItem}>
                <View style={styles.recurringItemLeft}>
                  <Repeat size={16} color={colors.primary} />
                  <View>
                    <Text style={styles.recurringItemTitle}>
                      {transaction.description || transaction.category}
                    </Text>
                    <Text style={styles.recurringItemSubtitle}>
                      {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text 
                  style={[
                    styles.recurringItemAmount,
                    { color: transaction.type === 'income' ? colors.success : colors.error }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No recurring transactions</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bills</Text>
        </View>

        {upcomingBills.length > 0 ? (
          <View style={styles.billsList}>
            {upcomingBills.map(bill => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billItemLeft}>
                  <Bell size={16} color={colors.warning} />
                  <View>
                    <Text style={styles.billItemTitle}>{bill.name}</Text>
                    <Text style={styles.billItemSubtitle}>Due: {bill.dueDate}</Text>
                  </View>
                </View>
                <Text style={styles.billItemAmount}>
                  {formatCurrency(bill.amount)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No upcoming bills</Text>
        )}
      </ScrollView>
    );
  };

  const renderGoals = () => {
    return (
      <View style={styles.goalsContainer}>
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>Financial Goals</Text>
          <Button
            title="Add Goal"
            onPress={() => setAddGoalModalVisible(true)}
            size="small"
            icon={<Plus size={16} color="#fff" />}
          />
        </View>

        {goals.length > 0 ? (
          <ScrollView style={styles.goalsList}>
            {goals.map(goal => (
              <FinancialGoalCard
                key={goal.id}
                goal={goal}
                onPress={() => {}}
                onAddFunds={(amount) => updateGoalProgress(goal.id, amount)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            title="No Financial Goals"
            message="Set financial goals to track your progress towards savings, investments, or purchases."
            icon={<Target size={40} color={colors.primary} />}
            actionLabel="Add Goal"
            onAction={() => setAddGoalModalVisible(true)}
          />
        )}
      </View>
    );
  };

  const renderBudget = () => {
    // This would be a more complex implementation with budget categories, limits, etc.
    // For now, we'll just show a simple placeholder
    return (
      <View style={styles.budgetContainer}>
        <View style={styles.budgetHeader}>
          <Text style={styles.sectionTitle}>Budget Management</Text>
          <Button
            title="Add Bill"
            onPress={() => setAddBillModalVisible(true)}
            size="small"
            icon={<Plus size={16} color="#fff" />}
          />
        </View>

        <View style={styles.budgetOverview}>
          <Text style={styles.budgetTitle}>Monthly Budget Overview</Text>
          <View style={styles.budgetStats}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatValue}>{formatCurrency(getTotalIncome())}</Text>
              <Text style={styles.budgetStatLabel}>Income</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatValue}>{formatCurrency(getTotalExpenses())}</Text>
              <Text style={styles.budgetStatLabel}>Expenses</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={[
                styles.budgetStatValue,
                { color: getNetIncome() >= 0 ? colors.success : colors.error }
              ]}>
                {formatCurrency(getNetIncome())}
              </Text>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bills</Text>
        </View>

        {upcomingBills.length > 0 ? (
          <ScrollView style={styles.billsList}>
            {upcomingBills.map(bill => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billItemLeft}>
                  <Bell size={16} color={colors.warning} />
                  <View>
                    <Text style={styles.billItemTitle}>{bill.name}</Text>
                    <Text style={styles.billItemSubtitle}>Due: {bill.dueDate}</Text>
                  </View>
                </View>
                <View style={styles.billItemRight}>
                  <Text style={styles.billItemAmount}>
                    {formatCurrency(bill.amount)}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.billItemButton, bill.isPaid && styles.billItemButtonPaid]}
                    onPress={() => {
                      useFinanceStore.getState().toggleBillPaid(bill.id);
                    }}
                  >
                    <Text style={styles.billItemButtonText}>
                      {bill.isPaid ? 'Paid' : 'Mark Paid'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            title="No Upcoming Bills"
            message="Add bills to keep track of your upcoming payments."
            icon={<Bell size={40} color={colors.primary} />}
            actionLabel="Add Bill"
            onAction={() => setAddBillModalVisible(true)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Finance',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setAddBillModalVisible(true)}
                style={styles.headerButton}
              >
                <Bell size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddTransactionModalVisible(true)}
                style={styles.headerButton}
              >
                <Plus size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(getNetIncome())}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <ArrowUpRight size={16} color={colors.success} />
              <Text style={styles.balanceItemLabel}>Income</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.success }]}>
                {formatCurrency(getTotalIncome())}
              </Text>
            </View>
            
            <View style={styles.balanceItem}>
              <ArrowDownLeft size={16} color={colors.error} />
              <Text style={styles.balanceItemLabel}>Expenses</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.error }]}>
                {formatCurrency(getTotalExpenses())}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
            onPress={() => setActiveTab('transactions')}
          >
            <DollarSign size={16} color={activeTab === 'transactions' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>Transactions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
            onPress={() => setActiveTab('goals')}
          >
            <Target size={16} color={activeTab === 'goals' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
            onPress={() => setActiveTab('budget')}
          >
            <Clock size={16} color={activeTab === 'budget' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>Budget</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} color={activeTab === 'analytics' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'transactions' && (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search transactions..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <Filter size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Recent Transactions</Text>

            {filteredTransactions.length > 0 ? (
              <ScrollView
                style={styles.transactionsContainer}
                contentContainerStyle={styles.transactionsContent}
              >
                {filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => {}}
                  />
                ))}
              </ScrollView>
            ) : (
              <EmptyState
                title="No Transactions Found"
                message={
                  searchQuery || categoryFilter || typeFilter || dateRangeFilter.start || dateRangeFilter.end
                    ? "Try adjusting your filters or search query."
                    : "You haven't added any transactions yet. Tap the + button to add your first transaction."
                }
                icon={<DollarSign size={40} color={colors.primary} />}
                actionLabel="Add Transaction"
                onAction={() => setAddTransactionModalVisible(true)}
              />
            )}
          </>
        )}

        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'budget' && renderBudget()}
      </View>

      {renderFilterModal()}
      {renderAddTransactionModal()}
      {renderAddGoalModal()}
      {renderAddBillModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  headerButton: {
    marginLeft: 16,
  },
  balanceCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceItemLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  balanceItemAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsContent: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    paddingHorizontal: 24,
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInputContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  formOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  formOptionTextSelected: {
    color: '#fff',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formDateInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formDateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  formCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  analyticsContainer: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chart: {
    marginBottom: 16,
    height: 200,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  recurringList: {
    marginBottom: 24,
  },
  recurringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  recurringItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  recurringItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recurringItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
  billsList: {
    marginBottom: 24,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  billItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  billItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  billItemRight: {
    alignItems: 'flex-end',
  },
  billItemButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  billItemButtonPaid: {
    backgroundColor: colors.success,
  },
  billItemButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  goalsContainer: {
    flex: 1,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsList: {
    flex: 1,
  },
  budgetContainer: {
    flex: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetOverview: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    alignItems: 'center',
  },
  budgetStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  budgetStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});