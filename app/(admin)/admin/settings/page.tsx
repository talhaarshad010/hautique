'use client';

import * as React from 'react';
import { ref, onValue, set, push, remove, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button, Input } from '@/components/ui';
import { Truck, Save, Loader2, CheckCircle2, UserPlus, Trash2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const [shippingFee, setShippingFee] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  
  // Admin Management State
  const [admins, setAdmins] = React.useState<any[]>([]);
  const [newAdmin, setNewAdmin] = React.useState({ email: '', password: '' });
  const [isAddingAdmin, setIsAddingAdmin] = React.useState(false);

  React.useEffect(() => {
    const settingsRef = ref(database, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data.shippingFee === 'number') {
        setShippingFee(data.shippingFee);
      }
    });

    const adminsRef = ref(database, 'admins');
    const unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, admin]: [string, any]) => ({
          id,
          ...admin
        }));
        setAdmins(formatted);
      } else {
        setAdmins([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeAdmins();
    };
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) return;
    setIsAddingAdmin(true);

    try {
      // Check if email already exists
      const emailExists = admins.some(a => a.email === newAdmin.email);
      if (emailExists) {
        alert("This admin email already exists.");
        return;
      }

      const adminsRef = ref(database, 'admins');
      const newAdminRef = push(adminsRef);
      await set(newAdminRef, {
        email: newAdmin.email.toLowerCase(),
        password: newAdmin.password, // In a real app, this should be hashed
        createdAt: new Date().toISOString()
      });
      setNewAdmin({ email: '', password: '' });
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (admins.length <= 1) {
      alert("You must have at least one admin.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this admin?")) {
      try {
        await remove(ref(database, `admins/${id}`));
      } catch (error) {
        console.error("Error removing admin:", error);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await set(ref(database, 'settings/shippingFee'), Number(shippingFee));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif tracking-tight">Store Settings</h1>
        <p className="text-neutral-400 text-sm uppercase tracking-widest">Configure your boutique's global parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping Configuration */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border p-8 rounded-2xl shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-serif">Delivery Logistics</h2>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Manage shipping costs and fees</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                  Flat Rate Shipping Fee (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">PKR</span>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-border rounded-xl px-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                  Note: This fee will be applied globally to all orders during checkout. Use 0 for free shipping.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full md:w-auto min-w-[200px] py-4 rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : saved ? 'Settings Updated' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-serif italic text-neutral-400">Pro Tip</h3>
            <p className="text-xs leading-relaxed text-neutral-300">
              Consider seasonal promotions where you set the shipping fee to $0 to encourage higher conversion rates.
            </p>
          </div>
          
          <div className="bg-neutral-100 p-6 rounded-2xl border border-border">
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3">Active Configuration</h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 italic">Current Fee</span>
                <span className="font-bold font-serif">PKR {shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 italic">Method</span>
                <span className="font-bold font-serif">Standard Flat Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="pt-12 border-t border-border">
        <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-3xl font-serif tracking-tight">Admin Accounts</h2>
            <p className="text-neutral-400 text-sm uppercase tracking-widest">Manage authorized personnel access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-neutral-400">Admin Email</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-neutral-400">Created At</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-neutral-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-400 text-xs italic">
                                        No dynamic admins found. Initial hardcoded admin is active.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {admin.email[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium">{admin.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-neutral-400 uppercase tracking-widest">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleRemoveAdmin(admin.id)}
                                                className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <form onSubmit={handleAddAdmin} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-4 h-4" />
                        <h3 className="text-sm uppercase tracking-widest font-bold">Add New Admin</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="admin@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isAddingAdmin} className="w-full py-6 rounded-xl text-[10px] uppercase tracking-widest font-bold">
                            {isAddingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Admin Account"}
                        </Button>
                    </div>
                </form>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-blue-900 mb-1">Security Note</h4>
                        <p className="text-[10px] text-blue-700 leading-relaxed italic">
                            New admins will be able to manage orders, products, and other admin accounts. Ensure you only add trusted personnel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
