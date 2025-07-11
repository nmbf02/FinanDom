# 📱 FinanDom

**FinanDom** es una app móvil para la gestión de préstamos, diseñada para prestamistas independientes. Permite registrar usuarios, crear préstamos, llevar control de pagos y gestionar moras.

---

## 🛠️ Tecnologías utilizadas

### Frontend (React Native)
- React Native CLI
- TypeScript
- React Navigation
- API REST para login y registro
- Instalación manual por USB o red Wi-Fi

### Backend (Node.js)
- Express.js
- SQLite como base de datos
- bcryptjs para encriptación de contraseñas
- jsonwebtoken (opcional)
- dotenv para manejo de variables de entorno

---

## 🚀 Instalación del proyecto

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/FinanDom.git
cd FinanDom
````

---

## ▶️ Iniciar el Backend

### 1. Ir al directorio del backend

```bash
cd Finan-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el servidor

```bash
node src/index.js
```

> Asegúrate de que el backend esté corriendo en `http://localhost:3000` y conectado a la base de datos SQLite (`finanDom.db`).

---

## 📱 Ejecutar el Frontend (React Native)

### 1. Volver al directorio raíz

```bash
cd ..
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Conectarte por USB o red Wi-Fi

* Conecta tu celular con **modo desarrollador activado** y **depuración USB habilitada**.
* Asegúrate de estar en la **misma red Wi-Fi** que tu PC.

### 4. Editar archivo de conexión al backend

```ts
// src/api/config.ts
export const API_BASE_URL = 'http://TU_IP_LOCAL:3000'; // Ej: 'http://192.168.1.10:3000'
```

### 5. Ejecutar en dispositivo físico

```bash
npx react-native run-android
```

> Si ya tenías el packager corriendo, puedes hacer `npm start --reset-cache` antes de correr de nuevo.

---

## 📂 Estructura del Proyecto

```
FinanDom/
├── Finan-backend/           # API REST con Express y SQLite
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── database/
│       └── index.js
├── src/                     # App React Native
│   ├── screens/
│   ├── api/
│   ├── assets/
│   └── navigation/
└── README.md
```

---

## ✅ Funcionalidades actuales

* Registro de usuarios
* Login
* Navegación protegida
* Conexión con backend local usando IP de red
* Soporte para dispositivos físicos Android

---

## 🧪 Próximas funcionalidades

* Creación y visualización de préstamos
* Registro de pagos
* Cálculo automático de mora
* Notificaciones de cobro
* Dashboard financiero

---

## 📌 Notas importantes

* Si ves un error de conexión `TypeError: Network request failed`, asegúrate de:

  * Usar IP local correcta
  * Backend corriendo en puerto 3000
  * Misma red Wi-Fi entre PC y celular
  * El backend no está protegido por firewall

---

## 💻 Autor

Desarrollado por [Nathaly Michel Berroa Fermín](mailto:nathalyberroaf@gmail.com)
📍 Santiago de los Caballeros, RD
