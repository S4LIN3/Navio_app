import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FinancialTransaction } from '@/types';
import { ArrowDownLeft, ArrowUpRight, Calendar, Repeat, Tag } from 'lucide-react-native';
import colors from '@/constants/colors';

interface TransactionItemProps {
  transaction: FinancialTransaction;
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onDelete,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.iconContainer,
          { backgroundColor: transaction.type === 'income' ? colors.success : colors.error }
        ]}
      >
        {transaction.type === 'income' ? (
          <ArrowUpRight size={16} color="#fff" />
        ) : (
          <ArrowDownLeft size={16} color="#fff" />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || transaction.category}
          </Text>
          <Text 
            style={[
              styles.amount,
              { color: transaction.type === 'income' ? colors.success : colors.error }
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount)}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.dateContainer}>
              <Calendar size={12} color={colors.textSecondary} />
              <Text style={styles.date}>
                {formatDate(transaction.date)}
              </Text>
            </View>
            
            <View style={styles.categoryContainer}>
              <Tag size={12} color={colors.textSecondary} />
              <Text style={styles.category}>
                {transaction.category}
              </Text>
            </View>
          </View>
          
          {transaction.isRecurring && (
            <View style={styles.recurringBadge}>
              <Repeat size={12} color={colors.primary} />
              <Text style={styles.recurringText}>Recurring</Text>
            </View>
          )}
        </View>
        
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  recurringText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  deleteButtonText: {
    color: colors.error,
  },
});

export default TransactionItem;