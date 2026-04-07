import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  // Global Cached State
  const [creatures, setCreatures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [spells, setSpells] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Setup listeners for all top-level collections
    const unsubCreatures = onSnapshot(collection(db, 'creatures'), (snapshot) => {
      setCreatures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubEncounters = onSnapshot(collection(db, 'encounters'), (snapshot) => {
      setEncounters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSpells = onSnapshot(collection(db, 'spells'), (snapshot) => {
      setSpells(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubItems = onSnapshot(collection(db, 'items'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Assume loaded after a short delay for listeners to fire initial snapshots
    // In a prod app, you might track individual loading states per collection
    const timeout = setTimeout(() => {
        setLoading(false);
    }, 1000);

    return () => {
      unsubCreatures();
      unsubPlayers();
      unsubEncounters();
      unsubSpells();
      unsubItems();
      clearTimeout(timeout);
    };
  }, []);

  // Helpful CRUD utility wrappers
  const getEntity = (collectionName, id) => {
    switch(collectionName) {
        case 'creatures': return creatures.find(c => c.id === id);
        case 'players': return players.find(p => p.id === id);
        case 'encounters': return encounters.find(e => e.id === id);
        case 'spells': return spells.find(s => s.id === id);
        case 'items': return items.find(i => i.id === id);
        default: return null;
    }
  };

  const updateEntity = async (collectionName, id, data) => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
  };

  const createEntity = async (collectionName, data) => {
      const colRef = collection(db, collectionName);
      return await addDoc(colRef, data);
  };

  const deleteEntity = async (collectionName, id) => {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
  };

  const value = {
    creatures,
    players,
    encounters,
    spells,
    items,
    loading,
    getEntity,
    updateEntity,
    createEntity,
    deleteEntity
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
