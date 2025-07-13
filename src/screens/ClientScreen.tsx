import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Modal } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

// Iconos del navbar
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const menuIcon = require('../assets/icons/menu.png');

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
  Client: { clientId?: number };
  ClientList: undefined;
};

interface Client {
  id?: number;
  name: string;
  identification: string;
  document_type_id: number;
  email: string;
  phone: string;
  address: string;
  photo_url?: string;
  documents?: string[];
  is_active?: number;
}

interface DocumentType {
  id: number;
  name: string;
  description: string;
  is_active: number;
}

const ClientScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useTheme();
  const clientId = (route.params as any)?.clientId;

  const [client, setClient] = useState<Client>({
    name: '',
    identification: '',
    document_type_id: 1,
    email: '',
    phone: '',
    address: '',
    documents: [],
    is_active: 1
  });
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientPhoto, setClientPhoto] = useState<any>(null);
  const [showDocumentTypeModal, setShowDocumentTypeModal] = useState(false);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/document-types`);
        if (response.ok) {
          const data = await response.json();
          setDocumentTypes(data);
        }
      } catch (error) {
        console.error('Error fetching document types:', error);
      }
    };

    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
          if (data.documents) {
            try {
              const documentsArray = JSON.parse(data.documents);
              setDocuments(documentsArray.map((doc: string, index: number) => ({
                id: index,
                name: doc.split('/').pop() || 'documento',
                uri: doc,
                isExisting: true
              })));
            } catch (parseError) {
              console.error('Error parsing documents:', parseError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handlePickPhoto = async () => {
    try {
      const [file] = await pick({
        type: [types.images],
      });
  
      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: file.name ?? 'foto_cliente',
          },
        ],
        destination: 'documentDirectory',
      });
  
      setClientPhoto({
        id: Date.now(),
        ...localCopy,
        name: file.name ?? 'foto_cliente',
        isExisting: false
      });
    } catch (err) {
      if ((err as any).code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Error al seleccionar foto:', err);
        Alert.alert(t('common.error'), t('clientScreen.photoSelectionError'));
      }
    }
  };

  const handlePickDocument = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf, types.images, types.allFiles],
      });
  
      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: file.name ?? 'documento',
          },
        ],
        destination: 'documentDirectory',
      });
  
      const newDocument = {
        id: Date.now(),
        ...localCopy,
        name: file.name ?? 'documento',
        isExisting: false
      };
  
      setDocuments([...documents, newDocument]);
    } catch (err) {
      if ((err as any).code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Error al seleccionar documento:', err);
        Alert.alert(t('common.error'), t('clientScreen.documentSelectionError'));
      }
    }
  };

  const removeDocument = (documentId: number) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const uploadPhoto = async () => {
    if (!clientPhoto || clientPhoto.isExisting) {
      return client.photo_url;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: clientPhoto.uri,
        name: clientPhoto.name,
        type: 'image/jpeg',
      } as any);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    return null;
  };

  const uploadDocuments = async () => {
    const uploadedUrls = [];
    
    for (const doc of documents) {
      if (!doc.isExisting) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: doc.uri,
            name: doc.name,
            type: 'application/octet-stream',
          } as any);
          
          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.url);
          }
        } catch (error) {
          console.error('Error uploading document:', error);
        }
      } else {
        uploadedUrls.push(doc.uri);
      }
    }
    
    return uploadedUrls;
  };

  const handleSave = async () => {
    if (!client.name || !client.identification || !client.email || !client.phone || !client.address) {
      Alert.alert(t('clientScreen.requiredFields'), t('clientScreen.completeRequiredFields'));
      return;
    }

    setIsLoading(true);

    try {
      // Subir foto si hay una nueva
      const photoUrl = await uploadPhoto();
      
      // Subir documentos si hay nuevos
      const documentUrls = await uploadDocuments();
      
      const clientData = {
        ...client,
        photo_url: photoUrl,
        documents: documentUrls
      };

      const url = clientId 
        ? `${API_BASE_URL}/api/clients/${clientId}`
        : `${API_BASE_URL}/api/clients`;
      
      const method = clientId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          t('clientScreen.clientSaved'), 
          clientId ? t('clientScreen.clientUpdated') : t('clientScreen.clientCreated'),
          [
            { text: t('common.ok'), onPress: () => navigation.navigate('Dashboard') },
          ]
        );
      } else {
        Alert.alert(t('common.error'), data.message || t('clientScreen.saveError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('clientScreen.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header con título y menú hamburguesa */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{t('clientScreen.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ClientList')}>
          <Image source={menuIcon} style={[styles.menuIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {clientId ? t('clientScreen.edit') : t('clientScreen.create')} - {t('clientScreen.clients')}
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={t('clientScreen.fullNamePlaceholder')}
          placeholderTextColor={theme.muted}
          value={client.name}
          onChangeText={(text) => setClient({...client, name: text})}
        />

        <View style={styles.documentTypeContainer}>
          <Text style={[styles.label, { color: theme.text }]}>{t('clientScreen.documentType')}</Text>
          <TouchableOpacity 
            style={[styles.documentTypeButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowDocumentTypeModal(true)}
          >
            <Text style={[styles.documentTypeText, { color: theme.text }]}>
              {documentTypes.find(dt => dt.id === client.document_type_id)?.name || t('clientScreen.cedula')}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={t('clientScreen.documentNumberPlaceholder')}
          placeholderTextColor={theme.muted}
          value={client.identification}
          onChangeText={(text) => setClient({...client, identification: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={t('clientScreen.emailPlaceholder')}
          placeholderTextColor={theme.muted}
          value={client.email}
          onChangeText={(text) => setClient({...client, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={t('clientScreen.phonePlaceholder')}
          placeholderTextColor={theme.muted}
          value={client.phone}
          onChangeText={(text) => setClient({...client, phone: text})}
          keyboardType="phone-pad"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={t('clientScreen.addressPlaceholder')}
          placeholderTextColor={theme.muted}
          value={client.address}
          onChangeText={(text) => setClient({...client, address: text})}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.photoSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('clientScreen.clientPhoto')}</Text>
          
          <TouchableOpacity style={[styles.addPhotoButton, { borderColor: theme.border }]} onPress={handlePickPhoto}>
            {clientPhoto ? (
              <Image source={{ uri: clientPhoto.uri }} style={styles.clientPhoto} />
            ) : (
              <Text style={[styles.addPhotoText, { color: theme.muted }]}>{t('clientScreen.addPhoto')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentsSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('clientScreen.clientDocuments')}</Text>
          
          <TouchableOpacity style={[styles.addDocumentButton, { borderColor: theme.border }]} onPress={handlePickDocument}>
            <Text style={[styles.addDocumentText, { color: theme.muted }]}>{t('clientScreen.addDocument')}</Text>
          </TouchableOpacity>

          {documents.map((doc, _index) => (
            <View key={doc.id} style={[styles.documentItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.documentName, { color: theme.text }]} numberOfLines={1}>
                {doc.name}
              </Text>
              <TouchableOpacity 
                style={[styles.removeDocumentButton, { backgroundColor: theme.primary }]}
                onPress={() => removeDocument(doc.id)}
              >
                <Text style={styles.removeDocumentText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? t('clientScreen.saving') : t('clientScreen.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar tipo de documento */}
      <Modal
        visible={showDocumentTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('clientScreen.selectDocumentType')}</Text>
            
            {documentTypes.map((docType) => (
              <TouchableOpacity 
                key={docType.id}
                style={styles.modalOption}
                onPress={() => {
                  setClient({...client, document_type_id: docType.id});
                  setShowDocumentTypeModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: theme.text }]}>{docType.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalCancelButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowDocumentTypeModal(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  documentsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  addDocumentButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addDocumentText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  removeDocumentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeDocumentText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1CC88A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
  menuIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
    marginLeft: 0,
  },
  documentTypeContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  documentTypeButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  documentTypeText: {
    fontSize: 16,
    color: '#374151',
  },
  photoSection: {
    marginBottom: 24,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  clientPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  addPhotoText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ClientScreen; 