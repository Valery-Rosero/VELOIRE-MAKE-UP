import { LoginForm } from '@/components/auth/LoginForm'

interface PageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirectTo } = await searchParams
  return <LoginForm redirectTo={redirectTo ?? '/'} />
}
