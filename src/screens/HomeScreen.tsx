import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Animated,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getAllTodos, addTodo, updateTodoStatus } from '../services/todoService';
import { Todo } from '../types/todo';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Note } from '../types/note';
import { getAllNotes } from '../services/noteService';
import { getUnreadCount } from '../services/notificationService';
import { getCategories, Category, addCategory } from '../services/categoryService';
import { getUserDetail } from '../services/userService';

type MenuItem = {
  id: string;
  icon: string;
  title: string;
  isRed?: boolean;
  badge?: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { onLogout } = useAuth();
  const [username, setUsername] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
  const [newTodoTask, setNewTodoTask] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string>('');
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const route = useRoute();

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadUnreadCount();

    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadCount();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategories();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        refreshAll();
        navigation.setParams({ refresh: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.refresh]);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const response = await getUserDetail();
      if (response.status) {
        setUsername(response.data.username);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
    }
  };

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTodos();
      if (response.status) {
        setTodos(response.data);
      }
    } catch (error: any) {
      console.log('Todo fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      setIsNotesLoading(true);
      const response = await getAllNotes();
      if (response.status) {
        setNotes(response.data);
      }
    } catch (error: any) {
      console.log('Notes fetch error:', error);
      setNotesError(error.message);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.status) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Bildirim sayısı alınırken hata:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await getCategories();
      if (response.status) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.log('Categories fetch error:', error);
      setCategoriesError(error.message);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Uygulamadan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          onPress: () => onLogout?.(),
          style: 'destructive'
        }
      ]
    );
  };

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const newStatus = todo.status === 'completed' ? 'not_completed' : 'completed';
      
      // Optimistic update (UI'ı hemen güncelle)
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, status: newStatus } 
          : todo
      ));

      // API'ye istek gönder
      const response = await updateTodoStatus(id, newStatus);
      
      if (!response.status) {
        // Eğer API isteği başarısız olursa, değişiklikleri geri al
        setTodos(todos.map(todo => 
          todo.id === id 
            ? { ...todo, status: todo.status } 
            : todo
        ));
        Alert.alert('Hata', 'Görev durumu güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Todo status update error:', error);
      // Hata durumunda değişiklikleri geri al
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, status: todo.status } 
          : todo
      ));
      Alert.alert('Hata', 'Görev durumu güncellenirken bir hata oluştu');
    }
  };



  const openAddTodoModal = () => {
    setIsAddTodoModalVisible(true);
  };

  const closeAddTodoModal = () => {
    setIsAddTodoModalVisible(false);
  };

  const addNewTodo = async () => {
    if (!newTodoTask.trim()) return;

    try {
      const response = await addTodo({
        task: newTodoTask,
        owner_id: 1,
      });
      
      if (response && response.status) {
        setNewTodoTask('');
        setIsAddTodoModalVisible(false);
        loadTodos(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Todo eklenirken hata:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Uyarı', 'Kategori adı boş olamaz');
      return;
    }

    try {
      const response = await addCategory(newCategoryName.trim());

      if (response.status) {
        setNewCategoryName('');
        setIsAddCategoryModalVisible(false);
        loadCategories(); // Kategorileri yeniden yükle
        Alert.alert('Başarılı', 'Kategori başarıyla eklendi');
      } else {
        Alert.alert('Hata', 'Kategori eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      Alert.alert('Hata', 'Kategori eklenirken bir hata oluştu');
    }
  };

  const renderTodos = () => {
    const completedTodos = todos
      .filter(todo => todo.status === 'completed')
      .slice(0, 5);
    
    const pendingTodos = todos
      .filter(todo => todo.status === 'not_completed')
      .slice(0, 5);

    return (
      <View style={styles.section}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.todoScrollView}
        >
          {/* Yeni Görev Ekle Kartı */}
          <TouchableOpacity
            style={[styles.todoCard, styles.addTodoCard]}
            onPress={() => setIsAddTodoModalVisible(true)}
          >
            <View style={styles.addTodoIcon}>
              <Text style={styles.addTodoIconText}>+</Text>
            </View>
            <Text style={styles.addTodoText}>Yeni Görev Ekle</Text>
          </TouchableOpacity>

          {/* Tüm Görevlerim Kartı */}
          <TouchableOpacity
            style={[styles.todoCard, styles.allTodosCard]}
            onPress={() => navigation.navigate('TodoList')}
          >
            <View style={styles.allTodosIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png' }}
                style={styles.allTodosIconImage}
              />
            </View>
            <Text style={styles.allTodosText}>Tüm Görevlerim</Text>
            <Text style={styles.todoCount}>{todos.length} görev</Text>
          </TouchableOpacity>

          {/* Bekleyen Görevler */}
          {pendingTodos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={[styles.todoCard, styles.pendingTodoCard]}
              onPress={() => toggleTodo(todo.id)}
            >
              <Text style={styles.todoTitle}>{todo.task}</Text>
              <Text style={styles.todoDate}>
                {new Date(todo.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
              <View style={styles.todoStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Bekliyor</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Tamamlanan Görevler */}
          {completedTodos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={[styles.todoCard, styles.completedTodoCard]}
              onPress={() => toggleTodo(todo.id)}
            >
              <Text style={[styles.todoTitle, styles.completedTodoTitle]}>{todo.task}</Text>
              <Text style={styles.todoDate}>
                {new Date(todo.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
              <View style={styles.todoStatus}>
                <View style={[styles.statusDot, styles.completedStatusDot]} />
                <Text style={[styles.statusText, styles.completedStatusText]}>Tamamlandı</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.sectionMore}>...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
      >
        {/* Yeni Kategori Ekle Kartı */}
        <TouchableOpacity 
          style={[styles.categoryCard, styles.addCategoryCard]}
          onPress={() => setIsAddCategoryModalVisible(true)}
        >
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <Text style={styles.addCategoryText}>Yeni Kategori</Text>
        </TouchableOpacity>

        {/* Kategori Kartları */}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.category_id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('CategoryNotes', {
              categoryId: category.category_id,
              categoryName: category.name
            })}
          >
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDate}>
              {new Date(category.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long'
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadTodos(),
        loadNotes(),
        loadCategories(),
        loadUnreadCount()
      ]);
    } catch (error) {
      console.error('Veriler yenilenirken hata:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hi,</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png' }}
              style={styles.headerIcon}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' }}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828490.png' }}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - ScrollView ile sarmalayalım */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAll}
            colors={['#4B7BF5']}
            tintColor="#4B7BF5"
          />
        }
      >
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity onPress={openAddTodoModal}>
              <Text style={styles.sectionMore}>...</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.noteCard, styles.addNoteCard]}
              onPress={() => navigation.navigate('AddNote', { note: undefined, isEditing: false })}
            >
              <View style={styles.addIcon}>
                <Text style={styles.addIconText}>+</Text>
              </View>
              <Text style={styles.addNoteText}>Add new note</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.noteCard, styles.allNotesCard]}
              onPress={() => navigation.navigate('AllNotes')}
            >
              <View style={styles.allNotesIcon}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png' }}
                  style={styles.allNotesIconImage}
                />
              </View>
              <Text style={styles.allNotesText}>Tüm Notlarım</Text>
              <Text style={styles.noteCount}>{notes.length} not</Text>
            </TouchableOpacity>

            {isNotesLoading ? (
              <View style={[styles.noteCard, styles.loadingCard]}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            ) : notesError ? (
              <View style={[styles.noteCard, styles.errorCard]}>
                <Text style={styles.errorText}>{notesError}</Text>
              </View>
            ) : (
              notes.map((note) => (
                <TouchableOpacity
                  key={note.note_id}
                  style={[styles.noteCard, styles.darkNoteCard]}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.note_id })}
                >
                  <Text style={styles.darkNoteTitle}>{note.title}</Text>
                  <Text style={styles.darkNoteContent}>
                    {note.content.length > 50 
                      ? note.content.substring(0, 50) + '...' 
                      : note.content}
                  </Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Categories Section */}
        {isCategoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4B7BF5" />
          </View>
        ) : categoriesError ? (
          <Text style={styles.errorText}>{categoriesError}</Text>
        ) : (
          renderCategories()
        )}

        {/* To-do Lists Section */}
        <View style={[styles.section, styles.todoSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>To-do lists</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Son 5 görev listelenmektedir.</Text>

          <ScrollView 
            style={styles.todoList}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              renderTodos()
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add Todo Modal */}
      <Modal
        visible={isAddTodoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAddTodoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Görev Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Görev adı"
              value={newTodoTask}
              onChangeText={setNewTodoTask}
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewTodoTask('');
                  closeAddTodoModal();
                }}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={addNewTodo}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Kategori adı"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewCategoryName('');
                  setIsAddCategoryModalVisible(false);
                }}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddCategory}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Ekle</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#64748B',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EDF2F7',
  },
  submitButton: {
    backgroundColor: '#4B7BF5',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#2D3748',
  },
  submitButtonText: {
    color: '#fff',
  },
  drawerMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  drawerHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  drawerUsername: {
    fontSize: 18,
    fontWeight: '600',
  },
  drawerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutText: {
    color: '#FF3B30',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionMore: {
    fontSize: 24,
    color: '#666',
  },
  noteCard: {
    width: 150,
    height: 180,
    borderRadius: 15,
    marginLeft: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  darkNoteCard: {
    backgroundColor: '#2C3E50',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIconText: {
    fontSize: 24,
    color: '#4B7BF5',
  },
  addNoteText: {
    color: '#666',
    marginTop: 8,
  },
  darkNoteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  darkNoteContent: {
    color: '#B8C2CC',
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  todoSection: {
    marginBottom: 20,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todoHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  todoCount: {
    fontSize: 14,
    color: '#718096',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todoItemCompleted: {
    backgroundColor: '#F8F9FA',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4B7BF5',
    borderColor: '#4B7BF5',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoText: {
    fontSize: 15,
    color: '#2D3748',
    marginBottom: 4,
  },
  todoTextCompleted: {
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
  },
  todoDate: {
    fontSize: 12,
    color: '#718096',
  },
  todoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  addTodoButton: {
    backgroundColor: '#4B7BF5',
  },
  addTodoButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginVertical: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemTextRed: {
    color: '#FF3B30',
  },
  chevronIcon: {
    width: 16,
    height: 16,
    opacity: 0.3,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    color: '#FF3B30',
  },
  profileSectionContent: {
    alignItems: 'center',
    width: '100%',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  mainContent: {
    flex: 1,
  },
  loadingCard: {
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#B8C2CC',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  allNotesCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allNotesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  allNotesIconImage: {
    width: 24,
    height: 24,
  },
  allNotesText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  noteCount: {
    color: '#7F8C8D',
    fontSize: 12,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  menuContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  menuBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  todoContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  todoScrollView: {
    flexGrow: 0,
  },
  todoCard: {
    width: 150,
    height: 180,
    borderRadius: 15,
    padding: 16,
    marginLeft: 16,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'space-between',
  },
  addTodoCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allTodosCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingTodoCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  completedTodoCard: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  allTodosIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  allTodosIconImage: {
    width: 24,
    height: 24,
  },
  allTodosText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  completedTodoTitle: {
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
  },
  todoDate: {
    fontSize: 12,
    color: '#718096',
  },
  todoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBD38D',
    marginRight: 6,
  },
  completedStatusDot: {
    backgroundColor: '#4B7BF5',
  },
  statusText: {
    fontSize: 12,
    color: '#ED8936',
  },
  completedStatusText: {
    color: '#4B7BF5',
  },
  addTodoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTodoIconText: {
    fontSize: 24,
    color: '#4B7BF5',
  },
  addTodoText: {
    color: '#666',
    marginTop: 8,
  },
  addTodoSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 16,
    marginTop: -8,
    marginBottom: 12,
  },
  categoryCard: {
    width: 150,
    height: 180,
    borderRadius: 15,
    padding: 16,
    marginLeft: 16,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'space-between',
  },
  addCategoryCard: {
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  categoryDate: {
    fontSize: 12,
    color: '#718096',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIconText: {
    fontSize: 24,
    color: '#4B7BF5',
  },
  addCategoryText: {
    color: '#666',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});