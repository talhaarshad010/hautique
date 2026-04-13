"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { ref, push, set } from "firebase/database";
import { database } from "@/lib/firebase";

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    inquiryType: "Product Guidance",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const messagesRef = ref(database, "messages");
      const newMessageRef = push(messagesRef);
      const generatedId = `MSG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newMessage = {
        id: generatedId,
        ...formData,
        timestamp: new Date().toISOString(),
        status: "Unread",
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      await set(newMessageRef, newMessage);
      setIsSent(true);
      setFormData({
        fullName: "",
        email: "",
        inquiryType: "Product Guidance",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left Side: Editorial Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 block mb-6 font-bold">
              Inquiries
            </span>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">
              Get in
              <br />
              Touch
            </h1>
            <p className="text-neutral-500 max-w-md uppercase tracking-widest text-[10px] leading-loose italic">
              Whether you are looking for a signature scent or simply want to
              learn more about our artistry, our team of perfume experts is here
              to guide you.
            </p>
          </div>

          <div className="space-y-8 border-t border-neutral-100 pt-12">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mb-1">
                  Email Us
                </p>
                <p className="text-sm font-bold">hautique0724@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mb-1">
                  Call Hautique
                </p>
                <p className="text-sm font-bold">+92 319 7780890</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-neutral-50 p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">
                        Full Name
                      </label>
                      <Input
                        required
                        className="h-14 rounded-none border-neutral-100 bg-white"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">
                        Email Address
                      </label>
                      <Input
                        required
                        type="email"
                        className="h-14 rounded-none border-neutral-100 bg-white"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">
                      Inquiry Type
                    </label>
                    <select
                      className="w-full h-14 rounded-none border-neutral-100 bg-white px-4 text-xs uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black font-sans"
                      value={formData.inquiryType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inquiryType: e.target.value,
                        })
                      }
                    >
                      <option>Product Guidance</option>
                      <option>Order Status</option>
                      <option>Wholesale Inquiries</option>
                      <option>Press & Media</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="w-full rounded-none border-neutral-100 bg-white p-4 text-xs tracking-widest focus:outline-none focus:ring-1 focus:ring-black font-sans"
                      placeholder="HOW CAN WE ASSIST YOU?"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-none text-[10px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Sending Request..." : "Send Message"}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 flex flex-col items-center text-center space-y-8"
                >
                  <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Message Received
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 leading-loose max-w-xs mx-auto">
                      Our concierge has been notified. You can expect a response
                      within 4-6 business hours.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsSent(false)}
                    variant="outline"
                    className="rounded-none px-12 border-neutral-200 text-[10px] uppercase tracking-widest"
                  >
                    Send Another
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
