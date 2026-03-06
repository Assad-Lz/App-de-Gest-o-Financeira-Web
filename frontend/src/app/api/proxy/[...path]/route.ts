import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// O Segredo da Nuvem. Ninguém de fora deve saber, só a Vercel e o Render.
const API_SECRET_KEY = process.env.INTERNAL_API_SECRET_KEY || 'default-dev-secret-key';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  // 1. Barreira Tática Edge (NextAuth)
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized Gateway Access" }, { status: 401 });
  }

  // 2. Extrai o path
  const proxyPath = params.path.join("/");
  const backendRequestUrl = `${BACKEND_URL}/${proxyPath}`;

  // 3. Monta Carga Útil e Pass-Through do Método
  const method = req.method;
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // A Mágica: Injeta Chave Confidencial e repassa o cabeçalho impenetrável
  headers.set('x-api-secret-key', API_SECRET_KEY);

  let body: any = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const response = await fetch(backendRequestUrl, {
      method,
      headers,
      body,
      // Passa searchParams silenciosamente
    });

    const responseData = await response.text();
    
    // Tratamento de conversão por se tratar de text ou json
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseData);
    } catch {
      return new NextResponse(responseData, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
    }

    return NextResponse.json(jsonResponse, { status: response.status });
  } catch (error) {
    console.error("Gateway error:", error);
    return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
