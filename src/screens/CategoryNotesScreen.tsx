import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCategoryNotes, deleteCategory } from '../services/categoryService';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

type CategoryNotesScreenRouteProp = RouteProp<RootStackParamList, 'CategoryNotes'>;

export const CategoryNotesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CategoryNotesScreenRouteProp>();
  const { categoryId, categoryName } = route.params;
  
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCategoryNotes();
  }, [categoryId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategoryNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCategoryNotes = async () => {
    try {
      setIsLoading(true);
      const response = await getCategoryNotes(categoryId);
      if (response.status) {
        setNotes(response.data);
      }
    } catch (error: any) {
      console.error('Kategori notları yüklenirken hata:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (notes.length > 0) {
      Alert.alert(
        'Kategori Silinemedi',
        'Bu kategoride notlar bulunuyor. Kategoriyi silmek için önce notları silmeli veya başka bir kategoriye taşımalısınız.',
        [
          {
            text: 'Tamam',
            style: 'cancel'
          },
          {
            text: 'Notları Yönet',
            onPress: () => {
              // İsterseniz burada notları yönetebileceği bir ekrana yönlendirebilirsiniz
              // Örneğin: navigation.navigate('ManageNotes', { categoryId })
            }
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Kategoriyi Sil',
      'Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteCategory(categoryId);
              if (response.status) {
                Alert.alert('Başarılı', 'Kategori başarıyla silindi', [
                  { 
                    text: 'Tamam', 
                    onPress: () => navigation.navigate('Home', { refresh: true }) 
                  }
                ]);
              } else {
                Alert.alert('Hata', response.message || 'Kategori silinirken bir hata oluştu');
              }
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || 
                                 'Kategori silinirken bir hata oluştu';
              Alert.alert('Hata', errorMessage);
            }
          }
        }
      ]
    );
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.noteCount}>{notes.length} not</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteCategory}
        >
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3405/3405244.png' }}
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4B7BF5" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076478.png' }}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Not Bulunamadı</Text>
          <Text style={styles.emptyText}>Bu kategoride henüz not bulunmuyor</Text>
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={() => navigation.navigate('AddNote')}
          >
            <Text style={styles.addNoteButtonText}>Not Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {notes.map((note) => (
            <TouchableOpacity
              key={note.note_id}
              style={styles.noteCard}
              onPress={() => navigation.navigate('NoteDetail', { noteId: note.note_id })}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <View style={styles.noteStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: note.is_public ? '#4B7BF5' : '#48BB78' }
                  ]} />
                  <Text style={styles.statusText}>
                    {note.is_public ? 'Herkese Açık' : 'Özel'}
                  </Text>
                </View>
              </View>
              <Text style={styles.noteContent} numberOfLines={2}>
                {note.content}
              </Text>
              <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>
                  {new Date(note.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#4A5568',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  noteCount: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  noteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4A5568',
  },
  noteContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#718096',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: '#A0AEC0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  addNoteButton: {
    backgroundColor: '#4B7BF5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addNoteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginLeft: 12,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#EF4444',
  },
}); 