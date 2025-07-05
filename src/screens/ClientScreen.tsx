import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Iconos del navbar
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
  Client: { clientId?: number };
};

interface Client {
  id?: number;
  name: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
  documents?: string[];
}

const ClientScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const clientId = (route.params as any)?.clientId;

  const [client, setClient] = useState<Client>({
    name: '',
    identification: '',
    email: '',
    phone: '',
    address: '',
    documents: []
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        Alert.alert('Error', 'No se pudo seleccionar el documento.');
      }
    }
  };

  const removeDocument = (documentId: number) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
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
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);

    try {
      // Subir documentos si hay nuevos
      const documentUrls = await uploadDocuments();
      
      const clientData = {
        ...client,
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
          'Cliente guardado', 
          clientId ? 'El cliente se actualizó correctamente.' : 'El cliente se creó correctamente.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'No se pudo guardar el cliente.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>
          {clientId ? 'Editar' : 'Crear'} - Clientes
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={client.name}
          onChangeText={(text) => setClient({...client, name: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Cédula"
          value={client.identification}
          onChangeText={(text) => setClient({...client, identification: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={client.email}
          onChangeText={(text) => setClient({...client, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={client.phone}
          onChangeText={(text) => setClient({...client, phone: text})}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={client.address}
          onChangeText={(text) => setClient({...client, address: text})}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.documentsSection}>
          <Text style={styles.sectionLabel}>Documentos del cliente</Text>
          
          <TouchableOpacity style={styles.addDocumentButton} onPress={handlePickDocument}>
            <Text style={styles.addDocumentText}>+ Agregar documento</Text>
          </TouchableOpacity>

          {documents.map((doc, _index) => (
            <View key={doc.id} style={styles.documentItem}>
              <Text style={styles.documentName} numberOfLines={1}>
                {doc.name}
              </Text>
              <TouchableOpacity 
                style={styles.removeDocumentButton}
                onPress={() => removeDocument(doc.id)}
              >
                <Text style={styles.removeDocumentText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Guardando...' : 'GUARDAR'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={styles.navIcon} />
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
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
});

export default ClientScreen; 