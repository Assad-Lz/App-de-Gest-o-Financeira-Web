import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { api } from "../../../lib/api";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Envia requisição para registar ou criar usuário no Backend PostgreSQL (via Express Node.js)
        await api.post('/users', { 
          name: user.name, 
          email: user.email, 
          provider: 'google' 
        });
        return true;
      } catch (error: any) {
        if(error.response?.data?.error === 'User already exists.') {
           return true; // Se ja existir ele foi autenticado na conta e passa de boas.
        }
        console.error("Erro ao sincronizar com Node.js na Vercel / Local:", error);
        return true; // allows sign in even if API sync fails for MVP
      }
    },
    async session({ session, token }) {
      if (session.user) {
        // Expor id no session (opcional, mockado aqui)
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // aponta pra home atual contendo o botão do globo
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_fineasy",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
