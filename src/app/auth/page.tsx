import AuthForm from "@/components/auth-form"
import AuthWrapper from "@/components/auth-wrapper"

export default function AuthPage() {
  return (
    <AuthWrapper requireAuth={false}>
      <AuthForm />
    </AuthWrapper>
  )
} 