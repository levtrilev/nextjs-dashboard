import PremiseEditForm from "../[id]/edit/editForm";
import { PremiseForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/actions";
import { fetchRegionsForm } from "@/app/erp/regions/lib/actions";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { DateTime } from "next-auth/providers/kakao";
import { formatDateForInput } from "@/app/lib/utils";

export default async function Page() {
  const session = await auth();
  const email = session ? (session.user ? session.user.email : "") : "";
  const current_sections = await getCurrentSections(email as string);
  // const formatDateForInput = (date: Date | string): string => {
  //   if (!date) return ''; // Если дата пустая, возвращаем пустую строку
  //   const d = new Date(date);
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  //   const day = String(d.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };
  const premise: PremiseForm = {
    id: "",
    name: "",
    description: "",
    cadastral_number: "",
    square: 0,
    address: "",
    address_alt: "",
    type: "",
    status: "",
    status_until: new Date(), //formatDateForInput(new Date()),
    region_id: "",
    owner_id: "",
    operator_id: "",
    section_id: "",
    username: "",
    // timestamptz: new Date().toISOString(),
    date_created: new Date(), //formatDateForInput(new Date()),
    section_name: "",
    region_name: "",
    owner_name: "",
    operator_name: "",

  } as PremiseForm;



  const sections = await fetchSectionsForm();
  const regions = await fetchRegionsForm();
  const legalEntities = await fetchLegalEntities(current_sections);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Помещения', href: '/erp/premises' },
          {
            label: 'Создать новое',
            href: '/erp/premises/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full items-center justify-between">
        {/* <h1 className={`${lusitana.className} text-2xl`}>Новое помещение</h1> */}
      </div>
      <PremiseEditForm
        premise={premise}
        sections={sections}
        regions={regions}
        legalEntities={legalEntities}
      />
    </main>
  );
}