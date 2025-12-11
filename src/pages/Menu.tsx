import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemForm } from '@/components/menu/MenuItemForm';
import { ModifierGroupCard } from '@/components/menu/ModifierGroupCard';
import { ModifierGroupForm } from '@/components/menu/ModifierGroupForm';
import { CategoryCard } from '@/components/menu/CategoryCard';
import { CategoryForm } from '@/components/menu/CategoryForm';
import { useMenuStore } from '@/stores/menuStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { MenuItem, ModifierGroup, Category, NewMenuItem, NewModifierGroup, NewCategory } from '@/db/types';

export function Menu() {
  const {
    items,
    modifierGroups,
    categories,
    addItem,
    updateItem,
    deleteItem,
    addModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
    addCategory,
    updateCategory,
    deleteCategory,
    getSnapshot,
  } = useMenuStore();
  const { activeSession, updateActiveSessionSnapshot } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'items' | 'groups' | 'categories'>('items');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  // Category handlers
  const handleAddCategory = async (data: NewCategory) => {
    await addCategory(data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleUpdateCategory = async (data: NewCategory) => {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, data);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
    setEditingCategory(null);
  };

  const handleToggleCategoryAvailable = async (id: string, available: boolean) => {
    await updateCategory(id, { available });
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    if (activeSession) {
      await updateActiveSessionSnapshot(getSnapshot());
    }
  };

  // Get item count per category
  const getItemCount = (categoryId: string) => {
    return items.filter((item) => item.categoryId === categoryId).length;
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
            } else if (activeTab === 'groups') {
              setShowGroupForm(true);
            } else {
              setShowCategoryForm(true);
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'items' ? 'Add Item' : activeTab === 'groups' ? 'Add Group' : 'Add Category'}
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
        onValueChange={(v) => setActiveTab(v as 'items' | 'groups' | 'categories')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="groups">Modifiers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id}>
                <h3 className="mb-2 text-sm font-medium text-oat-600">
                  {category.name}
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

        <TabsContent value="categories" className="space-y-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              itemCount={getItemCount(category.id)}
              onEdit={(category) => {
                setEditingCategory(category);
                setShowCategoryForm(true);
              }}
              onDelete={handleDeleteCategory}
              onToggleAvailable={handleToggleCategoryAvailable}
            />
          ))}

          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed border-oat-300 bg-oat-50 py-12 text-center">
              <p className="text-oat-500">No categories yet</p>
              <Button
                variant="link"
                onClick={() => setShowCategoryForm(true)}
                className="mt-1 text-terracotta"
              >
                Add your first category
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
        categories={categories}
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

      {/* Category Form */}
      <CategoryForm
        open={showCategoryForm}
        onOpenChange={(open) => {
          setShowCategoryForm(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
      />
    </div>
  );
}

