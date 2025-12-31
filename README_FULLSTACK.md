
# Panduan Implementasi Full-Stack (Next.js + Prisma)

Karena ini adalah aplikasi React SPA untuk demonstrasi, berikut adalah langkah-langkah untuk mengubahnya menjadi aplikasi produksi lengkap sesuai spesifikasi user:

## 1. Skema Database (Prisma)
Gunakan file `schema.prisma` ini untuk Supabase/Neon:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  VENDOR
}

model User {
  id            String      @id @default(cuid())
  name          String?
  email         String      @unique
  image         String?
  role          Role        @default(VENDOR)
  jobs          VendorJob[]
  createdAt     DateTime    @default(now())
}

model VendorJob {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  vendorName    String
  companyName   String
  picName       String
  picPhone      String
  jobType       String
  building      String
  floor         String
  room          String
  description   String      @db.Text
  startTime     DateTime
  endTime       DateTime
  photos        JobPhoto[]
  createdAt     DateTime    @default(now())
}

model JobPhoto {
  id            String      @id @default(cuid())
  jobId         String
  job           VendorJob   @relation(fields: [jobId], references: [id])
  imageUrl      String
  createdAt     DateTime    @default(now())
}
```

## 2. Setup Layanan Gratis (Free Tier)
1. **Database**: Gunakan [Supabase](https://supabase.com) (Free 500MB).
2. **Hosting**: Gunakan [Vercel](https://vercel.com).
3. **Storage**: Gunakan [Cloudinary](https://cloudinary.com) untuk simpan foto.
4. **Auth**: [NextAuth.js](https://next-auth.js.org) dengan Google Provider.

## 3. Konfigurasi Environment (.env)
```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Google)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# AI Assistant
API_KEY="Gemini_API_Key_Anda"
```

## 4. Struktur Folder Next.js
- `app/api/auth/[...nextauth]/route.ts`: Handler login.
- `app/api/jobs/route.ts`: GET list & POST job baru.
- `app/vendor/page.tsx`: Halaman form.
- `app/admin/page.tsx`: Halaman dashboard.
- `lib/prisma.ts`: Singleton prisma client.
- `lib/cloudinary.ts`: Utils upload ke Cloudinary.

## 5. Cara Menentukan Admin Pertama
Update database manual atau melalui seed script:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'email_anda@gmail.com';
```
Atau tambahkan logika di `callbacks` NextAuth untuk mengecek `whitelist`.
