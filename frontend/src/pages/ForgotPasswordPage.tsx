import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'

export function ForgotPasswordPage() {
  return (
    <AuthLayout title="Восстановление пароля" subtitle="Пароли больше не хранятся в DndCrime">
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-300">
          DndCrime использует вход через Google. Восстановление пароля выполняется в вашем Google-аккаунте.
        </p>
        <Link to="/login">
          <Button type="button">К входу</Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
