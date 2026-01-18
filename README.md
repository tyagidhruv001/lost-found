# GLA Lost & Found Portal

A modern, secure lost and found management system for GLA University with glassmorphism UI, Firebase backend, and Cloudinary image storage.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Cloudinary account

### Setup

1. **Clone and Install**
```bash
cd frontend
npm install
```

2. **Configure Environment**
Create `.env` in `/frontend`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📋 Features

### ✅ Implemented
- 🎨 Glassmorphism Landing Page
- 🔐 Advanced Authentication System
  - Multi-step registration (7 steps)
  - Role-based access (Student/Faculty)
  - Document upload with Cloudinary
  - Dual OTP verification (Email + Mobile)
- 🗄️ Firebase Firestore Database
- 🖼️ Image Upload to Cloudinary
- 🎭 Role-based Security Rules

### 🚧 In Progress
- User Profile Management
- Faculty Verification Dashboard
- Lost/Found Item Reporting
- Item Search & Browse

## 🧪 Testing

See [Authentication Testing Guide](./brain/270d8e1b-1938-43a5-a1de-121b8ac33787/auth_testing_guide.md) for detailed testing instructions.

**Quick Test:**
1. Go to `/register`
2. Complete registration (OTPs shown in browser alerts)
3. Login with your credentials

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # OTP Input, Document Upload
│   │   └── common/        # Protected Routes
│   ├── pages/
│   │   ├── auth/          # Login, Register
│   │   ├── Landing.jsx
│   │   ├── student/       # Student Dashboard (TODO)
│   │   └── faculty/       # Faculty Dashboard (TODO)
│   ├── services/
│   │   ├── auth.service.js      # Firebase Auth
│   │   ├── user.service.js      # User Management
│   │   ├── cloudinary.service.js # Image Upload
│   │   ├── otp.service.js       # OTP Sending
│   │   └── firestore.service.js # Database Operations
│   └── config/
│       ├── firebase.js          # Firebase Init
│       └── firebase.config.js   # Firebase Config
├── firestore.rules        # Security Rules
└── .env                   # Environment Variables

backend/ (Cloud Functions - Optional)
└── index.js              # Cloudinary Upload Functions
```

## 🔒 Security Rules

Firestore security rules include:
- Role-based access control
- User can only read/update own data
- Faculty can review verification requests
- OTP sessions are temporary

## 🎨 Design System

- **Colors**: Purple, Cyan, Pink gradients
- **Style**: Glassmorphism with backdrop blur
- **Animations**: Smooth transitions, hover effects
- **Typography**: Modern, clean fonts

## 📦 Tech Stack

### Frontend
- **React** + **Vite**
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Firebase Auth** - Authentication
- **Firestore** - Database
- **Cloudinary** - Image Storage
- **Firebase Functions** - Serverless (Optional)

## 🌐 Deployment

### Frontend (Vercel - Recommended)
```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy
```

### Security Rules
```bash
firebase deploy --only firestore:rules
```

## 🐛 Known Issues

- OTP emails/SMS currently show in console (for testing)
- Document OCR verification not implemented (manual review)
- Faculty verification dashboard pending

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

Built for GLA University Lost & Found Portal

---

**Need Help?** Check the guides in `brain/` folder for detailed documentation.
