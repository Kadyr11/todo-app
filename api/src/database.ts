import { PrismaClient } from '@prisma/client';

declare global {
  // Предотвращение множественных клиентов при hot-reload в dev режиме
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Простая и надежная инициализация Prisma клиента
let prisma: PrismaClient;

if (!globalThis.__prisma) {
  globalThis.__prisma = new PrismaClient({
    log: ['warn', 'error'], // Минимальное логирование для стабильности
  });
}

prisma = globalThis.__prisma;

// Экспорт клиента (совместимость с разными стилями импорта)
export default prisma;
export { prisma };