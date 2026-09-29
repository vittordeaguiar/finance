import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reaproveita páginas dinâmicas por 30s ao trocar de aba; toda escrita chama revalidatePath e limpa.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
