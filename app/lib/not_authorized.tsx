export default function NotAuthorized() {
    return <div className="flex-1 p-4 flex items-center justify-center min-h-9/12">
        <h3 className="text-xl font-medium text-red-600 text-center">
            Вы не авторизованы! Для получения доступа обратитесь к администратору.
        </h3>
    </div>
}