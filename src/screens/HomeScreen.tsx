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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getAllTodos } from '../services/todoService';
import { Todo } from '../types/todo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Note } from '../types/note';
import { getAllNotes } from '../services/noteService';
import { getUnreadCount } from '../services/notificationService';

type MenuItem = {
  id: string;
  icon: string;
  title: string;
  isRed?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { authState, onLogout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<NavigationProp>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

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

  const handleLogout = async () => {
    try {
      await onLogout?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTodo = async (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, status: todo.status === 'completed' ? 'not_completed' : 'completed' } 
        : todo
    ));
  };

  const showMenu = () => {
    setIsMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsMenuVisible(false));
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
      title: 'Profil'
    },
    {
      id: 'notifications',
      icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png',
      title: 'Notifications'
    },
    {
      id: 'email',
      icon: 'https://cdn-icons-png.flaticon.com/512/2099/2099199.png',
      title: 'Email Notifications'
    },
    {
      id: 'language',
      icon: 'https://cdn-icons-png.flaticon.com/512/484/484582.png',
      title: 'Language'
    },
    {
      id: 'theme',
      icon: 'https://cdn-icons-png.flaticon.com/512/5262/5262027.png',
      title: 'Theme: Light Mode'
    },
    {
      id: 'share',
      icon: 'https://cdn-icons-png.flaticon.com/512/2099/2099085.png',
      title: 'Share with someone'
    },
    {
      id: 'help',
      icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828940.png',
      title: 'Help Center'
    },
    {
      id: 'logout',
      icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828479.png',
      title: 'Logout'
    },
  ];

  const handleMenuItemPress = (id: string) => {
    switch (id) {
      case 'profile':
        navigation.navigate('Profile');
        hideMenu();
        break;
      case 'logout':
        handleLogout();
        hideMenu();
        break;
      default:
        hideMenu();
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Hi, {authState?.username || 'User'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              navigation.navigate('Notifications');
              setUnreadCount(0);
            }}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png' }}
              style={styles.notificationIcon}
            />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={showMenu}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8017/8017760.png' }}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Menu */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              styles.drawerMenu,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Profil Bölümü */}
            <View style={styles.profileSection}>
              <TouchableOpacity 
                style={styles.profileSectionContent}
                onPress={() => {
                  hideMenu();
                  navigation.navigate('Profile');
                }}
              >
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                  style={styles.profileAvatar}
                />
                <Text style={styles.profileName}>Malik Vaudruce</Text>
                <Text style={styles.profileEmail}>malik12v5druce@gmail.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={hideMenu}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Menü Öğeleri */}
            <ScrollView style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.id)}
                >
                  <View style={styles.menuItemLeft}>
                    <Image source={{ uri: item.icon }} style={styles.menuItemIcon} />
                    <Text style={[
                      styles.menuItemText,
                      item.id === 'logout' && styles.menuItemTextRed
                    ]}>{item.title}</Text>
                  </View>
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271228.png' }}
                    style={styles.chevronIcon}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>...</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.noteCard, styles.addNoteCard]}
              onPress={() => navigation.navigate('AddNote')}
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

        {/* To-do Lists Section */}
        <View style={[styles.section, styles.todoSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>To-do lists</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>...</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.todoList}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                <View style={styles.todoHeader}>
                  <Text style={styles.todoHeaderTitle}>Bugünün Görevleri</Text>
                  <Text style={styles.todoCount}>{todos.length} görev</Text>
                </View>
                {todos.map(todo => (
                  <TouchableOpacity
                    key={todo.id}
                    style={styles.todoItem}
                    onPress={() => toggleTodo(todo.id)}
                  >
                    <View style={styles.todoLeft}>
                      <TouchableOpacity 
                        style={[
                          styles.checkbox,
                          todo.status === 'completed' && styles.checkboxChecked
                        ]}
                        onPress={() => toggleTodo(todo.id)}
                      >
                        {todo.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View>
                        <Text style={[
                          styles.todoText,
                          todo.status === 'completed' && styles.todoTextCompleted
                        ]}>{todo.task}</Text>
                        <Text style={styles.todoDate}>
                          {new Date(todo.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
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
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 16,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawerMenu: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
    flex: 1,
    marginBottom: 0,
  },
  todoContainer: {
    flex: 1,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  todoHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  todoCount: {
    fontSize: 14,
    color: '#7F8C8D',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 4,
    fontWeight: '500',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#95A5A6',
  },
  todoDate: {
    fontSize: 12,
    color: '#95A5A6',
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
});