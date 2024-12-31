import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

const features = [
  'Not alma ve düzenleme',
  'Kategori yönetimi',
  'Yapılacaklar listesi',
  'Bildirim sistemi',
  'Çoklu dil desteği',
  'Tema özelleştirme',
];

const socialLinks = [
  {
    name: 'Website',
    icon: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
    url: 'https://www.noteapp.com',
  },
  {
    name: 'Twitter',
    icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png',
    url: 'https://twitter.com/noteapp',
  },
  {
    name: 'Instagram',
    icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
    url: 'https://instagram.com/noteapp',
  },
];

export const AboutScreen = () => {
  const navigation = useNavigation();

  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('URL açılırken hata:', error);
    }
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
        <Text style={styles.headerTitle}>Hakkında</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1157/1157000.png' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>Notepad</Text>
          <Text style={styles.version}>Versiyon {APP_VERSION} ({BUILD_NUMBER})</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özellikler</Text>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8832/8832119.png' }}
                  style={styles.checkIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bizi Takip Edin</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => handleLinkPress(link.url)}
              >
                <Image source={{ uri: link.icon }} style={styles.socialIcon} />
                <Text style={styles.socialText}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yasal</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => handleLinkPress('https://noteapp.com/privacy')}
            >
              <Text style={styles.legalText}>Gizlilik Politikası</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => handleLinkPress('https://noteapp.com/terms')}
            >
              <Text style={styles.legalText}>Kullanım Koşulları</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2024 Notepad. Tüm hakları saklıdır.</Text>
        </View>
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
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    width: 20,
    height: 20,
    tintColor: '#4B7BF5',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#334155',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  socialButton: {
    alignItems: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#64748B',
  },
  legalLinks: {
    gap: 12,
  },
  legalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  legalText: {
    fontSize: 15,
    color: '#334155',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 13,
    color: '#94A3B8',
  },
}); 