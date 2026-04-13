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
  
  const [feats, setFeats] = useState([]);
  const [classes, setClasses] = useState([]);
  const [ancestries, setAncestries] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [heritages, setHeritages] = useState([]);
  const [actions, setActions] = useState([]);
  const [effects, setEffects] = useState([]);

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

    const unsubFeats = onSnapshot(collection(db, 'feats'), (snapshot) => {
      setFeats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubAncestries = onSnapshot(collection(db, 'ancestries'), (snapshot) => {
      setAncestries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBackgrounds = onSnapshot(collection(db, 'backgrounds'), (snapshot) => {
      setBackgrounds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubHeritages = onSnapshot(collection(db, 'heritages'), (snapshot) => {
      setHeritages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubActions = onSnapshot(collection(db, 'actions'), (snapshot) => {
      setActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubEffects = onSnapshot(collection(db, 'effects'), (snapshot) => {
      setEffects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      unsubFeats();
      unsubClasses();
      unsubAncestries();
      unsubBackgrounds();
      unsubHeritages();
      unsubActions();
      unsubEffects();
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
        case 'feats': return feats.find(f => f.id === id);
        case 'classes': return classes.find(c => c.id === id);
        case 'ancestries': return ancestries.find(a => a.id === id);
        case 'backgrounds': return backgrounds.find(b => b.id === id);
        case 'heritages': return heritages.find(h => h.id === id);
        case 'actions': return actions.find(a => a.id === id);
        case 'effects': return effects.find(e => e.id === id);
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
    feats,
    classes,
    ancestries,
    backgrounds,
    heritages,
    actions,
    effects,
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
