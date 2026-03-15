# 🌐 Quick Translate

Quick Translate is a modern, full-stack language translation application built with the MERN stack. It features a stunning interactive UI, searchable language selectors, and a temporary translation history system.

![Quick Translate Screenshot](https://github.com/himanshushekharon/Quick-Translate/raw/main/screenshot.png) *(Placeholder: Add your actual screenshot here!)*

## ✨ Features

- **Real-time Translation**: Integrated with the LibreTranslate API for accurate and fast translations.
- **Searchable Languages**: Custom-built premium dropdowns that allow you to search through dozens of supported languages instantly.
- **Interactive Background**: Beautifully animated "Squares" background that responds to your mouse movement in both light and dark modes.
- **Temporary History**: A smart history system that saves your recent translations but automatically deletes them from MongoDB and the UI after **5 minutes** (TTL indexed).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Dark/Light Mode**: Smooth transitions between themes with custom color palettes for each.

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Three.js (for background shaders), Lucide-React (icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (with TTL indexes for auto-deletion).
- **API**: LibreTranslate API.

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/himanshushekharon/Quick-Translate.git
cd Quick-Translate
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder and add your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Himanshu Shekhar](https://github.com/himanshushekharon)
