import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Frown, Meh, Smile, SmilePlus, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

type Mood = 'terrible' | 'bad' | 'neutral' | 'good' | 'great';

interface MoodPickerProps {
  selectedMood?: Mood;
  onSelectMood: (mood: Mood) => void;
  size?: 'small' | 'medium' | 'large';
}

export const MoodPicker: React.FC<MoodPickerProps> = ({
  selectedMood,
  onSelectMood,
  size = 'medium',
}) => {
  const iconSize = size === 'small' ? 24 : size === 'medium' ? 32 : 40;
  
  const moods: { value: Mood; icon: React.ReactNode; label: string; color: string }[] = [
    { 
      value: 'terrible', 
      icon: <AlertCircle size={iconSize} color={selectedMood === 'terrible' ? '#E53E3E' : colors.textSecondary} />, 
      label: 'Terrible', 
      color: '#E53E3E' 
    },
    { 
      value: 'bad', 
      icon: <Frown size={iconSize} color={selectedMood === 'bad' ? '#F6AD55' : colors.textSecondary} />, 
      label: 'Bad', 
      color: '#F6AD55' 
    },
    { 
      value: 'neutral', 
      icon: <Meh size={iconSize} color={selectedMood === 'neutral' ? '#718096' : colors.textSecondary} />, 
      label: 'Neutral', 
      color: '#718096' 
    },
    { 
      value: 'good', 
      icon: <Smile size={iconSize} color={selectedMood === 'good' ? '#68D391' : colors.textSecondary} />, 
      label: 'Good', 
      color: '#68D391' 
    },
    { 
      value: 'great', 
      icon: <SmilePlus size={iconSize} color={selectedMood === 'great' ? '#4A6FA5' : colors.textSecondary} />, 
      label: 'Great', 
      color: '#4A6FA5' 
    },
  ];

  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.value}
          style={[
            styles.moodButton,
            selectedMood === mood.value && { borderColor: mood.color },
          ]}
          onPress={() => onSelectMood(mood.value)}
        >
          {mood.icon}
          {size !== 'small' && (
            <Text 
              style={[
                styles.moodLabel, 
                selectedMood === mood.value && { color: mood.color, fontWeight: '600' }
              ]}
            >
              {mood.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default MoodPicker;