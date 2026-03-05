# 🚀 FinEasy — Gestão Financeira Inteligente & Mercado em Tempo Real

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Prisma-ORM-blue?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-IA-8E44AD?style=for-the-badge&logo=google-gemini" alt="Gemini AI" />
</p>

O **FinEasy** é uma plataforma premium de gestão financeira pessoal que une o poder da **Inteligência Artificial** com dados do **Mercado Financeiro em tempo real**. Projetada para oferecer uma experiência de usuário fluida e dashboards informativos, a aplicação ajuda você a tomar melhores decisões com seu dinheiro.

---

## 📸 Demonstração

### ✨ Landing Page Moderna
A primeira impressão que encanta, com animações suaves e design focado em conversão.
![Landing Page](/home/zacky/.gemini/antigravity/brain/bed18fba-1091-4161-baf9-26f0ee80b92d/landing_page_screenshot_actual_1772753883717.png)

### 📊 Dashboard de Mercado
Acompanhe Ibovespa, Dólar e mais de 50 ativos da B3 atualizados automaticamente.
![Dashboard Mercado](/home/zacky/.gemini/antigravity/brain/bed18fba-1091-4161-baf9-26f0ee80b92d/frontend_market_populated_1772749996779.png)

---

## 🔥 Funcionalidades Principais

- **📊 Monitor de Mercado Live**: Sincronização automática de preços via Brapi e AwesomeAPI.
- **🤖 Consultoria AI (FinIA)**: Inteligência artificial baseada no Google Gemini para analisar seus investimentos e tirar dúvidas financeiras.
- **💸 Gestão de Transações**: Controle total de entradas e saídas com categorias e analytics.
- **📉 Simulador de Investimentos**: Projete seus ganhos futuros com base em ativos reais.
- **🔐 Login Social**: Integração segura com Google Auth para acesso rápido.
- **💎 Design Premium**: Interface em Dark Mode com Glassmorphism e micro-animações.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Estilização**: Tailwind CSS & Lucide React
- **Auth**: NextAuth.js (Google Provider)
- **Charts**: Recharts

### **Backend**
- **Linguagem**: TypeScript / Node.js
- **API**: Express
- **ORM**: Prisma
- **Agendamento**: Node-cron (ETL Nativo)

### **Infraestrutura**
- **Banco de Dados**: PostgreSQL (Supabase)
- **Hospedagem Frontend**: Vercel
- **Hospedagem Backend**: Render (Dockerizada)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js v20+
- Conta no Supabase (PostgreSQL)
- Chave de API do Google Gemini
- Token da Brapi API

### 1. Clone o repositório
```bash
git clone https://github.com/Assad-Lz/App-de-Gest-o-Financeira-Web.git
cd App-de-Gest-o-Financeira-Web
```

### 2. Configuração do Backend
```bash
cd backend
npm install
# Configure o seu .env com DATABASE_URL, GEMINI_API_KEY, BRAPI_TOKEN
npx prisma db push
npm run dev
```

### 3. Configuração do Frontend
```bash
cd ../frontend
npm install
# Configure o seu .env.local com NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID
npm run dev
```

---

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
**Desenvolvido com ❤️ por Yssaky & Antigravity AI** 🚀
