'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Settings, DollarSign, Bell, TrendingUp } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    basePrice: 10,
    levelMultiplier: 2,
    experienceDivisor: 100,
    transactionFee: 0.01,
    minExperienceAward: 10,
    maxExperienceAward: 1000,
  });

  const [notifications, setNotifications] = useState({
    priceChangeThreshold: 5,
    enableEmailNotifications: false,
    enableTelegramNotifications: true,
  });

  const handleSave = async () => {
    // TODO: Сохранить настройки в БД или конфигурационный файл
    console.log('Saving settings:', settings, notifications);
    alert('Settings saved!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          System Settings
        </h1>
      </div>

      {/* Pricing Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold">Pricing Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Base Price"
            type="number"
            value={settings.basePrice.toString()}
            onChange={(e) => setSettings({ ...settings, basePrice: parseFloat(e.target.value) })}
            helperText="Starting price for new skills"
          />
          <Input
            label="Level Multiplier"
            type="number"
            value={settings.levelMultiplier.toString()}
            onChange={(e) => setSettings({ ...settings, levelMultiplier: parseFloat(e.target.value) })}
            helperText="Price increase per level"
          />
          <Input
            label="Experience Divisor"
            type="number"
            value={settings.experienceDivisor.toString()}
            onChange={(e) => setSettings({ ...settings, experienceDivisor: parseFloat(e.target.value) })}
            helperText="Experience points per price unit"
          />
          <Input
            label="Transaction Fee (%)"
            type="number"
            step="0.01"
            value={settings.transactionFee.toString()}
            onChange={(e) => setSettings({ ...settings, transactionFee: parseFloat(e.target.value) })}
            helperText="Fee percentage on transactions"
          />
        </div>
      </Card>

      {/* Experience Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success" />
          <h2 className="text-xl font-bold">Experience Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Min Experience Award"
            type="number"
            value={settings.minExperienceAward.toString()}
            onChange={(e) => setSettings({ ...settings, minExperienceAward: parseInt(e.target.value) })}
            helperText="Minimum experience for achievements"
          />
          <Input
            label="Max Experience Award"
            type="number"
            value={settings.maxExperienceAward.toString()}
            onChange={(e) => setSettings({ ...settings, maxExperienceAward: parseInt(e.target.value) })}
            helperText="Maximum experience for achievements"
          />
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-warning" />
          <h2 className="text-xl font-bold">Notification Settings</h2>
        </div>
        <div className="space-y-4">
          <Input
            label="Price Change Threshold (%)"
            type="number"
            value={notifications.priceChangeThreshold.toString()}
            onChange={(e) => setNotifications({ ...notifications, priceChangeThreshold: parseFloat(e.target.value) })}
            helperText="Notify users when price changes by this percentage"
          />
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium mb-1">Email Notifications</label>
              <p className="text-sm text-dark-muted">Send email notifications to users</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.enableEmailNotifications}
              onChange={(e) => setNotifications({ ...notifications, enableEmailNotifications: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Notifications</label>
              <p className="text-sm text-dark-muted">Send Telegram notifications to users</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.enableTelegramNotifications}
              onChange={(e) => setNotifications({ ...notifications, enableTelegramNotifications: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} variant="primary" size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}


