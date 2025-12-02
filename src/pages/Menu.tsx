import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemForm } from '@/components/menu/MenuItemForm';
import { ModifierGroupCard } from '@/components/menu/ModifierGroupCard';
import { ModifierGroupForm } from '@/components/menu/ModifierGroupForm';
import { useMenuStore } from '@/stores/menuStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { MenuItem, ModifierGroup, NewMenuItem, NewModifierGroup } from '@/db/types';

export function Menu() {
  const {
    items,
    modifierGroups,
    addItem,
    updateItem,
    deleteItem,
    addModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
  } = useMenuStore();
  const { activeSession, updateActiveSessionSnapshot } = useSessionStore();
  const { getSnapshot } = useMenuStore();

  const [activeTab, setActiveTab] = useState<'items' | 'groups'>('items');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

  const categories = ['espresso', 'drip', 'tea', 'other'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    espresso: 'Espresso',
    drip: 'Drip',
    tea: 'Tea',
    other: 'Other',
  };

  // Menu item handlers
  const handleAddItem = async (data: NewMenuItem) => {
    await addItem(data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleUpdateItem = async (data: NewMenuItem) => {
    if (!editingItem) return;
    await updateItem(editingItem.id, data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
    setEditingItem(null);
  };

  const handleToggleItemAvailable = async (id: string, available: boolean) => {
    await updateItem(id, { available });
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  // Modifier group handlers
  const handleAddGroup = async (data: NewModifierGroup) => {
    await addModifierGroup(data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleUpdateGroup = async (data: NewModifierGroup) => {
    if (!editingGroup) return;
    await updateModifierGroup(editingGroup.id, data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
    setEditingGroup(null);
  };

  const handleToggleGroupAvailable = async (id: string, available: boolean) => {
    await updateModifierGroup(id, { available });
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteModifierGroup(id);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">
            Menu
          </h1>
          <p className="text-sm text-oat-600">
            Manage items and modifier groups
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === 'items') {
              setShowItemForm(true);
            } else {
              setShowGroupForm(true);
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'items' ? 'Add Item' : 'Add Group'}
        </Button>
      </div>

      {activeSession && (
        <div className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          Changes will update the active session's menu
        </div>
      )}

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'items' | 'groups')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="groups">Modifier Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mb-2 text-sm font-medium text-oat-600">
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={(item) => {
                        setEditingItem(item);
                        setShowItemForm(true);
                      }}
                      onDelete={handleDeleteItem}
                      onToggleAvailable={handleToggleItemAvailable}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-oat-300 bg-oat-50 py-12 text-center">
              <p className="text-oat-500">No menu items yet</p>
              <Button
                variant="link"
                onClick={() => setShowItemForm(true)}
                className="mt-1 text-terracotta"
              >
                Add your first item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {modifierGroups.map((group) => (
            <ModifierGroupCard
              key={group.id}
              group={group}
              onEdit={(group) => {
                setEditingGroup(group);
                setShowGroupForm(true);
              }}
              onDelete={handleDeleteGroup}
              onToggleAvailable={handleToggleGroupAvailable}
            />
          ))}

          {modifierGroups.length === 0 && (
            <div className="rounded-xl border border-dashed border-oat-300 bg-oat-50 py-12 text-center">
              <p className="text-oat-500">No modifier groups yet</p>
              <Button
                variant="link"
                onClick={() => setShowGroupForm(true)}
                className="mt-1 text-terracotta"
              >
                Add your first group
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Menu Item Form */}
      <MenuItemForm
        open={showItemForm}
        onOpenChange={(open) => {
          setShowItemForm(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        modifierGroups={modifierGroups}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
      />

      {/* Modifier Group Form */}
      <ModifierGroupForm
        open={showGroupForm}
        onOpenChange={(open) => {
          setShowGroupForm(open);
          if (!open) setEditingGroup(null);
        }}
        group={editingGroup}
        onSubmit={editingGroup ? handleUpdateGroup : handleAddGroup}
      />
    </div>
  );
}

