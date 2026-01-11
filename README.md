# 📱 FinanDom

**FinanDom** es una app móvil para la gestión de préstamos, diseñada para prestamistas independientes. Permite registrar usuarios, crear préstamos, llevar control de pagos y gestionar moras.

---

## 🛠️ Tecnologías utilizadas

### Frontend (React Native)

* React Native CLI
* TypeScript
* React Navigation
* API REST para login y registro
* Instalación manual por USB o red Wi-Fi

### Backend (Node.js)

* Express.js
* SQLite como base de datos
* bcryptjs para encriptación de contraseñas
* jsonwebtoken (opcional)
* dotenv para manejo de variables de entorno

---

## 🚀 Instalación del proyecto

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/FinanDom.git
cd FinanDom
```

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

### 3. Instalar bcryptjs (si aún no está)

```bash
npm install bcryptjs
```

### 4. Ejecutar el servidor

```bash
node src/index.js
```

> Asegúrate de que el backend esté corriendo en
> `http://localhost:3000`
> y conectado a la base de datos SQLite (`finanDom.db`).

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

### 3. Iniciar Metro Bundler

```bash
npx react-native start
```

### 4. Conectarte por USB o red Wi-Fi

* Conecta tu celular con **modo desarrollador activado**
* Habilita **depuración USB**
* Asegúrate de estar en la **misma red Wi-Fi** que tu PC

### 5. Editar archivo de conexión al backend

```ts
// src/api/config.ts
export const API_BASE_URL = 'http://TU_IP_LOCAL:3000'; 
// Ejemplo: 'http://192.168.1.10:3000'
```

### 6. Ejecutar en dispositivo Android

En **otra terminal**:

```bash
npx react-native run-android
```

> Si el packager ya estaba corriendo y tienes errores:

```bash
npm start --reset-cache
```

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

## 🧩 Pendientes / TODO

* [ ] Hacer componente de navbar
* [ ] Hacer componente del título
* [ ] Agregar rol en register
* [ ] En Configuraciones: guardar la firma del prestatario
* [ ] Registrar pago (no configurado en el último paso de préstamos)
* [ ] Verificar campo de firma
* [ ] Verificar contrato de préstamo
* [ ] Ver calendario de pagos (no está configurado en el último paso de préstamos)
* [ ] Login con terceros (Google, Facebook, GitHub)
* [ ] Login con biometría

---

## 📌 Notas importantes

Si ves el error:

```
TypeError: Network request failed
```

Verifica:

* IP local correcta en `config.ts`
* Backend corriendo en puerto 3000
* Mismo Wi-Fi entre PC y celular
* Firewall no bloqueando el puerto

---

## 💻 Autor

Desarrollado por
**Nathaly Michel Berroa Fermín**
📧 [nathalyberroaf@gmail.com](mailto:nathalyberroaf@gmail.com)
📍 Santiago de los Caballeros, RD
