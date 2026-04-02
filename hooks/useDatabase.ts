import { useState, useEffect } from "react";
import { ref, onValue, set, get, push, child, remove } from "firebase/database";
import { database } from "@/lib/firebase";

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Listen to a specific path for real-time updates
   */
  const listen = (path: string, callback: (data: any) => void) => {
    const dbRef = ref(database, path);
    return onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    }, (err) => {
      console.error("Database listen error:", err);
      setError(err);
    });
  };

  /**
   * Set data at a specific path (overwrites existing data)
   */
  const setData = async (path: string, data: any) => {
    setLoading(true);
    try {
      await set(ref(database, path), data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Push data to a list (generates a unique ID)
   */
  const pushData = async (path: string, data: any) => {
    setLoading(true);
    try {
      const newRef = push(ref(database, path));
      await set(newRef, data);
      return newRef.key;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    listen,
    setData,
    pushData,
    loading,
    error,
  };
}
