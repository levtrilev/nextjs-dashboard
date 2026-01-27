import { User } from "./definitions";

export default function NotAuthorized() {
    return <div className="flex-1 p-4 flex items-center justify-center min-h-9/12">
        <h3 className="text-xl font-medium text-red-600 text-center">
            Вы не авторизованы! Для получения доступа обратитесь к администратору.
        </h3>
    </div>
}

type PermissionsType = {
    full_access: boolean;
    editor: boolean;
    author: boolean;
    reader: boolean;
    can_delete: boolean;
    access_by_tags: boolean;
};

export function isUserAuthorized(userPermissions: PermissionsType, pageUser: User) {
    if (!pageUser.is_superadmin && (!(userPermissions.full_access
        || userPermissions.editor
        || userPermissions.author
        || userPermissions.reader))) {
        return false;
    }
    return true;
}