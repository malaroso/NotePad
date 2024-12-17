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

type MenuItem = {
  id: string;
  icon: string;
  title: string;
  isRed?: boolean;
};

export const HomeScreen = () => {
  const { authState, onLogout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTodos();
  }, []);

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
        <TouchableOpacity onPress={showMenu}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8017/8017760.png' }}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.backButton} onPress={hideMenu}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>Malik Vaudruce</Text>
              <Text style={styles.profileEmail}>malik12v5druce@gmail.com</Text>
            </View>

            {/* Menü Öğeleri */}
            <ScrollView style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.id === 'logout') handleLogout();
                    hideMenu();
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Image source={{ uri: item.icon }} style={styles.menuItemIcon} />
                    <Text style={[
                      styles.menuItemText,
                      item.isRed && styles.menuItemTextRed
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

      {/* Notes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TouchableOpacity>
            <Text style={styles.sectionMore}>...</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.noteCard, styles.addNoteCard]}>
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
            <Text style={styles.addNoteText}>Add new note</Text>
          </TouchableOpacity>

          <View style={[styles.noteCard, styles.darkNoteCard]}>
            <Text style={styles.darkNoteTitle}>Pass for inst</Text>
            <Text style={styles.darkNoteContent}>login: ovan{'\n'}pass: 123212</Text>
          </View>
        </ScrollView>
      </View>

      {/* To-do Lists Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>To-do lists</Text>
          <TouchableOpacity>
            <Text style={styles.sectionMore}>...</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.todoList}>
          {isLoading ? (
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            todos.map(todo => (
              <TouchableOpacity
                key={todo.id}
                style={styles.todoItem}
                onPress={() => toggleTodo(todo.id)}
              >
                <View style={styles.todoLeft}>
                  <View style={[
                    styles.checkbox,
                    todo.status === 'completed' && styles.checkboxChecked
                  ]}>
                    {todo.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.todoText,
                    todo.status === 'completed' && styles.todoTextCompleted
                  ]}>{todo.task}</Text>
                </View>
                <Text style={styles.todoTime}>
                  {new Date(todo.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
  todoList: {
    paddingHorizontal: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todoTime: {
    fontSize: 14,
    color: '#999',
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
});