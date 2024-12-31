import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTodos, addTodo, updateTodoStatus, deleteTodo } from '../services/todoService';
import { Todo } from '../types/todo';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type GroupedTodos = {
  today: Todo[];
  lastWeek: Todo[];
  lastMonth: Todo[];
  older: Todo[];
};

export const TodoListScreen = () => {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTodoTask, setNewTodoTask] = useState('');
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

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

  const handleAddTodo = async () => {
    if (!newTodoTask.trim()) return;

    try {
      const response = await addTodo({
        task: newTodoTask,
        owner_id: 1,
      });
      
      if (response && response.status) {
        setNewTodoTask('');
        setIsAddModalVisible(false);
        loadTodos();
      }
    } catch (error) {
      console.error('Todo eklenirken hata:', error);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      setUpdatingTodoId(id);
      const todo = todos.find(t => t.id === id);
      const newStatus = todo?.status === 'completed' ? 'not_completed' : 'completed';
      
      const response = await updateTodoStatus(id, newStatus);
      
      if (response.status) {
        setTodos(todos.map(todo => 
          todo.id === id 
            ? { ...todo, status: newStatus } 
            : todo
        ));
      }
    } catch (error) {
      console.error('Todo status güncellenirken hata:', error);
    } finally {
      setUpdatingTodoId(null);
    }
  };

  const groupTodosByDate = (todos: Todo[]): GroupedTodos => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return todos.reduce((groups: GroupedTodos, todo) => {
      const todoDate = new Date(todo.created_at);
      
      if (todoDate >= today) {
        groups.today.push(todo);
      } else if (todoDate >= lastWeek) {
        groups.lastWeek.push(todo);
      } else if (todoDate >= lastMonth) {
        groups.lastMonth.push(todo);
      } else {
        groups.older.push(todo);
      }
      
      return groups;
    }, {
      today: [],
      lastWeek: [],
      lastMonth: [],
      older: []
    });
  };

  const handleDelete = async (eventId: string) => {
    try {
      Alert.alert(
        'Görevi Sil',
        'Bu görevi silmek istediğinizden emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                // Optimistic update
                setTodos(todos.filter(todo => todo.id.toString() !== eventId));
                
                const response = await deleteTodo(eventId);
                
                if (!response.status) {
                  // Eğer silme başarısız olursa, listeyi geri yükle
                  loadTodos();
                  Alert.alert('Hata', 'Görev silinirken bir hata oluştu');
                }
              } catch (error) {
                console.error('Delete error:', error);
                loadTodos();
                Alert.alert('Hata', 'Görev silinirken bir hata oluştu');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Hata', 'Görev silinirken bir hata oluştu');
    }
  };

  const renderTodoSection = (title: string, todos: Todo[]) => {
    if (todos.length === 0) return null;

    const renderRightActions = (todoId: number) => {
      return (
        <View style={styles.deleteActionContainer}>
          <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => handleDelete(todoId.toString())}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3405/3405244.png' }}
              style={styles.deleteActionIcon}
            />
            <Text style={styles.deleteActionText}>Sil</Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {todos.map(todo => (
          <Swipeable
            key={todo.id}
            renderRightActions={() => renderRightActions(todo.id)}
            overshootRight={false}
          >
            <TouchableOpacity
              style={[
                styles.todoItem,
                todo.status === 'completed' && styles.todoItemCompleted
              ]}
              onPress={() => toggleTodo(todo.id)}
              disabled={updatingTodoId === todo.id}
            >
              <View style={styles.todoLeft}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    todo.status === 'completed' && styles.checkboxChecked
                  ]}
                  onPress={() => toggleTodo(todo.id)}
                  disabled={updatingTodoId === todo.id}
                >
                  {updatingTodoId === todo.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    todo.status === 'completed' && <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.todoContent}>
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
              
              <View style={styles.todoStatus}>
                <View style={[
                  styles.statusIndicator,
                  todo.status === 'completed' ? styles.statusCompleted : styles.statusPending
                ]} />
                <Text style={[
                  styles.statusText,
                  todo.status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending
                ]}>
                  {todo.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                </Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Henüz görev eklenmemiş</Text>
      <Text style={styles.emptyStateText}>
        Yeni bir görev eklemek için sağ üst köşedeki + butonuna tıklayın
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Görevlerim</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {isLoading ? (
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : todos.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {Object.entries(groupTodosByDate(todos)).map(([key, groupTodos]) => {
                const titles = {
                  today: "Bugün",
                  lastWeek: "Son 7 Gün",
                  lastMonth: "Son 30 Gün",
                  older: "Daha Eski"
                };
                return (
                  <View key={`section-${key}`}>
                    {renderTodoSection(titles[key as keyof typeof titles], groupTodos)}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <Modal
          visible={isAddModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAddModalVisible(false)}
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
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddTodo}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#2D3748',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3748',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 88,
  },
  todoItemCompleted: {
    backgroundColor: '#F8F9FA',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoContent: {
    flex: 1,
    marginRight: 10,
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
    backgroundColor: '#4B7BF5',
    borderColor: '#4B7BF5',
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
  },
  todoTextCompleted: {
    color: '#A0AEC0',
    textDecorationLine: 'line-through',
  },
  todoDate: {
    fontSize: 12,
    color: '#A0AEC0',
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
  todoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusCompleted: {
    backgroundColor: '#4B7BF5',
  },
  statusPending: {
    backgroundColor: '#FBD38D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextCompleted: {
    color: '#4B7BF5',
  },
  statusTextPending: {
    color: '#ED8936',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#EF4444',
  },
  todoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteActionContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 8,
    marginLeft: 8,
    height: 88,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    flexDirection: 'column',
  },
  deleteActionIcon: {
    width: 24,
    height: 24,
    tintColor: '#EF4444',
    marginBottom: 4,
  },
  deleteActionText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
}); 