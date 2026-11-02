import { AuthLayout, RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Daftar Akun"
      subtitle="Buat akun baru Anda untuk melanjutkan"
      showMobileLogo={false}
      showGuestChat={false}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
