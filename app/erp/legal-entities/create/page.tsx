import Form from '@/app/ui/legal-entities/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
 
export default async function Page() { 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Юридические лица', href: '/erp/legal-entities' },
          {
            label: 'Создать новое',
            href: '/erp/entities/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}