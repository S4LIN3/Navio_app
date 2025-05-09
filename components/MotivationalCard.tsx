import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MotivationalContent } from '@/types';
import { BookOpen, Heart, HeartOff, Quote, Video } from 'lucide-react-native';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface MotivationalCardProps {
  content: MotivationalContent;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const MotivationalCard: React.FC<MotivationalCardProps> = ({
  content,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const getTypeIcon = () => {
    switch (content.type) {
      case 'quote':
        return <Quote size={20} color="#fff" />;
      case 'article':
        return <BookOpen size={20} color="#fff" />;
      case 'video':
        return <Video size={20} color="#fff" />;
      default:
        return <Quote size={20} color="#fff" />;
    }
  };

  const renderQuoteCard = () => (
    <TouchableOpacity
      style={styles.quoteContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quoteGradient}
      >
        <View style={styles.quoteHeader}>
          <View style={styles.quoteIconContainer}>
            <Quote size={20} color="#fff" />
          </View>
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isFavorite ? (
              <Heart size={20} color="#fff" fill="#fff" />
            ) : (
              <HeartOff size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.quoteText}>
          "{content.content}"
        </Text>
        
        {content.author && (
          <Text style={styles.quoteAuthor}>
            — {content.author}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContentCard = () => (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {content.imageUrl ? (
          <Image 
            source={{ uri: content.imageUrl }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            {getTypeIcon()}
          </View>
        )}
        
        <View style={styles.typeContainer}>
          {getTypeIcon()}
          <Text style={styles.type}>{content.type}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        
        <Text style={styles.excerpt} numberOfLines={3}>
          {content.content}
        </Text>
        
        <View style={styles.footer}>
          {content.author && (
            <Text style={styles.author} numberOfLines={1}>
              By {content.author}
            </Text>
          )}
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isFavorite ? (
              <Heart size={16} color={colors.primary} fill={colors.primary} />
            ) : (
              <HeartOff size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return content.type === 'quote' ? renderQuoteCard() : renderContentCard();
};

const styles = StyleSheet.create({
  container: {
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
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  type: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  favoriteButton: {
    padding: 4,
  },
  quoteContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  quoteGradient: {
    padding: 20,
    minHeight: 180,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 26,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default MotivationalCard;