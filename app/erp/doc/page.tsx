'use client';

import { useState, useEffect, JSX } from 'react';

type SectionContent = {
  title: string;
  content?: string | JSX.Element;
  subsections?: SectionContent[];
};

const DocumentationPage = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAll = () => {
    setOpenSections({});
  };

  // Пример секций — можно вынести в отдельный JSON или CMS при необходимости
  const sections: SectionContent[] = [
    {
      title: '1. Организация доступа для независимых организаций (Multi-Tenant SaaS)',
      content: (
        <>
          <p>Каждая запись содержит обязательное поле <code>tenant_id</code> типа <code>uuid</code>. Это позволяет:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Изолировать данные разных клиентов (тенантов) на уровне приложения.</li>
            <li>Использовать одну и ту же кодовую базу для множества организаций.</li>
            <li>Обеспечивать безопасность: пользователь никогда не видит данные чужого тенанта, даже при прямом указании <code>id</code>.</li>
          </ul>
          <p className="mt-3">Все запросы к БД фильтруются по <code>tenant_id</code> и <code>section_id</code> — даже если клиентская часть скомпрометирована.</p>
        </>
      ),
    },
    {
      title: '2. Использование разделов (Sections) для разграничения доступа',
      content: (
        <>
          <p>Поле <code>section_id</code> связывает запись с конкретным разделом (например, «Цех №1»). Разделы:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Принадлежат одному <code>tenant_id</code>.</li>
            <li>Назначаются пользователю при регистрации или администратором.</li>
            <li>Определяют, какие данные он может просматривать/редактировать.</li>
          </ul>
          <p className="mt-3">Все SQL-запросы используют конструкцию:</p>
          <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
            <code>{`WITH your_claims AS (
  SELECT * FROM claims WHERE section_id = ANY ($1::uuid[])
)`}</code>
          </pre>
          <p className="mt-2">где <code>$1</code> — массив <code>section_id</code>, доступных текущему пользователю.</p>
        </>
      ),
    },
    {
      title: '3. Ролевая модель: много ролей одному пользователю',
      content: (
        <>
          <p>Пользователь может иметь несколько ролей одновременно. Для каждой сущности определяются:</p>
          <ul className="list-disc pl-5 mt-2">
            <li><code>full_access</code></li>
            <li><code>editor</code></li>
            <li><code>author</code></li>
            <li><code>reader</code></li>
          </ul>
          <p className="mt-3">Роли хранятся в таблице <code>doc_user_permissions</code> и загружаются при входе.</p>
          <p>Права применяются в сочетании с разделами: пользователь может быть редактором в одном разделе и только читателем — в другом.</p>
          <p>Интерфейс автоматически блокирует кнопки «Создать», «Удалить» при отсутствии прав.</p>
        </>
      ),
    },
    {
      title: '4. Многопользовательская работа',
      content: (
        <>
          <p>Для предотвращения конфликтов используется механизм оптимистичной блокировки:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>При открытии документа вызывается <code>tryLockRecord(tableName, id, userId)</code>.</li>
            <li>Если документ уже заблокирован — форма открывается в режиме «только для чтения».</li>
            <li>Блокировка снимается при закрытии формы или по таймауту (30 минут).</li>
          </ul>
          <p className="mt-3">Поля: <code>editing_by_user_id</code>, <code>editing_since</code>.</p>
        </>
      ),
    },
    {
      title: '5. Простота кода и поддерживаемость',
      subsections: [
        {
          title: '5.1 «Простые» объекты без сложных приёмов',
          content: (
            <>
              <p>Каждый прикладной объект:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Не использует метапрограммирование, декораторы, сложные абстракции.</li>
                <li>Следует единообразной структуре: Page → Form → Actions → Table.</li>
                <li>Содержит понятные комментарии на русском языке прямо в интерфейсах (<code>// Название:</code>).</li>
              </ul>
            </>
          ),
        },
        {
          title: '5.2 Сумма мало связанных объектов',
          content: (
            <p>Вся система — это набор автономных папок (например, <code>/claims/</code>, <code>/legal-entities/</code>). Добавление новой сущности = копирование шаблона + замена имён. Маршруты Next.js App Router автоматически соответствуют структуре файлов.</p>
          ),
        },
        {
          title: '5.3 Логичное именование для LLM',
          content: (
            <>
              <p>Имена близки к естественному английскому языку:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Типы: <code>LegalEntity</code>, <code>ClaimForm</code></li>
                <li>Файлы: <code>legal-entities-actions.ts</code>, <code>claim-edit-form.tsx</code></li>
                <li>Поля: <code>fullname</code>, <code>is_customer</code>, <code>section_name</code></li>
              </ul>
              <p className="mt-2">Это позволяет успешно генерировать новые модули с помощью LLM, но технические решения остаются за автором системы.</p>
            </>
          ),
        },
      ],
    },
    {
      title: '6. Оценка архитектуры',
      content: (
        <>
          <p><strong>Преимущества:</strong></p>
          <ul className="list-disc pl-5 mt-2">
            <li>Безопасность «из коробки»: изоляция tenant + section на сервере.</li>
            <li>Готовность к SaaS: multi-tenancy, RBAC(Role-Based Access Control), блокировка документов.</li>
            <li>LLM-friendly: предсказуемая структура, типизация, комментарии.</li>
            <li>Низкий порог входа для junior-разработчиков.</li>
          </ul>
          <p className="mt-3"><strong>Недостатки - обратная сторона преимуществ:</strong></p>
          <ul className="list-disc pl-5 mt-2">
            <li>Дублирование кода между сущностями (нет shared abstraction layer - простота для разработчика и LLM).</li>
            <li>При большом числе сущностей (50 и выше) поддержка усложняется (остается независимость и свобода изменять без согласования разными разработчиками).</li>
            <li>Отсутствие RLS (Row Level Security) в PostgreSQL — всё в приложении (меньше завязки на конкретную СУБД - чистый SQL и независимость от версий СУБД).</li>
          </ul>
        </>
      ),
    },
    // {
    //   title: '7. План развития системы',
    //   content: (
    //     <ol className="list-decimal pl-5 mt-2 space-y-2">
    //       <li><strong>Стандартизация:</strong> выделить ядро (<code>/lib/core</code>), создать CLI-генератор (<code>npx create-entity LegalEntity</code>).</li>
    //       <li><strong>Устранение дублирования:</strong> generic-компоненты, reusable hooks.</li>
    //       <li><strong>Расширение функционала:</strong> аудит изменений, экспорт в PDF/Excel, интеграция с RLS.</li>
    //       <li><strong>Сообщество:</strong> демо-сайт, шаблоны CI/CD, поддержка плагинов.</li>
    //     </ol>
    //   ),
    // },
    {
      title: '7. Почему это привлекательно для использования?',
      content: (
        <>
          <ul className="space-y-1 mt-2">
            <li>✅ Низкий порог входа</li>
            <li>✅ Полная типизация (TypeScript + Zod)</li>
            <li>✅ Готовность к SaaS «из коробки»</li>
            <li>✅ Современный стек: Next.js App Router, Server Actions, RSC, Tailwind, Zustand</li>
            <li>✅ Безопасность по умолчанию</li>
            <li>✅ LLM-friendly архитектура</li>
          </ul>
          <p className="mt-3">Система open-source не требует денег — только практическое применение и обратную связь от сообщества.</p>
          <a href=""></a>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-gray-800">
      <h1
        className="text-3xl font-bold border-b-2 border-blue-500 pb-3 mb-8 cursor-pointer"
        onClick={toggleAll}
      >
        Архитектура open-source системы NOWAY ERP
      </h1>

      {sections.map((section, idx) => (
        <div key={idx} className="mb-6">
          <h2
            className="text-xl font-semibold text-blue-600 cursor-pointer hover:underline"
            onClick={() => toggleSection(`sec-${idx}`)}
          >
            {section.title}
          </h2>

          {openSections[`sec-${idx}`] && (
            <div className="ml-4 border-l-2 border-gray-200 pl-4 mt-2">
              {section.content && <div className="mb-4">{section.content}</div>}
              {section.subsections?.map((sub, subIdx) => (
                <div key={subIdx} className="mb-4">
                  <h3
                    className="text-lg font-medium text-gray-700 cursor-pointer hover:underline"
                    onClick={() => toggleSection(`sec-${idx}-sub-${subIdx}`)}
                  >
                    {sub.title}
                  </h3>
                  {openSections[`sec-${idx}-sub-${subIdx}`] && (
                    <div className="ml-2 mt-2 text-gray-800">{sub.content}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentationPage;