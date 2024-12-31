import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Android için layout animation'ı etkinleştir
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// SSS verileri
const faqs = [
  {
    question: 'Not uygulamasını nasıl kullanabilirim?',
    answer: 'Ana sayfada "Not Ekle" butonuna tıklayarak yeni bir not oluşturabilirsiniz. Notlarınızı kategorilere ayırabilir, düzenleyebilir ve silebilirsiniz.'
  },
  {
    question: 'Notlarımı kategorilere nasıl ayırabilirim?',
    answer: 'Not oluştururken veya düzenlerken kategori seçebilirsiniz. Ana sayfada "Kategori Ekle" butonu ile yeni kategoriler oluşturabilirsiniz.'
  },
  {
    question: 'Şifremi nasıl değiştirebilirim?',
    answer: 'Profil sayfasında "Güvenlik" seçeneğine tıklayarak şifre değiştirme ekranına ulaşabilirsiniz.'
  },
  {
    question: 'Bildirim ayarlarını nasıl yapabilirim?',
    answer: 'Profil sayfasında "Bildirimler" seçeneğinden bildirim tercihlerinizi yönetebilirsiniz.'
  },
  {
    question: 'Notlarımı nasıl yedekleyebilirim?',
    answer: 'Şu anda notların yedeklenmesi otomatik olarak yapılmaktadır. İleri sürümlerde manuel yedekleme özelliği eklenecektir.'
  },
  {
    question: 'Uygulama ile ilgili sorun yaşıyorum, nasıl iletişime geçebilirim?',
    answer: 'Destek için support@noteapp.com adresine e-posta gönderebilir veya uygulama içi geri bildirim formunu kullanabilirsiniz.'
  }
];

type FAQItemProps = {
  question: string;
  answer: string;
};

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity 
      style={styles.faqItem} 
      onPress={toggleExpand}
      activeOpacity={0.7}
    >
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question}</Text>
        <Animated.Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2985/2985150.png' }}
          style={[styles.arrow, { transform: [{ rotate }] }]}
        />
      </View>
      {isExpanded && (
        <Text style={styles.answer}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

export const FAQScreen = () => {
  const navigation = useNavigation();

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
        <Text style={styles.headerTitle}>Sıkça Sorulan Sorular</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3031/3031293.png' }}
            style={styles.searchIcon}
          />
          <Text style={styles.searchText}>Size nasıl yardımcı olabiliriz?</Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Hala sorunuz mu var?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Bizimle İletişime Geçin</Text>
          </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
    marginRight: 12,
  },
  searchText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  faqList: {
    paddingHorizontal: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    lineHeight: 20,
  },
  arrow: {
    width: 20,
    height: 20,
    tintColor: '#64748B',
  },
  contactSection: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#4B7BF5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 