import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemForm } from '@/components/menu/MenuItemForm';
import { useMenuStore } from '@/stores/menuStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { MenuItem, NewMenuItem } from '@/db/types';

export function Menu() {
  const {
    items,
    customizations,
    addItem,
    updateItem,
    deleteItem,
  } = useMenuStore();
  const { activeSession, updateActiveSessionSnapshot } = useSessionStore();
  const { getSnapshot } = useMenuStore();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = ['espresso', 'drip', 'tea', 'other'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    espresso: 'Espresso',
    drip: 'Drip',
    tea: 'Tea',
    other: 'Other',
  };

  const handleAddItem = async (data: NewMenuItem) => {
    await addItem(data);
    // If there's an active session, update its snapshot
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

  const handleToggleAvailable = async (id: string, available: boolean) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">
            Menu
          </h1>
          <p className="text-sm text-oat-600">
            Manage items and customizations
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {activeSession && (
        <div className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          Changes will update the active session's menu
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="customizations">Customizations</TabsTrigger>
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
                        setShowForm(true);
                      }}
                      onDelete={handleDeleteItem}
                      onToggleAvailable={handleToggleAvailable}
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
                onClick={() => setShowForm(true)}
                className="mt-1 text-terracotta"
              >
                Add your first item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customizations">
          <div className="space-y-6">
            {(['temperature', 'size', 'milk', 'syrup'] as const).map((category) => {
              const options = customizations.filter((c) => c.category === category);
              if (options.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-medium capitalize text-oat-600">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <span
                        key={option.id}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          option.available
                            ? 'border-oat-200 bg-white text-espresso'
                            : 'border-dashed border-oat-300 text-oat-400'
                        }`}
                      >
                        {option.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-oat-500">
              Customization editing coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Form */}
      <MenuItemForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
      />
    </div>
  );
}
