# 🌍 Sistema de Internacionalización (i18n)

Este directorio contiene la configuración y archivos de traducción para el sistema de internacionalización de FinanDom.

## 📁 Estructura

```
src/i18n/
├── index.ts              # Configuración principal de i18n
├── types.ts              # Tipos TypeScript para las traducciones
├── locales/
│   ├── es.json          # Traducciones en español
│   └── en.json          # Traducciones en inglés
└── README.md            # Este archivo
```

## 🚀 Uso

### 1. Importar en componentes

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.loading')}</Text>
  );
};
```

### 2. Cambiar idioma

```typescript
import { useLanguage } from '../hooks/useLanguage';

const SettingsScreen = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const handleLanguageChange = async (language: string) => {
    await changeLanguage(language);
  };
  
  return (
    <TouchableOpacity onPress={() => handleLanguageChange('en')}>
      <Text>English</Text>
    </TouchableOpacity>
  );
};
```

### 3. Usar con interpolación

```typescript
// En el archivo de traducción
{
  "welcome": "Hola {{name}}, bienvenido a {{app}}"
}

// En el componente
const { t } = useTranslation();
<Text>{t('welcome', { name: 'Juan', app: 'FinanDom' })}</Text>
```

## 📝 Agregar nuevas traducciones

### 1. Agregar claves en los archivos de traducción

**es.json:**
```json
{
  "newSection": {
    "title": "Nuevo Título",
    "description": "Nueva descripción"
  }
}
```

**en.json:**
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New description"
  }
}
```

### 2. Actualizar tipos TypeScript

En `types.ts`:
```typescript
export interface TranslationKeys {
  // ... existing keys
  newSection: {
    title: string;
    description: string;
  };
}
```

### 3. Usar en componentes

```typescript
const { t } = useTranslation();
<Text>{t('newSection.title')}</Text>
```

## 🔧 Configuración

### Idiomas soportados
- **es**: Español (idioma por defecto)
- **en**: Inglés

### Detección automática
El sistema detecta automáticamente el idioma guardado en AsyncStorage. Si no hay idioma guardado, usa español por defecto.

### Persistencia
El idioma seleccionado se guarda automáticamente en AsyncStorage y se restaura al abrir la app.

## 📱 Pantallas con traducciones

Las siguientes pantallas ya tienen soporte completo de traducciones:

- ✅ SplashScreen
- ✅ LoginScreen
- ✅ RegisterScreen
- ✅ DashboardScreen
- ✅ ProfileScreen
- ✅ EditProfileScreen ✅
- ✅ CurrencyScreen ✅
- ✅ CreateLoanScreen ✅
- ✅ ContractPreviewScreen ✅
- ✅ CommunicationHistoryScreen ✅
- ✅ ClientScreen ✅
- ✅ ClientListScreen ✅
- ✅ AssistantScreen ✅
- ✅ SettingsScreen
- ✅ SignContractScreen
- ✅ RecordPaymentScreen
- ✅ PaymentSuccessScreen
- ✅ OverduePaymentsScreen
- ✅ LoanListScreen
- ✅ InstallmentListScreen
- ✅ LoanDetailsScreen
- ✅ HelpCenterScreen
- ✅ ForgotPasswordScreen
- 🔄 Otras pantallas (en progreso)

## 🎯 Mejores prácticas

1. **Usar claves descriptivas**: `t('auth.login')` en lugar de `t('login')`
2. **Agrupar por sección**: Usar estructura jerárquica como `auth.login`, `auth.register`
3. **Mantener consistencia**: Usar las mismas claves en todos los idiomas
4. **Actualizar tipos**: Siempre actualizar `types.ts` cuando agregues nuevas traducciones
5. **Probar ambos idiomas**: Verificar que las traducciones funcionen en español e inglés

## 🐛 Solución de problemas

### Error: "Translation key not found"
- Verificar que la clave existe en ambos archivos de traducción
- Asegurar que la clave esté escrita correctamente
- Revisar que el archivo de traducción se haya importado correctamente

### El idioma no cambia
- Verificar que `changeLanguage` se esté llamando correctamente
- Revisar que AsyncStorage esté funcionando
- Comprobar que el componente se esté re-renderizando

### Traducciones no se cargan
- Verificar que `./src/i18n` esté importado en `App.tsx`
- Revisar que los archivos JSON sean válidos
- Comprobar que las rutas de importación sean correctas 