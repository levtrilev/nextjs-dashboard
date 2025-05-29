// Role EditForm

'use client';
import { useState } from "react";
import { RoleForm, Section, SectionForm, Tenant } from "@/app/lib/definitions";
import { updateRole } from "../../lib/roles-actions";
import Link from "next/link";
import BtnTenantsRef from "@/app/admin/tenants/lib/btnTenantsRef";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import { TrashIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";

interface IRoleEditFormProps {
  role: RoleForm,
  role_sections: SectionForm[],

  tenants: Tenant[],
  sections: SectionForm[],
}

export default function RoleEditForm(props: IRoleEditFormProps) {
  const [role, setRole] = useState(props.role);
  const [newSection, setNewSection] = useState<Section>({ id: "", name: "", tenant_id: "" });
  const [role_sections, setRoleSections] = useState<SectionForm[]>(props.role_sections);
  // const sections = props.role.section_ids;
  // console.log("sections: " + sections);

  const handleSelectSection = (
    new_section_id: string,
    new_section_name: string,
    new_section_tenant_id: string,
    new_section_tenant_name: string
  ) => {
    setRoleSections(role_sections.concat({
      id: new_section_id,
      name: new_section_name,
      tenant_id: new_section_tenant_id,
      tenant_name: new_section_tenant_name
    }));
    prepareRoleSectionIds(role_sections.concat({
      id: new_section_id,
      name: new_section_name,
      tenant_id: new_section_tenant_id,
      tenant_name: new_section_tenant_name
    }));
  };

  const handleRedirectBack = () => {
    window.history.back(); // Возвращает пользователя на предыдущую страницу
  };

  const handleChangeName = (event: any) => {
    setRole((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };
  const handleChangeDescription = (event: any) => {
    setRole((prev) => ({
      ...prev,
      description: event.target.value,
    }));
  };
  const handleSelectTenant = (tenant_id: string, tenant_name: string) => {
    setRole((prev) => ({
      ...prev,
      tenant_id: tenant_id,
      tenant_name: tenant_name,
    }));
  }
  const prepareRoleSectionIds = (role_sections: SectionForm[]) => {
    setRole((prev) => ({
      ...prev,
      section_ids: "{" + role_sections.map((section) => section.id).join(",") + "}",
      section_names: "{" + role_sections.map((section) => section.name).join(",") + "}",
    }));
    // console.log("role_sections_ids: " + "{" + role_sections.map((section) => section.id).join(",") + "}");
    // console.log("role.section_ids: " + role.section_ids);
  };
  const handleDeleteRoleSection = (section_id: string) => {
    setRoleSections(role_sections.filter((section) => section.id !== section_id));
    prepareRoleSectionIds(role_sections.filter((section) => section.id !== section_id));
  }
  return (

    <div >
      <div id="header" className="flex flex-col md:flex-row gap-4 w-full">
        {/* first column */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          {/* name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}
            >
              Название:
            </label>
            <input
              id="name"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={role.name}
              onChange={(e) => handleChangeName(e)}
            />
          </div>

          {/* tenant_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="tenant_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}>
              Организация:
            </label>
            <input
              id="tenant_name"
              type="text"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={role.tenant_name}
              readOnly
              onChange={(e) => setRole((prev) => ({ ...prev, tenant_name: e.target.value, }))}
            />
            <BtnTenantsRef tenants={props.tenants} handleSelectTenant={handleSelectTenant} />
          </div>

        </div>
        {/* second column */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          {/* description */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="description"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}>
              Описание:
            </label>
            <input
              id="description"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={role.description}
              onChange={(e) => handleChangeDescription(e)}
            />
          </div>
          {/* add section */}
          <div className="flex justify-between mt-1">
            <div className={`${lusitana.className} p-2 text-gray-400`}>Добавить раздел (выберите):</div>
            <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />
          </div>
        </div>
      </div>

      {/* table part */}
      <div id="table_part" className="mt-2">
        <div className="flex flex-row gap-4 w-full md:w-1/2">
          <h2 className="px-2 pt-1 font-medium">Разделы:</h2>
        </div>
        {/* заголовки таблицы не прокручиваются */}
        <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
          <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
            <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6 text-gray-400">
                  Название
                </th>
                <th scope="col" className="w-3/8 px-3 py-5 font-medium text-gray-400">
                  Организация
                </th>
                <th scope="col" className="w-3/16 px-3 py-5 font-medium">
                </th>
              </tr>
            </thead>
          </table>
        </div>
        {/* таблица прокручивается */}
        <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
          <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
            <tbody className="divide-y divide-gray-200 text-gray-900">
              {role_sections.map((section) => (
                <tr key={section.id} className="group">
                  <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                    <div className="flex items-left gap-3">
                      <a
                        href={"/admin/sections/" + section.id + "/edit"}
                        className="text-blue-800 underline"
                      >{section.name.substring(0, 36)}</a>
                    </div>
                  </td>
                  <td className="w-3/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                    {section.tenant_name}
                  </td>
                  <td className="w-3/16 whitespace-nowrap pl-4 py-1 pr-3">
                    <div className="flex justify-end gap-3">
                      <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => handleDeleteRoleSection(section.id)}>
                        <span className="sr-only">Delete</span>
                        <TrashIcon className="w-5 h-5 text-gray-800" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              onClick={() => {
                updateRole({ ...role, section_ids: role.section_ids ? role.section_ids : "{}", section_names: role.section_names ? role.section_names : "{}" });
                // handleRedirectBack();
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Link href={"#"} >
              <button
                onClick={() => handleRedirectBack()}
                className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              >
                Отмена
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div >

  );
}
