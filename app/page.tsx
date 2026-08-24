import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Selamat Datang di Salon Khayla</h1>
      <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded">
        Login
      </Link>
    </main>
  );
}