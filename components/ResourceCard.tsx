import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LearningResource } from '@/types';
import ProgressBar from './ProgressBar';
import { Book, Clock, FileText, Headphones, Heart, Play, Video } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ResourceCardProps {
  resource: LearningResource;
  onPress: () => void;
  onFavorite?: () => void;
  onStartSession?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPress,
  onFavorite,
  onStartSession,
}) => {
  const getTypeIcon = () => {
    switch (resource.type) {
      case 'course':
        return <Video size={16} color={colors.primary} />;
      case 'book':
        return <Book size={16} color={colors.primary} />;
      case 'article':
        return <FileText size={16} color={colors.primary} />;
      case 'podcast':
        return <Headphones size={16} color={colors.primary} />;
      default:
        return <FileText size={16} color={colors.primary} />;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  const getPriorityColor = () => {
    if (!resource.priority) return undefined;
    
    switch (resource.priority) {
      case 'low':
        return colors.info;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return undefined;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {resource.imageUrl ? (
          <Image 
            source={{ uri: resource.imageUrl }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            {getTypeIcon()}
          </View>
        )}
        
        {resource.priority && (
          <View 
            style={[
              styles.priorityBadge, 
              { backgroundColor: getPriorityColor() }
            ]}
          >
            <Text style={styles.priorityText}>
              {resource.priority.charAt(0).toUpperCase() + resource.priority.slice(1)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {getTypeIcon()}
            <Text style={styles.type}>{resource.type}</Text>
          </View>
          
          {resource.duration && (
            <View style={styles.durationContainer}>
              <Clock size={12} color={colors.textSecondary} />
              <Text style={styles.duration}>
                {formatDuration(resource.duration)}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {resource.title}
        </Text>
        
        <Text style={styles.category}>
          {resource.category}
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={resource.progress} 
            height={4} 
            showLabel={true} 
          />
        </View>
        
        <View style={styles.actions}>
          {onFavorite && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onFavorite}
            >
              <Heart 
                size={18} 
                color={resource.favorite ? colors.error : colors.textSecondary} 
                fill={resource.favorite ? colors.error : 'none'}
              />
            </TouchableOpacity>
          )}
          
          {onStartSession && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={onStartSession}
            >
              <Play size={14} color="#fff" />
              <Text style={styles.startButtonText}>Start Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  imageContainer: {
    width: 100,
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  type: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ResourceCard;