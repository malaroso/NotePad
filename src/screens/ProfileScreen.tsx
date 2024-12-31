import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { getUserDetail, UserDetail } from '../services/userService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { authState } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetail | null>(null);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const response = await getUserDetail();
      if (response.status && response.data) {
        const userData = {
          ...response.data,
          permissions: Array.isArray(response.data.permissions) 
            ? response.data.permissions 
            : response.data.permissions.split(',')
        };
        setUserDetails(userData);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
    }
  };

  const profileSections = [
    {
      title: 'Hesap',
      items: [
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png',
          title: 'Güvenlik',
          subtitle: 'Şifre, giriş bilgileri',
          onPress: () => navigation.navigate('ChangePassword')
        },
      ],
    },
    {
      title: 'Tercihler',
      items: [
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/3876/3876142.png',
          title: 'Tema (Yakında)',
          subtitle: 'Koyu mod, yazı boyutu',
        },
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png',
          title: 'Bildirimler',
          subtitle: 'Bildirim tercihleri',
        },
      ],
    },
    {
      title: 'Diğer',
      items: [
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/2099/2099085.png',
          title: 'Uygulamayı Paylaş',
          subtitle: 'Arkadaşlarınla paylaş',
        },
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828940.png',
          title: 'Yardım',
          subtitle: 'SSS, iletişim',
          onPress: () => navigation.navigate('FAQ')
        },
        {
          icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png',
          title: 'Hakkında',
          subtitle: 'Versiyon 1.0.0',
          onPress: () => navigation.navigate('About')
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.editButton}>

        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userDetails?.username || 'Kullanıcı'}</Text>
            <Text style={styles.email}>{userDetails?.email || 'kullanici@email.com'}</Text>
            <Text style={styles.phone}>{userDetails?.phone_number || 'Telefon numarası yok'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userDetails?.role_description || 'Kullanıcı'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              if (userDetails) {
                navigation.navigate('EditProfile', { currentUser: userDetails });
              }
            }}
          >
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Yetkiler bölümü */}
        {userDetails?.permissions && userDetails.permissions.length > 0 && (
          <View style={styles.permissionsContainer}>
            <Text style={styles.sectionTitle}>Yetkiler</Text>
            <View style={styles.permissionsList}>
              {userDetails.permissions.map((permission) => (
                <View key={permission} style={styles.permissionChip}>
                  <Text style={styles.permissionText}>
                    {permission}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ayarlar Bölümleri */}
        {profileSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[
                    styles.sectionItem,
                    itemIndex === section.items.length - 1 && styles.lastItem
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.iconContainer}>
                      <Image source={{ uri: item.icon }} style={styles.itemIcon} />
                    </View>
                    <View style={styles.itemTexts}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271228.png' }}
                    style={styles.chevronIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  backButton: {
    padding: 8,
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
  editButton: {
    padding: 8,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  editProfileText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    width: 20,
    height: 20,
    tintColor: '#3B82F6',
  },
  itemTexts: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  chevronIcon: {
    width: 16,
    height: 16,
    tintColor: '#CBD5E1',
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  roleText: {
    color: '#4B7BF5',
    fontSize: 12,
    fontWeight: '600',
  },
  permissionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  permissionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  permissionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
}); 