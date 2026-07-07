import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  return (
    <AuthLayout title="Создать аккаунт" subtitle="Аккаунт создаётся автоматически при входе через Google">
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-300">
          Войдите через Google на странице входа. Профиль будет создан при первом успешном входе.
        </p>
        <Link to="/login">
          <Button type="button">Перейти ко входу</Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
