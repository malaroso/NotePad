import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getNotifications, markNotificationAsRead, deleteNotification, getFilteredNotifications } from '../services/notificationService';
import { Notification } from '../types/notification';

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation();
  const [swipedNotificationId, setSwipedNotificationId] = useState<number | null>(null);
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    loadNotifications(activeFilter);
  }, [activeFilter]);

  const loadNotifications = async (filter: typeof activeFilter = 'all') => {
    try {
      setIsLoading(true);
      let response;
      
      switch (filter) {
        case 'unread':
          response = await getFilteredNotifications({ is_read: 0 });
          break;
        case 'low':
          response = await getFilteredNotifications({ priority: 'low' });
          break;
        case 'medium':
          response = await getFilteredNotifications({ priority: 'medium' });
          break;
        case 'high':
          response = await getFilteredNotifications({ priority: 'high' });
          break;
        default:
          response = await getNotifications();
      }

      if (response.status) {
        setNotifications(response.data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'note':
        return 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png';
      default:
        return 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (notification.is_read === 0) {
        await markNotificationAsRead(notification.notification_id);
        setNotifications(notifications.map(n => 
          n.notification_id === notification.notification_id 
            ? { ...n, is_read: 1 }
            : n
        ));
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.status) {
        setNotifications(notifications.filter(n => n.notification_id !== notificationId));
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bildirim silinirken bir hata oluştu');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationContainer}>
      <TouchableOpacity 
        style={[
          styles.notificationCard,
          item.is_read === 0 && styles.unreadCard
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Image 
            source={{ uri: getNotificationIcon(item.type) }}
            style={styles.icon}
          />
          <View 
            style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor(item.priority) }
            ]} 
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWrapper}>
              <Text style={[
                styles.title,
                item.is_read === 0 && styles.unreadTitle
              ]} numberOfLines={1}>
                {item.title}
              </Text>
              {item.is_read === 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>Okunmadı</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleDateString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'long'
              })}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Bildirimi Sil',
                  'Bu bildirimi silmek istediğinizden emin misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    { 
                      text: 'Sil', 
                      style: 'destructive',
                      onPress: () => handleDelete(item.notification_id)
                    }
                  ]
                );
              }}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3405/3405244.png' }}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
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
          <Text style={styles.headerTitle}>Bildirimler</Text>
        </View>
        {notifications.some(n => n.is_read === 0) && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={async () => {
              try {
                await Promise.all(
                  notifications
                    .filter(n => n.is_read === 0)
                    .map(n => markNotificationAsRead(n.notification_id))
                );
                setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
              } catch (error) {
                console.error('Bildirimler okundu işaretlenirken hata:', error);
              }
            }}
          >
            <Text style={styles.markAllReadText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              Tümü
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'unread' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>
              Okunmamış
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'high' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('high')}
          >
            <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.filterText, activeFilter === 'high' && styles.activeFilterText]}>
              Yüksek Öncelik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'medium' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('medium')}
          >
            <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.filterText, activeFilter === 'medium' && styles.activeFilterText]}>
              Orta Öncelik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'low' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('low')}
          >
            <View style={[styles.priorityDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.filterText, activeFilter === 'low' && styles.activeFilterText]}>
              Düşük Öncelik
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4B7BF5" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2476/2476197.png' }}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Bildiriminiz bulunmuyor</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.notification_id.toString()}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
  filterSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
  },
  activeFilterText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  list: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#4B7BF5',
  },
  notificationIcon: {
    position: 'relative',
    marginRight: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    padding: 8,
  },
  priorityIndicator: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
    minHeight: 100,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: '#94A3B8',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  unreadTitle: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  unreadBadgeText: {
    color: '#4B7BF5',
    fontSize: 12,
    fontWeight: '500',
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF5FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B7BF5',
  },
  markAllReadText: {
    fontSize: 12,
    color: '#4B7BF5',
    fontWeight: '600',
  },
  notificationContainer: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
  },
  deleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#EF4444',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
}); 