import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { changePassword } from '../services/userService';

const securityTips = [
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/6195/6195699.png',
    title: 'Güçlü Şifre Oluşturun',
    description: 'En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.'
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/7518/7518748.png',
    title: 'Benzersiz Şifre Kullanın',
    description: 'Her hesap için farklı şifreler kullanmaya özen gösterin.'
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2889/2889676.png',
    title: 'Düzenli Değiştirin',
    description: 'Güvenliğiniz için şifrenizi belirli aralıklarla güncelleyin.'
  }
];

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Uyarı', 'Yeni şifre ve şifre tekrarı eşleşmiyor');
      return;
    }

    try {
      setIsLoading(true);
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (response.status) {
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Şifre değiştirilemedi');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Şifre değiştirme işlemi başarısız oldu';
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsLoading(false);
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
        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#4B7BF5" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mevcut Şifre</Text>
            <View style={styles.inputContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png' }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Mevcut şifrenizi girin"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Image
                  source={{ 
                    uri: showCurrentPassword 
                      ? 'https://cdn-icons-png.flaticon.com/512/2355/2355322.png'
                      : 'https://cdn-icons-png.flaticon.com/512/2355/2355321.png'
                  }}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png' }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Yeni şifrenizi girin"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Image
                  source={{ 
                    uri: showNewPassword 
                      ? 'https://cdn-icons-png.flaticon.com/512/2355/2355322.png'
                      : 'https://cdn-icons-png.flaticon.com/512/2355/2355321.png'
                  }}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre Tekrar</Text>
            <View style={styles.inputContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png' }}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Yeni şifrenizi tekrar girin"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Image
                  source={{ 
                    uri: showConfirmPassword 
                      ? 'https://cdn-icons-png.flaticon.com/512/2355/2355322.png'
                      : 'https://cdn-icons-png.flaticon.com/512/2355/2355321.png'
                  }}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Güvenlik İpuçları</Text>
          {securityTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Image source={{ uri: tip.icon }} style={styles.tipIcon} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/471/471664.png' }}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Son şifre değişikliği: 3 ay önce
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2196/2196775.png' }}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              İki faktörlü doğrulama yakında!
            </Text>
          </View>
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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#4B7BF5',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  illustration: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  illustrationImage: {
    width: 120,
    height: 120,
    tintColor: '#4B7BF5',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: '#94A3B8',
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#94A3B8',
  },
  illustrationText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginTop: 16,
  },
  tipsSection: {
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tipIcon: {
    width: 32,
    height: 32,
    tintColor: '#4B7BF5',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  infoSection: {
    padding: 16,
    paddingTop: 0,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoIcon: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
  },
}); 