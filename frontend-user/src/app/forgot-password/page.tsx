import { AuthLayout, ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Lupa Password"
      subtitle="Masukkan email Anda untuk menerima link reset password"
      showMobileLogo={false}
      showGuestChat={false}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
