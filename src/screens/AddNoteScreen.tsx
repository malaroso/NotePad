import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addNote, updateNote } from '../services/noteService';
import { getCategories, Category } from '../services/categoryService';

export const AddNoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNote'>>();
  const { note, isEditing } = route.params || {};

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPublic, setIsPublic] = useState(note?.is_public === 1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(note?.category_id || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.status) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Uyarı', 'Başlık ve içerik alanları boş bırakılamaz');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçiniz');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category_id: selectedCategory,
      is_public: isPublic ? 1 : 0
    };

    try {
      setIsLoading(true);
      let response;

      if (isEditing && note) {
        response = await updateNote({
          note_id: note.note_id,
          ...noteData
        });
      } else {
        response = await addNote(noteData);
      }

      if (response.status) {
        Alert.alert(
          'Başarılı', 
          isEditing ? 'Not başarıyla güncellendi' : 'Not başarıyla kaydedildi',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? 'Notu Düzenle' : 'Yeni Not'
    });
  }, [isEditing]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Başlık"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#A0AEC0"
        />

        <TextInput
          style={styles.contentInput}
          placeholder="İçerik"
          value={content}
          onChangeText={setContent}
          multiline
          placeholderTextColor="#A0AEC0"
        />

        {/* Kategori Seçimi */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          {isCategoriesLoading ? (
            <ActivityIndicator size="small" color="#4B7BF5" />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.category_id && styles.categoryButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.category_id);
                    console.log('Seçilen kategori ID:', category.category_id);
                  }}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.category_id && styles.categoryButtonTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Gizlilik Ayarı */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>Gizlilik</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Herkese Açık</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#E2E8F0', true: '#4B7BF5' }}
              thumbColor={isPublic ? '#fff' : '#fff'}
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
    borderBottomColor: '#E2E8F0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#4B7BF5',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4B7BF5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2D3748',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
    color: '#2D3748',
  },
  categoriesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonSelected: {
    backgroundColor: '#4B7BF5',
    borderColor: '#4B7BF5',
  },
  categoryButtonText: {
    color: '#4A5568',
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  privacySection: {
    marginTop: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#4A5568',
  },
}); 