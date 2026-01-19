import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, StopCircle, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionStats } from '@/components/session/SessionStats';
import { CustomerTally } from '@/components/session/CustomerTally';
import { OrderList } from '@/components/session/OrderList';
import { OrderEntry } from '@/components/session/OrderEntry';
import { useSessionStore } from '@/stores/sessionStore';
import { useOrderStore } from '@/stores/orderStore';
import { useMenuStore } from '@/stores/menuStore';
import { calculateTotalRevenue } from '@/lib/utils';
import type { Order, OrderCustomizations } from '@/db/types';

export function ActiveSession() {
  const navigate = useNavigate();
  const { activeSession, updateSession, endSession } = useSessionStore();
  const { orders, loadOrdersForSession, addOrder, deleteOrder, updateOrder } = useOrderStore();
  const { loadMenu } = useMenuStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');

  useEffect(() => {
    if (!activeSession) {
      navigate('/');
      return;
    }
    loadOrdersForSession(activeSession.id);
    loadMenu();
    setNotes(activeSession.notes);
  }, [activeSession, navigate, loadOrdersForSession, loadMenu]);

  const handleCustomerCountChange = async (count: number) => {
    await updateSession(activeSession!.id, { customerCount: count });
  };

  if (!activeSession) {
    return null;
  }

  // Use session snapshot for available items during the session
  const availableItems = activeSession.menuSnapshot.items;
  const availableModifierGroups = activeSession.menuSnapshot.modifierGroups || [];
  const availableCategories = activeSession.menuSnapshot.categories || [];

  // Calculate total revenue from orders
  const totalRevenue = calculateTotalRevenue(orders, activeSession.menuSnapshot);

  const handleAddOrder = async (order: {
    itemName: string;
    itemCategory: string;
    customizations: Record<string, string[]>;
    notes: string;
  }) => {
    await addOrder({
      sessionId: activeSession.id,
      ...order,
    });
  };

  const handleUpdateOrder = async (orderId: string, updates: {
    customizations: OrderCustomizations;
    notes: string;
  }) => {
    await updateOrder(orderId, updates);
    setEditingOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setActiveTab('order'); // Switch to order tab to show the edit dialog
  };

  const handleUpdateSettings = async () => {
    await updateSession(activeSession.id, { notes });
    setShowSettings(false);
  };

  const handleEndSession = async () => {
    await updateSession(activeSession.id, { notes });
    await endSession(activeSession.id);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">
            {activeSession.name || 'Active Session'}
          </h1>
          <p className="text-sm text-oat-600">
            {activeSession.name ? 'Active Session' : 'Log orders as they come in'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowEndConfirm(true)}
          >
            <StopCircle className="mr-2 h-4 w-4" />
            End
          </Button>
        </div>
      </div>

      {/* Stats */}
      <SessionStats session={activeSession} orderCount={orders.length} totalRevenue={totalRevenue} />

      {/* Customer Tally */}
      <CustomerTally
        count={activeSession.customerCount ?? 0}
        onChange={handleCustomerCountChange}
      />

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'order' | 'history')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="order">
            {editingOrder ? 'Edit Order' : 'New Order'}
          </TabsTrigger>
          <TabsTrigger value="history">
            Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <OrderEntry
            items={availableItems}
            modifierGroups={availableModifierGroups}
            categories={availableCategories}
            onSubmit={handleAddOrder}
            editingOrder={editingOrder}
            onCancelEdit={() => setEditingOrder(null)}
            onUpdate={handleUpdateOrder}
          />
        </TabsContent>

        <TabsContent value="history">
          <OrderList
            orders={orders}
            onDelete={deleteOrder}
            onEdit={handleEditOrder}
            menuSnapshot={activeSession.menuSnapshot}
          />
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Session Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this session"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateSettings}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Session Confirmation */}
      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-oat-600">
            This will close the current session with {orders.length} orders.
            You can still view this session in your history.
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEndConfirm(false)}
            >
              Keep Open
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleEndSession}
            >
              End Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

