import { PrismaClient, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 67th GA
  const ga67 = await prisma.event.upsert({
    where: { slug: "pabsec-67th-general-assembly" },
    update: {
      startDate: new Date("2026-06-30T09:00:00Z"),
      heroTextColor: "dark",
    },
    create: {
      slug: "pabsec-67th-general-assembly",
      status: EventStatus.PUBLISHED,
      startDate: new Date("2026-06-30T09:00:00Z"),
      endDate: new Date("2026-07-01T18:00:00Z"),
      location: "Tbilisi, Georgia",
      heroTextColor: "dark",
      translations: {
        create: [
          {
            locale: "en",
            title: "67th PABSEC General Assembly",
            location: "Tbilisi, Georgia",
            description:
              "The 67th Ordinary Session of the General Assembly of the Parliamentary Assembly of the Black Sea Economic Cooperation.",
          },
          {
            locale: "ru",
            title: "67-я сессия Генеральной Ассамблеи ПАЧЭС",
            location: "Тбилиси, Грузия",
            description:
              "67-я Обычная сессия Генеральной Ассамблеи Парламентской Ассамблеи Черноморского Экономического Сотрудничества.",
          },
          {
            locale: "tr",
            title: "KEİPA Genel Kurulunun 67. Olağan Oturumu",
            location: "Tiflis, Gürcistan",
            description:
              "Karadeniz Ekonomik İşbirliği Parlamenter Asamblesi Genel Kurulunun 67. Olağan Oturumu.",
          },
        ],
      },
    },
  });

  // 68th GA
  const ga68 = await prisma.event.upsert({
    where: { slug: "pabsec-68th-general-assembly" },
    update: {},
    create: {
      slug: "pabsec-68th-general-assembly",
      status: EventStatus.DRAFT,
      startDate: new Date("2026-11-01T09:00:00Z"),
      endDate: new Date("2026-11-03T18:00:00Z"),
      location: "Athens, Hellenic Republic",
      heroTextColor: "auto",
      translations: {
        create: [
          {
            locale: "en",
            title: "68th General Assembly",
            location: "Athens, Hellenic Republic",
            description:
              "The 68th Ordinary Session of the General Assembly of the Parliamentary Assembly of the Black Sea Economic Cooperation.",
          },
          {
            locale: "ru",
            title: "68-я Генеральная Ассамблея",
            location: "Афины, Греческая Республика",
            description:
              "68-я Обычная сессия Генеральной Ассамблеи Парламентской Ассамблеи Черноморского Экономического Сотрудничества.",
          },
          {
            locale: "tr",
            title: "68. Genel Kurul",
            location: "Atina, Yunanistan",
            description:
              "Karadeniz Ekonomik İşbirliği Parlamenter Asamblesi Genel Kurulunun 68. Olağan Oturumu.",
          },
        ],
      },
    },
  });

  // ── Committee meetings (upsert by slug) ───────────────────────────────────

  const meetingEcon = await prisma.upcomingEvent.upsert({
    where: { slug: "committee-economic-67" },
    update: {},
    create: {
      slug: "committee-economic-67",
      category: "committee_economic",
      session: "67",
      status: "SAVE_THE_DATE",
      dateFlexible: true,
      dateFlexibleText: "September / October 2026",
      location: "Sofia, Bulgaria",
      sortOrder: 1,
      translations: {
        create: [
          { locale: "en", title: "Committee on Economic and Development Policy" },
          { locale: "ru", title: "Комитет по экономической политике и развитию" },
          { locale: "tr", title: "Ekonomik ve Kalkınma Politikası Komitesi" },
        ],
      },
    },
  });

  const meetingLegal = await prisma.upcomingEvent.upsert({
    where: { slug: "committee-legal-68" },
    update: {},
    create: {
      slug: "committee-legal-68",
      category: "committee_legal",
      session: "68",
      status: "SAVE_THE_DATE",
      dateFlexible: true,
      dateFlexibleText: "September / October 2026",
      location: "TBA",
      sortOrder: 2,
      translations: {
        create: [
          { locale: "en", title: "Committee on Legal Affairs and International Cooperation" },
          { locale: "ru", title: "Комитет по правовым вопросам и международному сотрудничеству" },
          { locale: "tr", title: "Hukuki İşler ve Uluslararası İşbirliği Komitesi" },
        ],
      },
    },
  });

  const meetingSocial = await prisma.upcomingEvent.upsert({
    where: { slug: "committee-social-67" },
    update: {},
    create: {
      slug: "committee-social-67",
      category: "committee_social",
      session: "67",
      status: "SAVE_THE_DATE",
      dateFlexible: true,
      dateFlexibleText: "September / October 2026",
      location: "Yerevan, Armenia",
      sortOrder: 3,
      translations: {
        create: [
          { locale: "en", title: "Committee on Social and Humanitarian Policy" },
          { locale: "ru", title: "Комитет по социальной и гуманитарной политике" },
          { locale: "tr", title: "Sosyal ve İnsancıl Politika Komitesi" },
        ],
      },
    },
  });

  console.log(
    "Seeded:",
    ga67.slug,
    ga68.slug,
    meetingEcon.slug,
    meetingLegal.slug,
    meetingSocial.slug
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
