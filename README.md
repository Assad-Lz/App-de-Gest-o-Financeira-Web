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

## 🔥 Funcionalidades Principais

- **📊 Monitor de Mercado Live**: Sincronização automática de preços via Brapi e AwesomeAPI.
- **🤖 Consultoria AI (FinIA)**: Inteligência artificial baseada no Google Gemini para analisar seus investimentos e tirar dúvidas financeiras.
- **📈 Inteligência de Capital**: Módulo ativo de investimentos para alocar em Renda Fixa ou Variável com dedução inteligente de fluxo de caixa.
- **💸 Gestão de Transações**: Controle total de entradas e saídas com categorias, Datepickers retroativos e analytics automáticos.
- **🗂️ Relatórios PDF Premium**: Exportação profissional do seu histórico de transações com logomarca e tabela zebrada.
- **🛡️ Segurança Cibernética (WAF)**: Sistema blindado com Next.js Edge Proxy API (Ocultando o Backend). Bloqueios anti-XSS (Helmet, HPP), e validação de tráfego com `x-api-secret-key` provado por TDD Jest rigoroso.
- **🔐 Login Social**: Integração segura com Google Auth para acesso rápido.
- **💎 Design Premium**: Interface Mobile-First, Dark Mode Glassmorphism com animações físicas Framer Motion.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Framework**: Next.js 14 (App Router & API Edge Proxy Inverso)
- **Estilização**: Tailwind CSS & Lucide React
- **Auth**: NextAuth.js (Google Provider)
- **Segurança**: Content-Security-Policy (CSP) Restrita e HSTS.
- **Charts**: Recharts & jsPDF

### **Backend**
- **Linguagem**: TypeScript / Node.js
- **API**: Express
- **Segurança/WAF**: Helmet, HPP, XSS-Clean, Jest (TDD Anti-Intrusão)
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

