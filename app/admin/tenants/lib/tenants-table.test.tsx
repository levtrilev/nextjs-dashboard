// ./tenants-table.test.tsx

// Мокаем серверные модули ДО импортов
jest.mock('@/app/admin/tenants/lib/tenants-actions', () => ({
  fetchTenantsAdmin: jest.fn(),
  fetchTenantsSuperadmin: jest.fn(),
  deleteTenant: jest.fn(), // если используется
}));
jest.mock('@/app/admin/users/lib/users-actions', () => ({
  fetchTenantsAdmin: jest.fn(),
  fetchTenantsSuperadmin: jest.fn(),
  deleteTenant: jest.fn(), // если используется
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantsTable } from '@/app/admin/tenants/lib/tenants-table';
// import { act } from 'react-dom/test-utils';

// Мокаем динамический импорт
jest.mock('@/app/admin/tenants/lib/btnEditTenantModal', () => ({
  __esModule: true,
  default: () => <button data-testid="edit-modal-btn">Edit Modal</button>,
}));

// Мокаем MessageBoxOKCancel, чтобы не ломал рендер
jest.mock('@/app/lib/MessageBoxOKCancel', () => ({
  __esModule: true,
  default: () => <div data-testid="message-box">MessageBox</div>,
}));

// Мокаем Zustand-сторы
import * as useTenantStore from '@/app/admin/tenants/store/use-tenant-store';
import * as useDocumentStore from '@/app/store/useDocumentStore';

// Тестовые данные
const mockTenants = [
  {
    id: '1',
    name: 'Org A',
    description: 'Description A',
    active: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'superadmin',
    description: 'Superadmin org',
    active: true,
    created_at: '2024-01-01',
  },
];

describe('TenantsTable', () => {
  beforeEach(() => {
    // Сбрасываем Zustand-сторы
    useTenantStore.fillTenants([]);
    // useDocumentStore.useMessageBox.setState({
    //   isMessageBoxOpen: false,
    //   messageBoxText: '',
    //   isOKButtonPressed: false,
    //   isShowMessageBoxCancel: false,
    // });

    // Мокаем действия
    jest.spyOn(useTenantStore, 'fillTenants').mockImplementation(() => {});
    jest.spyOn(useTenantStore, 'delTenant').mockImplementation(async (tenant) => {});
    jest.spyOn(useDocumentStore, 'setMessageBoxText').mockImplementation(() => {});
    jest.spyOn(useDocumentStore, 'setIsShowMessageBoxCancel').mockImplementation(() => {});
    jest.spyOn(useDocumentStore, 'setIsMessageBoxOpen').mockImplementation(() => {});
    jest.spyOn(useDocumentStore, 'setIsOKButtonPressed').mockImplementation(() => {});
  });

  it('renders tenants correctly for superadmin', () => {
    render(<TenantsTable tenants={mockTenants} superadmin={true} />);

    // Проверяем, что организации отображаются
    expect(screen.getByText('Org A')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
    expect(screen.getByText('superadmin')).toBeInTheDocument();

    // Проверяем, что кнопки есть только у Org A (не у superadmin)
    const editButtons = screen.getAllByTestId('edit-modal-btn');
    expect(editButtons).toHaveLength(1); // только для Org A

    const trashButtons = screen.getAllByRole('button', { name: '' }); // ищем по иконке Trash
    expect(trashButtons).toHaveLength(1); // только для Org A
  });

  it('does not show action buttons for non-superadmin', () => {
    render(<TenantsTable tenants={mockTenants} superadmin={false} />);

    // Организации отображаются
    expect(screen.getByText('Org A')).toBeInTheDocument();

    // Но кнопок редактирования/удаления нет
    expect(screen.queryByTestId('edit-modal-btn')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument(); // trash icon
  });

  it('opens confirmation dialog on delete click', async () => {
    const user = userEvent.setup();
    render(<TenantsTable tenants={mockTenants} superadmin={true} />);

    // Нажимаем на кнопку удаления для Org A
    const trashButton = screen.getAllByRole('button', { name: '' })[0];
    await user.click(trashButton);

    // Проверяем, что вызваны действия стора
    expect(useDocumentStore.setMessageBoxText).toHaveBeenCalledWith(
      'Организация: Org A \nУдалить Организацию?'
    );
    expect(useDocumentStore.setIsShowMessageBoxCancel).toHaveBeenCalledWith(true);
    expect(useDocumentStore.setIsMessageBoxOpen).toHaveBeenCalledWith(true);
  });
});