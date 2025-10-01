import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.todo.count();
  if (count > 0) {
    console.log('Database already seeded');
    return;
  }

  await prisma.todo.createMany({
    data: [
      { title: "Buy milk", status: "PENDING" },
      { title: "Finish layout", description: "Landing hero + form", status: "PENDING" },
      { title: "Call client", status: "DONE" }
    ],
  });
  
  console.log('Database seeded successfully');
}

function runSeed() {
  main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

runSeed();