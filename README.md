# ChatAadi

![](screenshots/chatAadi.png)

ChatAadi is a full-stack AI chatbot application, for general purpose conversation, inspired by ChatGPT. It features Google-based authentication, persistent chat history, and token tracking – built with modern web technologies.

![](screenshots/chatAadiPage.png)

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [NeonDB](https://neon.tech)
- **ORM**: [Prisma](https://www.prisma.io/)
- **UI**: Tailwind CSS (optional)
- **AI Integration**: Ollama llama3.2 model as default for localhost and mistral-tiny model for production (both are free)

---

## ✨ Features

- 🔐 Google Sign-In via NextAuth
- 💬 Persistent chat history per user
- 🧠 Token usage tracking per message/session
- 🔁 Server-side chat streaming *(optional)*
- ⚡ Fast, modern architecture with Prisma + Neon

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AadityaUoHyd/chat-aadi.git
cd chat-aadi
````

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root:

```env
# PostgreSQL (NeonDB) connection
DATABASE_URL="postgresql://your_user:your_password@your_neon_host/dbname?sslmode=require"

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# CORS
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000,https://chat-aadi.vercel.app

#AI Providers
#OLLAMA (localhost provider as default)
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2
DISABLE_OLLAMA=false  # Set to true to force using Mistral


#Mistral (fallback provider, will be used in live deploy)
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_API_URL=https://api.laplateforme.io/mistral/v1
MISTRAL_MODEL=mistral-tiny
```

> 🔐 You can generate `NEXTAUTH_SECRET` using:
>
> ```bash
> openssl rand -base64 32
> ```

---

## 🧪 Prisma Setup

### Initialize the DB (for fresh project):

```bash
npx prisma migrate dev --name init
```

> Or if you prefer schema push without migrations:
>
> ```bash
> npx prisma db push
> ```

### Generate Prisma Client

```bash
npx prisma generate
```

---

## 🏁 Run the App

```bash
npm run dev
# or
yarn dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```bash
/chat-aadi/src
├── prisma/                 # Prisma schema & migrations
├── public/         
├── package.json            
├── .env                   
├── .tsconfig.json   
├── README.md             
└── src/              
```

---

## 🔐 Authentication: NextAuth + Google

You're using **Google as the OAuth provider**. Once logged in, user data is stored in the database (`User`, `Account`, `Session` models).

Make sure you've:

1. Created a project on [Google Cloud Console](https://console.cloud.google.com/)
2. Enabled OAuth 2.0
3. Added `http://localhost:3000` as an authorized redirect URI

---

## 🧠 Models Overview

### User

* Basic info, profile image, credits
* Relations: accounts, sessions, chats, token usage

### Chat

* Belongs to a user
* Contains many messages
* Token usage tracking

### Message

* Long `content` using `@db.Text`
* Roles: `user`, `assistant`

### TokenUsage

* Tracks token count per chat

---

## 🌐 Deployment

You can deploy this to:

* [Vercel](https://vercel.com/) (recommended for Next.js)

### NeonDB for PostgreSQL

* Free serverless Postgres
* Optimized for edge functions
* Get started: [https://neon.tech](https://neon.tech)

---

## 📅 Roadmap

* [ ] Integrate Mistral API (Mistral 7B free model) & Ollama llama3.2 (for localhost chat completion)
* [ ] Stream responses from the server
* [ ] Token counting (approximate & actual)
* [ ] User settings page
* [ ] Export chat history
* [ ] Mobile-first responsive UI

---

## 🙋 FAQ

**Q: Why use NeonDB?**
A: It’s a modern, serverless Postgres DB perfect for Vercel or other edge-first platforms.

**Q: What about Ollama and Mistral integration?**
A: This template lays the foundation. You’ll soon be able to hook it up with Mistral API (In localhost and default, using ollama llama3.2 model) to generate responses.

**Q: How are messages stored?**
A: Each message is stored in the `Message` model as a `TEXT` field, allowing for large content.

---

## 🧑‍💻 Author

**ChatAadi** by [Aaditya B Chatterjee]
Made with 💙 and inspired by ChatGPT.

---

## 📜 MIT License

This project is licensed under the [MIT License](./LICENSE).

---

### Major Pending Task
- Generating text to image and image to image like Ghibli images (say using stability.ai api)
- Page "Loading..." to logo rotate symbol
- subscription monthly implementation with razorpay and token spent
- forgot/reset password & email verification with otp
- delete account
- edit profile with image,name
- vercel deploy

### Vercel Deployment
- Ensure .env file. It must also have CORS as,
```
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000,https://chat-aadi.vercel.app
```
- During build need 
```
npm i
npx prisma generate (to generate prisma client)
npm run build
npm run start
```
- In case it got deployed, find it live here:
- https://chat-aadi.vercel.app
