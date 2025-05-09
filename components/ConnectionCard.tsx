import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SocialConnection } from '@/types';
import { Calendar, Phone, User } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ConnectionCardProps {
  connection: SocialConnection;
  onPress: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onPress,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatLastContact = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const lastContact = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastContact.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  const isDueForContact = () => {
    if (!connection.lastContact) return true;
    
    const lastContact = new Date(connection.lastContact);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastContact.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    switch (connection.contactFrequency) {
      case 'daily':
        return diffDays >= 1;
      case 'weekly':
        return diffDays >= 7;
      case 'monthly':
        return diffDays >= 30;
      case 'quarterly':
        return diffDays >= 90;
      case 'yearly':
        return diffDays >= 365;
      default:
        return false;
    }
  };

  const relationshipColors = {
    family: colors.primary,
    friend: colors.success,
    colleague: colors.info,
    acquaintance: colors.textSecondary,
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDueForContact() && styles.dueContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {connection.avatar ? (
          <Image 
            source={{ uri: connection.avatar }} 
            style={styles.avatar} 
          />
        ) : (
          <View 
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: relationshipColors[connection.relationship] }
            ]}
          >
            <Text style={styles.initials}>
              {getInitials(connection.name)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{connection.name}</Text>
        
        <View style={styles.relationshipContainer}>
          <User size={12} color={relationshipColors[connection.relationship]} />
          <Text 
            style={[
              styles.relationship,
              { color: relationshipColors[connection.relationship] }
            ]}
          >
            {connection.relationship}
          </Text>
        </View>
        
        <View style={styles.contactContainer}>
          <Calendar size={12} color={colors.textSecondary} />
          <Text style={styles.lastContact}>
            Last contact: {formatLastContact(connection.lastContact)}
          </Text>
        </View>
        
        <View style={styles.frequencyContainer}>
          <Phone size={12} color={colors.textSecondary} />
          <Text style={styles.frequency}>
            Contact: {connection.contactFrequency}
          </Text>
        </View>
      </View>
      
      {isDueForContact() && (
        <View style={styles.dueBadge}>
          <Text style={styles.dueText}>Due</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  dueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  relationshipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  relationship: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  frequency: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  dueBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ConnectionCard;