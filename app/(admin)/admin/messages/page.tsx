'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Mail, Reply, Trash2, Loader2, Eye, Calendar, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

interface CustomerMessage {
  dbId: string;
  id: string;
  fullName: string;
  email: string;
  inquiryType: string;
  message: string;
  timestamp: string;
  date: string;
  status: 'Unread' | 'Responded' | 'Archived';
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = React.useState<CustomerMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMessage, setSelectedMessage] = React.useState<CustomerMessage | null>(null);

  React.useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([dbId, msg]: [string, any]) => ({
          dbId,
          ...msg
        }));
        // Sort by timestamp descending
        setMessages(formatted.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (dbId: string) => {
    try {
      await update(ref(database, `messages/${dbId}`), { status: 'Responded' });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteMessage = async (dbId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await remove(ref(database, `messages/${dbId}`));
        if (selectedMessage?.dbId === dbId) setSelectedMessage(null);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  const handleReply = (msg: CustomerMessage) => {
    const subject = encodeURIComponent(`RE: Hautique Inquiry - ${msg.inquiryType}`);
    const body = encodeURIComponent(`Dear ${msg.fullName},\n\nThank you for reaching out to Hautique.\n\nRegarding your inquiry: "${msg.message}"\n\n`);
    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
    markAsRead(msg.dbId);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl tracking-tight uppercase mb-2">Customer Messages</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Manage and respond to customer inquiries from the atelier.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Messages List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Customer</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Type</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Date</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 relative min-h-[400px]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-200" />
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-4">Unlocking Inquiries...</p>
                      </td>
                    </tr>
                  ) : messages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-200">
                          <Mail className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No messages found in the atelier</p>
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr 
                        key={msg.dbId} 
                        className={cn(
                          "hover:bg-neutral-50 transition-colors cursor-pointer group",
                          selectedMessage?.dbId === msg.dbId && "bg-neutral-50"
                        )}
                        onClick={() => setSelectedMessage(msg)}
                      >
                        <td className="px-6 py-6">
                          <p className="text-sm font-bold uppercase tracking-widest">{msg.fullName}</p>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{msg.email}</p>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-50 text-neutral-500 rounded border border-neutral-100 italic">
                            {msg.inquiryType}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-[10px] uppercase tracking-widest text-neutral-400">
                          {msg.date.split(',')[0]}
                        </td>
                        <td className="px-6 py-6">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-none border-none font-black",
                              msg.status === 'Unread' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'
                            )}
                          >
                            {msg.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(msg);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 px-4 text-[10px] uppercase tracking-widest font-bold"
                            >
                              <Reply className="w-3 h-3 mr-2" />
                              Reply
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Message View Panel */}
        <div className="xl:col-span-1">
          {selectedMessage ? (
            <Card className="p-8 sticky top-24 border-none shadow-sm transition-all duration-500">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-sm text-xl font-bold">
                  {selectedMessage.fullName.charAt(0)}
                </div>
                <div className="flex gap-2">
                   <Button 
                    onClick={() => deleteMessage(selectedMessage.dbId)}
                    variant="outline" 
                    size="sm" 
                    className="h-10 w-10 p-0 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-neutral-400">
                      <User className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">From</span>
                   </div>
                   <h3 className="text-xl font-bold uppercase tracking-widest">{selectedMessage.fullName}</h3>
                   <p className="text-xs text-neutral-400">{selectedMessage.email}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-neutral-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Received</span>
                   </div>
                   <p className="text-xs uppercase tracking-widest font-medium italic">{selectedMessage.date}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-neutral-400">
                      <Tag className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Subject</span>
                   </div>
                   <p className="text-sm font-bold uppercase tracking-widest underline decoration-black/10 underline-offset-4">{selectedMessage.inquiryType}</p>
                </div>

                <div className="pt-8 border-t border-neutral-50 mb-12">
                   <div className="flex items-center gap-3 text-neutral-400 mb-6 font-bold italic">
                      <Mail className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest">Inquiry Content</span>
                   </div>
                   <p className="text-sm leading-relaxed text-neutral-600 italic">
                      "{selectedMessage.message}"
                   </p>
                </div>

                <Button 
                  onClick={() => handleReply(selectedMessage)}
                  className="w-full h-14 rounded-none text-[10px] uppercase tracking-[0.3em] font-black group"
                >
                  <Reply className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                  Reply to inquiry
                </Button>
                
                <p className="text-[10px] text-center text-neutral-300 uppercase tracking-widest font-bold">
                  Sytem will open your default mail client
                </p>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-neutral-100 rounded-lg flex flex-col items-center justify-center text-center p-12">
              <Eye className="w-12 h-12 text-neutral-100 mb-6" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold leading-relaxed">
                Select an inquiry from the atelier list<br />to view detailed content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
