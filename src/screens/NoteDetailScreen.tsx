import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getNoteDetail, deleteNote } from '../services/noteService';
import { Note } from '../types/note';
import { RootStackParamList } from '../types/navigation';

type NoteDetailRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

export const NoteDetailScreen = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute<NoteDetailRouteProp>();
  const { noteId } = route.params;

  useEffect(() => {
    loadNoteDetail();
  }, [noteId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNoteDetail();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNoteDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getNoteDetail(noteId);
      if (response.status) {
        setNote(response.data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteNote(noteId);
      
      if (response.status) {
        setIsDeleteModalVisible(false);
        navigation.goBack();
        Alert.alert('Başarılı', 'Not başarıyla silindi.');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Not silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B7BF5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.centerContainer}>
        <Text>Not bulunamadı</Text>
      </View>
    );
  }

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
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddNote', { 
              note: note,
              isEditing: true 
            })}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1159/1159633.png' }}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsDeleteModalVisible(true)}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3405/3405244.png' }}
              style={[styles.headerIcon, { tintColor: '#FF3B30' }]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metadata}>
          <Text style={styles.date}>
            {new Date(note.created_at).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          {note.is_public === 1 && (
            <View style={styles.publicBadge}>
              <Text style={styles.publicText}>Herkese Açık</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.noteText}>{note.content}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/709/709631.png' }}
              style={styles.statIcon}
            />
            <Text style={styles.statText}>
              {note.content.split(' ').length} kelime
            </Text>
          </View>
          <View style={styles.statItem}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3114/3114812.png' }}
              style={styles.statIcon}
            />
            <Text style={styles.statText}>
              {note.content.length} karakter
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notu Sil</Text>
            <Text style={styles.modalText}>
              Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#95A5A6',
  },
  publicBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  publicText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495E',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 20,
    height: 20,
    tintColor: '#95A5A6',
  },
  statText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F6FA',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 