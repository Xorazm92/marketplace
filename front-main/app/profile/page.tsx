'use client';

import { useState } from 'react';
import { Tabs, Card, Container, Grid } from '@mantine/core';
import { IconUser, IconMapPin, IconShoppingBag, IconCreditCard, IconHeart, IconBell, IconShield, IconChartBar } from '@tabler/icons-react';
import PersonalInfo from '@/components/profile/PersonalInfo';
import AddressManager from '@/components/profile/AddressManager';
import OrderHistory from '@/components/profile/OrderHistory';
import PaymentMethods from '@/components/profile/PaymentMethods';
import Wishlist from '@/components/profile/Wishlist';
import NotificationSettings from '@/components/profile/NotificationSettings';
import SecuritySettings from '@/components/profile/SecuritySettings';
import ExpenseTracker from '@/components/profile/ExpenseTracker';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { value: 'personal', label: 'Shaxsiy ma\'lumotlar', icon: IconUser, component: PersonalInfo },
    { value: 'addresses', label: 'Manzillar', icon: IconMapPin, component: AddressManager },
    { value: 'orders', label: 'Buyurtmalar', icon: IconShoppingBag, component: OrderHistory },
    { value: 'payments', label: 'To\'lov usullari', icon: IconCreditCard, component: PaymentMethods },
    { value: 'wishlist', label: 'Sevimli mahsulotlar', icon: IconHeart, component: Wishlist },
    { value: 'notifications', label: 'Bildirishnomalar', icon: IconBell, component: NotificationSettings },
    { value: 'security', label: 'Xavfsizlik', icon: IconShield, component: SecuritySettings },
    { value: 'expenses', label: 'Harajatlar', icon: IconChartBar, component: ExpenseTracker },
  ];

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Card shadow="sm" radius="md" withBorder>
            <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
              <Tabs.List grow>
                {tabs.map((tab) => (
                  <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              {tabs.map((tab) => (
                <Tabs.Panel key={tab.value} value={tab.value} pt="md">
                  <tab.component />
                </Tabs.Panel>
              ))}
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
