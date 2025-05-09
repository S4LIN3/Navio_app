import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { FinancialGoal } from '@/types';
import ProgressBar from './ProgressBar';
import { Calendar, DollarSign, Plus } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from './Button';

interface FinancialGoalCardProps {
  goal: FinancialGoal;
  onPress: () => void;
  onAddFunds?: (amount: number) => void;
}

export const FinancialGoalCard: React.FC<FinancialGoalCardProps> = ({
  goal,
  onPress,
  onAddFunds,
}) => {
  const [addFundsModalVisible, setAddFundsModalVisible] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const getProgressPercentage = () => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getCategoryColor = () => {
    switch (goal.category) {
      case 'savings':
        return colors.primary;
      case 'investment':
        return colors.success;
      case 'debt':
        return colors.error;
      case 'purchase':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const handleAddFunds = () => {
    if (!fundAmount.trim() || isNaN(parseFloat(fundAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(fundAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero');
      return;
    }

    if (onAddFunds) {
      onAddFunds(amount);
    }

    setFundAmount('');
    setAddFundsModalVisible(false);
  };

  const renderAddFundsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addFundsModalVisible}
      onRequestClose={() => setAddFundsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Funds to Goal</Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={fundAmount}
                onChangeText={setFundAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddFundsModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Funds"
              onPress={handleAddFunds}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View 
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor() }
          ]}
        >
          <Text style={styles.categoryText}>
            {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
          </Text>
        </View>
        
        {goal.deadline && (
          <View style={styles.deadlineContainer}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.deadlineText}>{goal.deadline}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.title}>{goal.title}</Text>
      
      <View style={styles.amountsContainer}>
        <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
        <Text style={styles.targetAmount}>of {formatCurrency(goal.targetAmount)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={getProgressPercentage()} 
          height={8} 
          showLabel={false}
          color={getCategoryColor()}
        />
        <Text style={styles.progressText}>{getProgressPercentage().toFixed(0)}%</Text>
      </View>
      
      {onAddFunds && (
        <TouchableOpacity 
          style={styles.addFundsButton}
          onPress={() => setAddFundsModalVisible(true)}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={styles.addFundsText}>Add Funds</Text>
        </TouchableOpacity>
      )}
      
      {renderAddFundsModal()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  amountsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  targetAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  addFundsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '80%',
    padding: 24,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
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
  modalFooter: {
    flexDirection: 'row',
  },
});

export default FinancialGoalCard;