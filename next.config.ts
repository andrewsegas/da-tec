import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera `.next/standalone` com só o necessário para rodar em produção —
  // é o que a imagem Docker do deploy (ver `Dockerfile` e `deploy/`) usa.
  output: "standalone",
  // Fixa a raiz do projeto: há um package-lock.json no diretório home do
  // usuário e sem isso o Turbopack tentaria inferir a raiz errada.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
