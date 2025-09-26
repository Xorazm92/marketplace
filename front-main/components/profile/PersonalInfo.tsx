'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Select,
  DateInput,
  Button,
  Group,
  Stack,
  Avatar,
  FileButton,
  Modal,
  Text,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUpload, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { userProfileApi } from '@/services/user-profile';
import { useAuth } from '@/hooks/auth';
import AvatarCropper from './AvatarCropper';

const genderOptions = [
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
  { value: 'other', label: 'Boshqa' },
];

export default function PersonalInfo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userProfileApi.getProfile(),
  });

  const form = useForm({
    initialValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      birthDate: profile?.birthDate ? new Date(profile.birthDate) : null,
      gender: profile?.gender || '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Yaroqli email kiriting'),
      phone: (value) => (value && value.length >= 12 ? null : 'Yaroqli telefon raqam kiriting'),
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: any) => userProfileApi.updateProfile(values),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Profil muvaffaqiyatli yangilandi',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userProfileApi.uploadAvatar(file),
    onSuccess: (data) => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Avatar muvaffaqiyatli yuklandi',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const sendEmailVerificationMutation = useMutation({
    mutationFn: () => userProfileApi.sendEmailVerification(),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Email tasdiqlash kodi yuborildi',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const sendPhoneVerificationMutation = useMutation({
    mutationFn: () => userProfileApi.sendPhoneVerification(),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'SMS tasdiqlash kodi yuborildi',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    open();
  };

  const handleAvatarSave = (croppedFile: File) => {
    uploadAvatarMutation.mutate(croppedFile);
    close();
  };

  const handleSubmit = (values: any) => {
    updateProfileMutation.mutate({
      ...values,
      birthDate: values.birthDate?.toISOString(),
    });
  };

  return (
    <>
      <Stack gap="lg">
        <Group align="center">
          <Avatar
            src={profile?.avatar || '/default-avatar.png'}
            size={120}
            radius={60}
          />
          <div>
            <FileButton onChange={handleAvatarUpload} accept="image/png,image/jpeg">
              {(props) => (
                <Button {...props} leftSection={<IconUpload size={16} />} variant="light">
                  Avatar yuklash
                </Button>
              )}
            </FileButton>
            <Text size="xs" c="dimmed" mt={4}>
              PNG yoki JPG, maksimal 2MB
            </Text>
          </div>
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Ism"
              placeholder="Ismingizni kiriting"
              {...form.getInputProps('firstName')}
            />
            
            <TextInput
              label="Familiya"
              placeholder="Familiyangizni kiriting"
              {...form.getInputProps('lastName')}
            />
            
            <TextInput
              label="Email"
              placeholder="email@example.com"
              type="email"
              rightSection={
                profile?.emailVerified ? (
                  <IconCheck size={16} color="green" />
                ) : (
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => sendEmailVerificationMutation.mutate()}
                    loading={sendEmailVerificationMutation.isPending}
                  >
                    Tasdiqlash
                  </Button>
                )
              }
              {...form.getInputProps('email')}
            />
            
            <TextInput
              label="Telefon"
              placeholder="+998901234567"
              rightSection={
                profile?.phoneVerified ? (
                  <IconCheck size={16} color="green" />
                ) : (
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => sendPhoneVerificationMutation.mutate()}
                    loading={sendPhoneVerificationMutation.isPending}
                  >
                    Tasdiqlash
                  </Button>
                )
              }
              {...form.getInputProps('phone')}
            />
            
            <DateInput
              label="Tug\'ilgan kun"
              placeholder="Tug\'ilgan kuningizni tanlang"
              {...form.getInputProps('birthDate')}
            />
            
            <Select
              label="Jins"
              placeholder="Jinsingizni tanlang"
              data={genderOptions}
              {...form.getInputProps('gender')}
            />
            
            <Group justify="flex-end">
              <Button type="submit" loading={updateProfileMutation.isPending}>
                Saqlash
              </Button>
            </Group>
          </Stack>
        </form>

        <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
          Parolni o\'zgartirish
        </Button>
      </Stack>

      <AvatarCropper
        opened={opened}
        onClose={close}
        file={avatarFile}
        onSave={handleAvatarSave}
      />

      <ChangePasswordModal
        opened={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}

function ChangePasswordModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (value.length >= 8 ? null : 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'),
      confirmPassword: (value, values) => (value === values.newPassword ? null : 'Parollar mos emas'),
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: any) => userProfileApi.changePassword(values),
    onSuccess: () => {
      notifications.show({
        title: 'Muvaffaqiyatli',
        message: 'Parol muvaffaqiyatli o\'zgartirildi',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
      form.reset();
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Parolni o\'zgartirish">
      <form onSubmit={form.onSubmit((values) => changePasswordMutation.mutate(values))}>
        <Stack>
          <PasswordInput
            label="Joriy parol"
            placeholder="Joriy parolingizni kiriting"
            {...form.getInputProps('currentPassword')}
          />
          <PasswordInput
            label="Yangi parol"
            placeholder="Yangi parol kiriting"
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Parolni tasdiqlang"
            placeholder="Yangi parolni qayta kiriting"
            {...form.getInputProps('confirmPassword')}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={changePasswordMutation.isPending}>
              O\'zgartirish
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
