import Form from './create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
 
export default async function Page() { 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Регионы', href: '/erp/regions' },
          {
            label: 'Создать новый',
            href: '/erp/regions/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}