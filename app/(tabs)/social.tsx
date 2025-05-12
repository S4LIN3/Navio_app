import React, { useState } from 'react';
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
  Image
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Filter, 
  Plus, 
  Search, 
  Users, 
  X 
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSocialStore } from '@/store/socialStore';
import { SocialConnection } from '@/types';
import ConnectionCard from '@/components/ConnectionCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

export default function SocialScreen() {
  const { connections, addConnection } = useSocialStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [relationshipFilter, setRelationshipFilter] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [addConnectionModalVisible, setAddConnectionModalVisible] = useState(false);
  
  // New connection form state
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState<SocialConnection['relationship']>('friend');
  const [newContactFrequency, setNewContactFrequency] = useState<SocialConnection['contactFrequency']>('monthly');
  const [newNotes, setNewNotes] = useState('');

  const relationships: SocialConnection['relationship'][] = [
    'family',
    'friend',
    'colleague',
    'acquaintance',
  ];

  const contactFrequencies: SocialConnection['contactFrequency'][] = [
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
  ];

  const filteredConnections = connections.filter((connection) => {
    // Search filter
    if (
      searchQuery &&
      !connection.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !connection.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Relationship filter
    if (relationshipFilter && connection.relationship !== relationshipFilter) {
      return false;
    }

    // Contact frequency filter
    if (contactFilter && connection.contactFrequency !== contactFilter) {
      return false;
    }

    return true;
  });

  const handleAddConnection = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    addConnection({
      name: newName,
      relationship: newRelationship,
      contactFrequency: newContactFrequency,
      notes: newNotes,
    });

    // Reset form
    setNewName('');
    setNewRelationship('friend');
    setNewContactFrequency('monthly');
    setNewNotes('');

    setAddConnectionModalVisible(false);
  };

  const resetFilters = () => {
    setRelationshipFilter(null);
    setContactFilter(null);
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
            <Text style={styles.modalTitle}>Filter Connections</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Relationship</Text>
              <View style={styles.filterOptions}>
                {relationships.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    style={[
                      styles.filterOption,
                      relationshipFilter === relationship && styles.filterOptionSelected,
                    ]}
                    onPress={() => setRelationshipFilter(relationshipFilter === relationship ? null : relationship)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        relationshipFilter === relationship && styles.filterOptionTextSelected,
                      ]}
                    >
                      {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Contact Frequency</Text>
              <View style={styles.filterOptions}>
                {contactFrequencies.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.filterOption,
                      contactFilter === frequency && styles.filterOptionSelected,
                    ]}
                    onPress={() => setContactFilter(contactFilter === frequency ? null : frequency)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        contactFilter === frequency && styles.filterOptionTextSelected,
                      ]}
                    >
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
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

  const renderAddConnectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addConnectionModalVisible}
      onRequestClose={() => setAddConnectionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Connection</Text>
            <TouchableOpacity
              onPress={() => setAddConnectionModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Relationship</Text>
              <View style={styles.formOptions}>
                {relationships.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    style={[
                      styles.formOption,
                      newRelationship === relationship && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewRelationship(relationship)}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newRelationship === relationship && styles.formOptionTextSelected,
                      ]}
                    >
                      {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Frequency</Text>
              <View style={styles.formOptions}>
                {contactFrequencies.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.formOption,
                      newContactFrequency === frequency && styles.formOptionSelected,
                    ]}
                    onPress={() => setNewContactFrequency(frequency)}
                  >
                    <Text
                      style={[
                        styles.formOptionText,
                        newContactFrequency === frequency && styles.formOptionTextSelected,
                      ]}
                    >
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="Add notes about this connection"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setAddConnectionModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Connection"
              onPress={handleAddConnection}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Social Connections',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setAddConnectionModalVisible(true)}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search connections..."
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

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{connections.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {connections.filter(c => c.relationship === 'family' || c.relationship === 'friend').length}
            </Text>
            <Text style={styles.statLabel}>Close</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {connections.filter(c => {
                if (!c.lastContact) return true;
                
                const lastContact = new Date(c.lastContact);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastContact.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                switch (c.contactFrequency) {
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
              }).length}
            </Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
        </View>

        {filteredConnections.length > 0 ? (
          <ScrollView
            style={styles.connectionsContainer}
            contentContainerStyle={styles.connectionsContent}
          >
            {filteredConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            title="No Connections Found"
            message={
              searchQuery || relationshipFilter || contactFilter
                ? "Try adjusting your filters or search query."
                : "You haven't added any connections yet. Tap the + button to add your first connection."
            }
            icon={<Users size={40} color={colors.primary} />}
            actionLabel="Add Connection"
            onAction={() => setAddConnectionModalVisible(true)}
          />
        )}
      </View>

      {renderFilterModal()}
      {renderAddConnectionModal()}
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
  headerButton: {
    marginRight: 16,
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
  statsContainer: {
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  connectionsContainer: {
    flex: 1,
  },
  connectionsContent: {
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
  formTextarea: {
    minHeight: 100,
    paddingTop: 12,
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
});