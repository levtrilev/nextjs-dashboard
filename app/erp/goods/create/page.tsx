import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { checkReadonly } from "@/app/lib/common-utils";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { GoodForm } from "@/app/lib/definitions";
import GoodEditForm from "../[id]/edit/good-edit-form";
import { fetchLegalEntitiesForm } from "../../legal-entities/lib/legal-entities-actions";

export default async function Page() {
  //#region unified hooks and variables
  const session = await auth();
  const session_user = session ? session.user : null;
  if (!session_user || !session_user.email) {
    return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
  }
  const email = session_user.email;
  const user = await getUser(email as string);
  if (!user) {
    return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
  }
  const pageUser = user;
  const current_sections = await getCurrentSections(email as string);
  const sections = await fetchSectionsForm(current_sections);
  const tenant_id = pageUser.tenant_id;
  const userPermissions = await fetchDocUserPermissions(user.id as string, 'goods');
  const readonly_locked = false;
  //#endregion

  const good: GoodForm = {
    id: "",
    name: "",
    brand: "",
    product_code: "",
    supplier_id: "",
    supplier_name: "",
    dimensions_height: 0,
    dimensions_width: 0,
    dimensions_length: 0,
    weight: 0,
    price_retail: 0,
    price_wholesale: 0,
    price_cost: 0,
    section_id: "",
    section_name: "",
    tenant_id: "",
    username: "",
    timestamptz: "",
    editing_by_user_id: null,
    editing_since: null,
  };
  type GoodFormWithAuthor = GoodForm & { author_id: string };
  const good_with_author_id = { ...good, author_id: '' } as GoodFormWithAuthor;
  const readonly_permission = checkReadonly(userPermissions, good_with_author_id, pageUser.id);
  const readonly = readonly_locked || readonly_permission;

  const suppliers = readonly ? [] : await fetchLegalEntitiesForm(current_sections);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Товары', href: '/goods' },
          {
            label: 'Создать новый',
            href: '/goods/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full items-center justify-between">
        {readonly && (
          <span className="text-xs font-medium text-gray-400">
            только чтение для пользователя: {user?.email}
          </span>
        )}
        {!readonly && (
          <span className="text-xs font-medium text-gray-400">
            права на изменение для пользователя: {user?.email}
          </span>
        )}
      </div>
      <DocWrapper
        pageUser={pageUser}
        userSections={sections}
        userPermissions={userPermissions}
        docTenantId={tenant_id}
      >
        <GoodEditForm
          good={good}
          suppliers={suppliers}
          lockedByUserId={null}
          unlockAction={null}
          readonly={readonly}
        />
      </DocWrapper>
    </main>
  );
}