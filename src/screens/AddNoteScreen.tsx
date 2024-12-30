import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute, CommonActions } from '@react-navigation/native';
import { addNote, updateNote } from '../services/noteService';
import { RootStackParamList } from '../types/navigation';

type AddNoteRouteProp = RouteProp<RootStackParamList, 'AddNote'>;

export const AddNoteScreen = () => {
  const route = useRoute<AddNoteRouteProp>();
  const { note, isEditing } = route.params || {};
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPublic, setIsPublic] = useState(note?.is_public === 1);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Uyarı', 'Başlık ve içerik alanları boş bırakılamaz.');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isEditing && note) {
        const response = await updateNote({
          note_id: note.note_id,
          title: title.trim(),
          content: content.trim(),
          category_id: note.category_id,
          is_public: isPublic ? 1 : 0,
        });

        if (response.status) {
          navigation.goBack();
          
          Alert.alert('Başarılı', 'Not başarıyla güncellendi.');

          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                { name: 'AllNotes' },
              ],
            })
          );
        }
      } else {
        const response = await addNote({
          title: title.trim(),
          content: content.trim(),
          is_public: isPublic ? 1 : 0,
        });

        if (response.status) {
          Alert.alert('Başarılı', 'Not başarıyla kaydedildi.', [
            { text: 'Tamam', onPress: () => navigation.goBack() }
          ]);
        }
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Notu Düzenle' : 'Yeni Not'}
        </Text>
        <TouchableOpacity 
          style={[styles.saveButton, (!title.trim() || !content.trim()) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading || !title.trim() || !content.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Güncelle' : 'Kaydet'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Not başlığı"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Notunuzu buraya yazın..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.optionsContainer}>
          <View style={styles.optionItem}>
            <Text style={styles.optionText}>Herkese Açık</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#E8E8E8', true: '#4B7BF5' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  saveButton: {
    backgroundColor: '#4B7BF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#B8C2CC',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  optionsContainer: {
    marginTop: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
}); 