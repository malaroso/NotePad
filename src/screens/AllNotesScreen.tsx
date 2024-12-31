import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllNotes, deleteNote } from '../services/noteService';
import { Note } from '../types/note';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AllNotesScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllNotes();
      if (response.status) {
        setNotes(response.data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getWordStats = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const chars = content.length;
    const readingTime = Math.ceil(words / 200); // Ortalama okuma hızı: 200 kelime/dakika
    
    return {
      words,
      chars,
      readingTime
    };
  };

  const showActionSheet = (note: Note) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Düzenle', 'Paylaş', 'Sil'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              navigation.navigate('AddNote', { note, isEditing: true });
              break;
            case 2:
              // Paylaşım işlevi
              break;
            case 3:
              // Silme onayı
              Alert.alert(
                'Notu Sil',
                'Bu notu silmek istediğinizden emin misiniz?',
                [
                  { text: 'İptal', style: 'cancel' },
                  { 
                    text: 'Sil', 
                    style: 'destructive',
                    onPress: () => handleDelete(note.note_id)
                  }
                ]
              );
              break;
          }
        }
      );
    } else {
      // Android için custom modal yapılabilir
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      const response = await deleteNote(noteId);
      if (response.status) {
        setNotes(notes.filter(note => note.note_id !== noteId));
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Not silinirken bir hata oluştu');
    }
  };

  const renderNote = ({ item }: { item: Note }) => {
    const stats = getWordStats(item.content);

    return (
      <TouchableOpacity 
        style={styles.noteCard}
        onPress={() => navigation.navigate('NoteDetail', { noteId: item.note_id })}
      >
        <View style={styles.categoryIndicator} />
        <View style={styles.noteContent}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.noteMetadata}>
              {item.is_public === 1 && (
                <View style={styles.publicBadge}>
                  <Text style={styles.publicText}>Herkese Açık</Text>
                </View>
              )}
              <Text style={styles.noteDate}>
                {new Date(item.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
            </View>
          </View>
          <Text style={styles.noteText} numberOfLines={3}>
            {item.content}
          </Text>
          <View style={styles.noteFooter}>
            <View style={styles.noteStats}>
              <View style={styles.statItem}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/709/709631.png' }}
                  style={styles.statsIcon}
                />
                <Text style={styles.statsText}>{stats.words} kelime</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png' }}
                  style={styles.statsIcon}
                />
                <Text style={styles.statsText}>{stats.readingTime} dk okuma</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => showActionSheet(item)}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2311/2311524.png' }}
                style={styles.moreIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Tüm Notlarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddNote', { note: undefined, isEditing: false })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.note_id.toString()}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B7BF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIndicator: {
    width: 6,
    backgroundColor: '#4B7BF5',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  noteContent: {
    flex: 1,
    padding: 16,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  noteMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  publicBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  noteDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  noteText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  noteStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  statsIcon: {
    width: 14,
    height: 14,
    tintColor: '#95A5A6',
  },
  statsText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  moreButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  moreIcon: {
    width: 20,
    height: 20,
    tintColor: '#95A5A6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
  },
}); 