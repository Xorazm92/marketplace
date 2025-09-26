'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  MultiSelect,
  Group,
  Stack,
  Badge,
  Switch,
  ActionIcon,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconCheck } from '@tabler/icons-react';
import { rbacApi } from '@/services/rbac';

const permissions = [
  { value: 'view_products', label: 'Mahsulotlarni ko\'rish' },
  { value: 'search_products', label: 'Qidirish va filtrlash' },
  { value: 'place_order', label: 'Buyurtma berish' },
  { value: 'manage_products', label: 'Mahsulotlar boshqaruvi' },
  { value: 'moderate_products', label: 'Mahsulotlarni tasdiqlash' },
  { value: 'manage_users', label: 'Foydalanuvchi boshqaruvi' },
  { value: 'system_config', label: 'Sistema sozlamalari' },
];

export default function RoleManager() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rbacApi.getRoles(),
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => rbacApi.createRole(data),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Rol muvaffaqiyatli yaratildi',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      close();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: any }) =>
      rbacApi.updateRole(name, data),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Rol muvaffaqiyatli yangilandi',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      close();
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (name: string) => rbacApi.deleteRole(name),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Rol muvaffaqiyatli o\'chirildi',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleSubmit = (values: any) => {
    if (editingRole) {
      updateRoleMutation.mutate({ name: editingRole.name, data: values });
    } else {
      createRoleMutation.mutate(values);
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    open();
  };

  const handleCreate = () => {
    setEditingRole(null);
    open();
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700}>
          Rol boshqaruvi
        </Text>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Rol qo'shish
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nomi</Table.Th>
            <Table.Th>Tavsifi</Table.Th>
            <Table.Th>Huquqlar</Table.Th>
            <Table.Th>Holat</Table.Th>
            <Table.Th>Amallar</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {roles?.map((role: any) => (
            <Table.Tr key={role.name}>
              <Table.Td>
                <Text fw={500}>{role.name}</Text>
              </Table.Td>
              <Table.Td>{role.description}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {role.permissions.slice(0, 3).map((perm: any) => (
                    <Badge key={perm.name} size="sm" variant="light">
                      {perm.name}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge size="sm" variant="outline">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </Group>
              </Table.Td>
              <Table.Td>
                <Switch
                  checked={role.isActive}
                  onChange={(event) =>
                    updateRoleMutation.mutate({
                      name: role.name,
                      data: { isActive: event.currentTarget.checked },
                    })
                  }
                />
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(role)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => deleteRoleMutation.mutate(role.name)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title={editingRole ? 'Rolni tahrirlash' : 'Yangi rol qo\'shish'}
        size="lg"
      >
        <RoleForm
          role={editingRole}
          onSubmit={handleSubmit}
          onClose={close}
          loading={createRoleMutation.isPending || updateRoleMutation.isPending}
        />
      </Modal>
    </>
  );
}

function RoleForm({ role, onSubmit, onClose, loading }: any) {
  const form = useForm({
    initialValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions?.map((p: any) => p.name) || [],
      isActive: role?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Rol nomi"
          placeholder="Masalan: customer"
          {...form.getInputProps('name')}
          disabled={!!role}
        />
        <TextInput
          label="Tavsifi"
          placeholder="Rol tavsifi"
          {...form.getInputProps('description')}
        />
        <MultiSelect
          label="Huquqlar"
          placeholder="Huquqlarni tanlang"
          data={permissions}
          {...form.getInputProps('permissions')}
        />
        <Switch
          label="Faol holatda"
          {...form.getInputProps('isActive', { type: 'checkbox' })}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={loading}>
            Saqlash
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
