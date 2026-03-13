import { prisma } from "../utils/prisma";

async function main() {
  const count = await prisma.member.count();
  if (count > 0) {
    // already seeded
    return;
  }

  await prisma.member.createMany({
    data: [
      {
        name: "John Doe",
        phone: "555-0100",
        email: "john@example.com",
        family: "Doe",
        joinDate: new Date("2023-01-15")
      },
      {
        name: "Jane Smith",
        phone: "555-0101",
        email: "jane@example.com",
        family: "Smith",
        joinDate: new Date("2023-02-10")
      },
      {
        name: "Michael Johnson",
        phone: "555-0102",
        email: "michael@example.com",
        family: "Johnson",
        joinDate: new Date("2023-03-05")
      }
    ]
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

