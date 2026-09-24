import type { Metadata } from "next";
import { getSessionUser } from "../auth";
import AuthPanel from "../auth-panel";
import ApartmentApp from "../apartment-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "apartmanOS hesabınıza giriş yapın veya yeni hesap oluşturun.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (!user) return <AuthPanel />;
  return <ApartmentApp user={{ displayName: user.displayName, email: user.email }} />;
}
