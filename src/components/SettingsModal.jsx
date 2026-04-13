import React, { useState } from 'react';
import NavigationIcon from './NavigationIcon';
import { useDatabase } from '../context/DatabaseContext';
import { WEAPON_TRAITS, ABILITY_TRAITS } from '../utils/constants';

export default function SettingsModal({ onClose }) {
  const { createEntity, updateEntity, deleteEntity, creatures, players, items, spells, encounters, feats, classes, ancestries, backgrounds, heritages, actions, effects } = useDatabase();
  
  // Forms state
  const [repo, setRepo] = useState("foundryvtt/pf2e");
  const [path, setPath] = useState("packs/sf2e");
  const [token, setToken] = useState("");
  const [collectionTarget, setCollectionTarget] = useState("creatures");
  
  // Sync Status
  const [log, setLog] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const handleClearCollection = async (collectionStr, collectionArray, nameStr) => {
    if (!window.confirm(`Are you absolutely sure you want to PERMANENTLY delete ALL ${nameStr}? This action cannot be reversed.`)) return;
    
    addLog(`Initiating mass purge of ${nameStr} sequence...`);
    for (const item of collectionArray) {
      await deleteEntity(collectionStr, item.id);
    }
    addLog(`System Purge Complete: Destroyed all ${nameStr} records.`);
  };

  const addLog = (msg) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const handleSync = async () => {
    if (!repo || !path) return;
    setSyncing(true);
    setLog([]);
    addLog(`Initiating sync from github.com/${repo}/tree/master/${path}...`);
    
    try {
      const headers = {
        "Accept": "application/vnd.github.v3+json"
      };
      if (token) headers["Authorization"] = `token ${token}`;

      // 1. Fetch Repository Contents recursively
      const fetchDirectory = async (dirPath) => {
         const res = await fetch(`https://api.github.com/repos/${repo}/contents/${dirPath}`, { headers });
         if (!res.ok) {
             if (res.status === 403) {
                 throw new Error(`GitHub API limit exceeded: 403 for ${dirPath}. Unauthenticated IPs are limited to 60 requests per hour. Please generate a GitHub Personal Access Token and paste it into the Auth Token field below.`);
             }
             throw new Error(`GitHub API Error: ${res.status} ${res.statusText} for ${dirPath}`);
         }
         
         const items = await res.json();
         if (!Array.isArray(items)) throw new Error(`Path ${dirPath} is not a valid directory.`);
         
         let manifest = [];
         // Fetch simultaneously where possible, but keep API rate limits in mind.
         // GitHub allows 60 req/hr unauthenticated, 5000 authenticated.
         for (const item of items) {
            if (item.type === 'file' && item.name.endsWith('.json')) {
               manifest.push(item);
            } else if (item.type === 'dir') {
               addLog(`Crawling sub-directory: ${item.path}...`);
               const subManifest = await fetchDirectory(item.path);
               manifest.push(...subManifest);
            }
         }
         return manifest;
      };

      addLog(`Initiating recursive index of ${path}...`);
      const jsonFiles = await fetchDirectory(path);
      
      addLog(`Found ${jsonFiles.length} JSON files in directory tree. Processing batch...`);

      const contextArrays = { creatures, players, items, spells, feats, classes, ancestries, backgrounds, heritages, actions, effects };
      const currentDataset = contextArrays[collectionTarget] || [];

      let createCount = 0;
      let updateCount = 0;
      let errorCount = 0;
      let skipCount = 0;

      // 2. Fetch and Parse each JSON document
      // We process sequentially or in small batches to avoid slamming limiters
      for (const file of jsonFiles) {
        if (!file.download_url) continue;
        
        try {
          const rawRes = await fetch(file.download_url);
          if (!rawRes.ok) throw new Error(`Fetch failed for ${file.name}`);
          
          const rawData = await rawRes.json();
          
          // 3. Validate Entity Type Mappings
          const validateType = () => {
              if (!rawData.type) return false;
              const type = rawData.type.toLowerCase();
              switch(collectionTarget) {
                  case 'players': return ['character', 'npc', 'hazard'].includes(type);
                  case 'creatures': return ['character', 'npc', 'hazard'].includes(type);
                  case 'items': return ['equipment', 'consumable', 'weapon', 'armor', 'backpack', 'container'].includes(type);
                  case 'spells': return type === 'spell';
                  case 'feats': return type === 'feat';
                  case 'classes': return type === 'class';
                  case 'ancestries': return type === 'ancestry';
                  case 'backgrounds': return type === 'background';
                  case 'heritages': return type === 'heritage';
                  case 'actions': return type === 'action';
                  case 'effects': return type === 'effect' || type === 'condition';
                  default: return true;
              }
          };

          if (!validateType()) {
              skipCount++;
              continue;
          }
          
          // MAPPER: Map basic Foundry system fields to Starfinder DM Tool Schema
          // For now, we inject the raw object structure and do surface mapping.
          // Native Foundry documents usually have `{ name: "...", type: "...", system: { ... } }`
          // Extract specific combat attributes
          // Extract specific combat attributes
          const getAC = () => rawData.system?.attributes?.ac?.value || 10;
          const getSave = (save) => rawData.system?.saves?.[save]?.value || 0;
          
          const getSkills = () => {
            const skills = {};
            if (rawData.system?.skills) {
               Object.keys(rawData.system.skills).forEach(key => {
                  const mappedKey = key.charAt(0).toUpperCase() + key.slice(1);
                  skills[mappedKey] = rawData.system.skills[key].value || rawData.system.skills[key].base || 0;
               });
            }
            return skills;
          };

          // Extract derived values
          const getSenses = () => {
             const base = rawData.system?.perception?.senses || [];
             return base.map(s => {
                const typeString = s.type || "unknown";
                let text = typeString.charAt(0).toUpperCase() + typeString.slice(1);
                if (s.range) text += ` ${s.range} ft`;
                if (s.acuity) text += ` (${s.acuity})`;
                return text;
             });
          };

          const getSpeeds = () => {
             const speeds = [];
             if (rawData.system?.attributes?.speed?.value) {
                speeds.push({ type: 'land', value: rawData.system.attributes.speed.value });
             }
             const others = rawData.system?.attributes?.speed?.otherSpeeds || [];
             others.forEach(s => {
                speeds.push({ type: s.type, value: s.value });
             });
             return speeds;
          };

          const DISTANCE_TRAITS = ['reach', 'thrown', 'volley', 'range', 'burst', 'emanation', 'cone', 'line', 'aura', 'scatter'];
          const KNOWN_TRAITS = [...WEAPON_TRAITS, ...ABILITY_TRAITS];

          const formatFoundryTrait = (traitStr) => {
             if (typeof traitStr !== 'string') return traitStr;
             const lowerStr = traitStr.toLowerCase();
             
             // 1. Exact match checking
             const exactMatch = KNOWN_TRAITS.find(t => t.toLowerCase() === lowerStr);
             if (exactMatch) return exactMatch;
             
             // 2. Extrapolate compound values (reach-20)
             let bestMatch = null;
             for (const kt of KNOWN_TRAITS) {
                 const lowerKt = kt.toLowerCase();
                 if (lowerStr.startsWith(lowerKt + '-')) {
                     if (!bestMatch || kt.length > bestMatch.length) {
                         bestMatch = kt;
                     }
                 }
             }
             
             if (bestMatch) {
                const valueStr = traitStr.substring(bestMatch.length + 1).trim();
                if (DISTANCE_TRAITS.includes(bestMatch.toLowerCase())) {
                   return `${bestMatch} ${valueStr} ft`;
                }
                return `${bestMatch} ${valueStr}`;
             }
             
             // 3. Fallback to basic capitalize mapping
             if (traitStr.includes('-')) {
                const firstHyphen = traitStr.indexOf('-');
                const namePart = traitStr.substring(0, firstHyphen);
                const valuePart = traitStr.substring(firstHyphen + 1).trim();
                const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                
                if (DISTANCE_TRAITS.includes(namePart.toLowerCase())) {
                   return `${capitalizedName} ${valuePart} ft`;
                }
                return `${capitalizedName} ${valuePart}`;
             } else {
                return traitStr.charAt(0).toUpperCase() + traitStr.slice(1);
             }
          };

          // Universal Relational Graph Parser
          const extractRelationships = (data) => {
             const rels = { effects: [], feats: [], spells: [], other: [] };
             if (!data) return rels;
             
             const addRel = (uuid, providedLabel) => {
                 if (!uuid) return;
                 const path = uuid.toLowerCase();

                 let label = providedLabel;
                 if (!label) {
                     // Try to guess a readable alias if raw UUID
                     const parts = uuid.split('.');
                     label = parts.pop();
                     if (label.length >= 16 && !label.includes('-') && parts.length > 0) {
                         label = parts.pop();
                     }
                     label = label.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                 }

                 const payload = { uuid, label };

                 if (path.includes('effect') || path.includes('stance')) rels.effects.push(payload);
                 else if (path.includes('feat') || path.includes('feature')) rels.feats.push(payload);
                 else if (path.includes('spell')) rels.spells.push(payload);
                 else rels.other.push(payload);
             };

             const rules = data.system?.rules || [];
             rules.forEach(rule => {
                if (rule.key === 'GrantItem') addRel(rule.uuid, `Effect: ${data.name}`);
             });

             const itemGrants = data.flags?.pf2e?.itemGrants || {};
             Object.values(itemGrants).forEach(grant => {
                if (grant.id) addRel(grant.id, `Effect: ${data.name}`);
             });

             const desc = data.system?.description?.value || "";
             const matches = Array.from(desc.matchAll(/@(?:UUID|Compendium|Item)\[([^\]]+)\](?:{([^}]+)})?/gi));
             matches.forEach(match => {
                if (!match[1].toLowerCase().includes('condition')) {
                   addRel(match[1], match[2] || undefined);
                }
             });

             // Deduplicate by UUID
             const dedupe = (arr) => {
                const seen = new Set();
                return arr.filter(item => {
                   if (seen.has(item.uuid)) return false;
                   seen.add(item.uuid);
                   return true;
                });
             };

             rels.effects = dedupe(rels.effects);
             rels.feats = dedupe(rels.feats);
             rels.spells = dedupe(rels.spells);
             rels.other = dedupe(rels.other);
             
             return rels;
          };

          // Extract basic attacks from the items array
          const extractAttacks = () => {
             const attacks = [];
             if (Array.isArray(rawData.items)) {
                rawData.items.filter(i => i.type === 'melee' || i.type === 'weapon').forEach(item => {
                   let numActions = "1";
                   if (item.system?.actions?.value) {
                      if (item.system.actions.value === "2") numActions = "2";
                      if (item.system.actions.value === "3") numActions = "3";
                   }

                   attacks.push({
                      weapon: item.name || "Unknown Attack",
                      bonus: item.system?.bonus?.value || 0,
                      damage: Object.values(item.system?.damageRolls || {}).map(d => `${d.damage} ${d.damageType}`).join(' + ') || "1d4",
                      type: (
                          item.system?.weaponType?.value === 'ranged' || 
                          item.system?.weaponCategory === 'ranged' ||
                          (item.system?.traits?.value || []).some(t => typeof t === 'string' && (t.toLowerCase() === 'ranged' || t.toLowerCase() === 'thrown' || t.toLowerCase().startsWith('range-')))
                      ) ? 'Ranged' : 'Melee',
                      traits: (item.system?.traits?.value || []).map(formatFoundryTrait),
                      causes: [],
                      action: numActions, 
                      description: item.system?.description?.value || "",
                      relationships: extractRelationships(item)
                   });
                });
             }
             return attacks;
          };

          // Categorize other payload types
          const extractInventory = () => {
             if (!Array.isArray(rawData.items)) return [];
             return rawData.items
                 .filter(i => ['equipment', 'consumable', 'armor', 'backpack'].includes(i.type))
                 .map(i => ({
                    name: i.name,
                    quantity: i.system?.quantity || 1,
                    description: i.system?.description?.value || "",
                    relationships: extractRelationships(i),
                    rawFoundryContext: i
                 }));
          };

          const extractActions = (isPassive = false) => {
             if (!Array.isArray(rawData.items)) return [];
             return rawData.items
                 .filter(i => i.type === 'action')
                 .filter(i => {
                    const passiveAction = i.system?.actionType?.value === 'passive';
                    return isPassive ? passiveAction : !passiveAction;
                 })
                 .map(i => ({
                    name: i.name,
                    description: i.system?.description?.value || "",
                    actionCost: i.system?.actions?.value || "1",
                    relationships: extractRelationships(i),
                    rawFoundryContext: i
                 }));
          };

          const extractSpellcasting = () => {
             if (!Array.isArray(rawData.items)) return [];
             const groups = [];
             
             // 1. Find all casting blocks
             const entries = rawData.items.filter(i => i.type === 'spellcastingEntry');
             const spells = rawData.items.filter(i => i.type === 'spell');

             entries.forEach(entry => {
                 const entryId = entry._id;
                 const spellsByLevel = {};

                 // 2. Map all spells pointing to this block
                 spells.filter(s => s.system?.location?.value === entryId).forEach(spell => {
                     const level = spell.system?.level?.value || 0;
                     if (!spellsByLevel[level]) spellsByLevel[level] = { slots: 0, spells: [] };
                     
                     spellsByLevel[level].spells.push(spell.name);
                 });

                 groups.push({
                    tradition: entry.system?.tradition?.value || "Arcane",
                    type: entry.system?.prepared?.value || "Innate",
                    dc: entry.system?.spelldc?.dc || entry.system?.proficiency?.dc || 0,
                    attack: entry.system?.spelldc?.value || entry.system?.proficiency?.value || 0,
                    spellsByLevel: spellsByLevel,
                    relationships: extractRelationships(entry)
                 });
             });
             return groups;
          };

          const abilities = rawData.system?.abilities || {};
          const mappedModifiers = {};
          Object.keys(abilities).forEach(k => mappedModifiers[k] = abilities[k].mod || 0);

          const hpMax = rawData.system?.attributes?.hp?.max || rawData.system?.attributes?.hp?.value || 10;
          const spMax = rawData.system?.attributes?.sp?.max || rawData.system?.attributes?.sp?.value || 0;
          const resMax = rawData.system?.attributes?.resolve?.max || rawData.system?.attributes?.resolve?.value || 0;


          // Bucket Feats correctly
          const extractFeats = () => {
             if (!Array.isArray(rawData.items)) return { class: [], skill: [], ancestry: [], general: [] };
             const result = { class: [], skill: [], ancestry: [], general: [] };
             rawData.items.filter(i => i.type === 'feat').forEach(f => {
                const bucket = f.system?.category || 'general'; 
                if (!result[bucket]) result[bucket] = [];
                result[bucket].push(f);
             });
             return result;
          };

          // Extract Base Class / Ancestry Modules
          const extractBuild = () => {
             if (!Array.isArray(rawData.items)) return { ancestry: null, heritage: null, background: null, class: null };
             return {
                 ancestry: rawData.items.find(i => i.type === 'ancestry') || null,
                 heritage: rawData.items.find(i => i.type === 'heritage') || null,
                 background: rawData.items.find(i => i.type === 'background') || null,
                 class: rawData.items.find(i => i.type === 'class') || null
             };
          };

          let mappedEntity = {};

          if (['players', 'creatures'].includes(collectionTarget)) {
            // Push into strict DB Schema format verified natively for Combat Tracker Overlay
            mappedEntity = {
            name: rawData.name || file.name.replace('.json', ''),
            level: rawData.system?.details?.level?.value || 1,
            hp: { max: hpMax, current: hpMax },
            sp: { max: spMax, current: spMax },
            resolve: { max: resMax, current: resMax },
            ac: getAC(),
            saves: {
               fortitude: getSave('fortitude'),
               reflex: getSave('reflex'),
               will: getSave('will')
            },
            perception: rawData.system?.perception?.mod || rawData.system?.attributes?.perception?.value || 0,
            senses: getSenses(),
            speeds: getSpeeds(),
            languages: (rawData.system?.details?.languages?.value || []).map(l => typeof l === 'string' ? l.charAt(0).toUpperCase() + l.slice(1) : l),
            attributes: mappedModifiers,
            modifiers: mappedModifiers,
            abilities: mappedModifiers,
            skills: getSkills(),
            attacks: extractAttacks(),
            actions: extractActions(false),
            passives: extractActions(true),
            items: extractInventory(),
            spellcasting: extractSpellcasting(),
            feats: extractFeats(),
            build: extractBuild(),
            effects: Array.isArray(rawData.items) ? rawData.items.filter(i => i.type === 'effect') : [],
            traits: (() => {
               const baseTraits = (rawData.system?.traits?.value || []).map(formatFoundryTrait);
               const rawSize = rawData.system?.traits?.size?.value;
               if (!rawSize) return baseTraits;
               const SIZE_MAP = { tiny: 'Tiny', sm: 'Small', med: 'Medium', lg: 'Large', huge: 'Huge', grg: 'Gargantuan' };
               const expandedSize = SIZE_MAP[rawSize.toLowerCase()] || rawSize.charAt(0).toUpperCase() + rawSize.slice(1);
               return [expandedSize, ...baseTraits];
            })(),
            type: rawData.type || collectionTarget.replace(/s$/, ''),
            rawFoundryContext: rawData
          };
        } else {
            // Generalized Importer for Global Compendiums (Feats, Effects, Classes) -> Powers Character Builder
            mappedEntity = {
                name: rawData.name || file.name.replace('.json', ''),
                type: rawData.type || collectionTarget.replace(/s$/, ''),
                description: rawData.system?.description?.value || "",
                level: rawData.system?.level?.value || 1,
                traits: (rawData.system?.traits?.value || []).map(formatFoundryTrait),
                relationships: extractRelationships(rawData),
                rawFoundryContext: rawData
            };
        }

          const existingEntity = currentDataset.find(e => 
             (rawData._id && e.rawFoundryContext?._id === rawData._id) || 
             e.name === mappedEntity.name
          );

          if (existingEntity) {
             await updateEntity(collectionTarget, existingEntity.id, mappedEntity);
             updateCount++;
          } else {
             await createEntity(collectionTarget, mappedEntity);
             createCount++;
          }

        } catch (fileErr) {
          if (errorCount === 0) {
             addLog(`Crit ERR on ${file.name}: ${fileErr.message}`);
             console.error(fileErr);
          }
          errorCount++;
        }
      }

      addLog(`Sync Complete: ${createCount} new created, ${updateCount} updated, ${skipCount} natively skipped over invalid type, ${errorCount} formally failed.`);
    } catch (err) {
      addLog(`ERR: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Dim Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2E181B] to-[#0D1216] border border-primary/30 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Ribbon */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent w-full opacity-50 block relative z-10" />

        {/* Header Content */}
        <div className="p-4 flex items-center justify-between border-b border-primary/20 bg-black/20">
          <h2 className="text-primary font-headline tracking-widest text-lg ml-2 drop-shadow-[0_0_8px_rgba(87,230,239,0.3)] select-none">
            SYSTEM CONFIGURATION
          </h2>
          <div onClick={onClose}>
            <NavigationIcon icon="close" />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar relative z-10">
          
          <section className="flex flex-col gap-4">
            <div>
              <h3>Foundry GitHub Sync</h3>
              <p className="text-xs text-outline-variant font-body mb-4">
                Synchronize external Compendium JSON structures directly into the Firebase Cloud environment. Use a Personal Access Token (PAT) for private repositories or to bypass rate-limiting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Repo */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-primary/70 uppercase font-headline tracking-widest">GitHub Repository</label>
                <input 
                  type="text" 
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="bg-black/50 border border-primary/30 rounded px-3 py-2 text-primary font-code text-xs outline-none focus:border-primary focus:bg-primary/5 transition-all"
                  placeholder="e.g. foundryvtt/pf2e"
                />
              </div>

              {/* Path */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-primary/70 uppercase font-headline tracking-widest">Directory Path</label>
                <input 
                  type="text" 
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="bg-black/50 border border-primary/30 rounded px-3 py-2 text-primary font-code text-xs outline-none focus:border-primary focus:bg-primary/5 transition-all"
                  placeholder="e.g. packs/sf2e"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Token */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-primary/70 uppercase font-headline tracking-widest flex justify-between">
                  <span>GitHub PAT Token</span>
                  <span className="text-outline-variant">(Optional)</span>
                </label>
                <input 
                  type="password" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-black/50 border border-primary/30 rounded px-3 py-2 text-primary font-code text-xs outline-none focus:border-primary focus:bg-primary/5 transition-all"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </div>

              {/* Target Collection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-primary/70 uppercase font-headline tracking-widest">Target Database Collection</label>
                <select 
                  value={collectionTarget}
                  onChange={(e) => setCollectionTarget(e.target.value)}
                  className="bg-black/50 border border-primary/30 rounded px-3 py-2 text-primary font-code text-xs outline-none focus:border-primary focus:bg-primary/5 transition-all appearance-none cursor-pointer"
                >
                  <option value="creatures">Creatures</option>
                  <option value="players">Players</option>
                  <option value="items">Items</option>
                  <option value="spells">Spells</option>
                  <option value="feats">Feats</option>
                  <option value="classes">Classes</option>
                  <option value="ancestries">Ancestries</option>
                  <option value="backgrounds">Backgrounds</option>
                  <option value="heritages">Heritages</option>
                  <option value="actions">Actions</option>
                  <option value="effects">Effects</option>
                </select>
              </div>
            </div>

            {/* Sync Button */}
            <div className="mt-2">
               <button 
                onClick={handleSync}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 bg-black/40 border border-secondary text-secondary font-headline uppercase tracking-widest text-sm py-3 rounded hover:bg-secondary/10 hover:[box-shadow:0_0_15px_rgba(239,87,78,0.2)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    Synchronizing Pipeline...
                  </>
                ) : (
                  <>
                     <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                    Execute Import Sequence
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Sync Console */}
          <section className="flex flex-col gap-2 mt-4 border-t border-primary/10 pt-6">
            <h3>Diagnostic Console</h3>
            <div className="bg-black/60 border border-primary/20 rounded p-4 h-48 overflow-y-auto font-code text-xs text-outline-variant flex flex-col gap-1">
              {log.length === 0 ? (
                 <div className="text-outline-variant/40 italic">Awaiting sync execution...</div>
              ) : (
                log.map((line, i) => (
                  <div key={i} className={line.includes('ERR') ? 'text-secondary' : line.includes('Complete') ? 'text-primary' : ''}>
                    &gt; {line}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="flex flex-col gap-4 mt-4 border-t border-secondary/30 pt-6">
            <h3 className="text-secondary [text-shadow:0_0_10px_rgba(239,87,78,0.5)]">Data Management (Danger Zone)</h3>
            <p className="text-xs text-outline-variant leading-relaxed">
              These commands execute permanent destructive workflows against the local database infrastructure. Proceed selectively. System validations will request confirmation.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button 
                onClick={() => handleClearCollection('creatures', creatures || [], 'Creatures & NPCs')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Creatures
              </button>
              
              <button 
                onClick={() => handleClearCollection('items', items || [], 'Items & Gear')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Items
              </button>
              
              <button 
                onClick={() => handleClearCollection('players', players || [], 'Players')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Players
              </button>
              
              <button 
                onClick={() => handleClearCollection('encounters', encounters || [], 'Encounters')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Encounters
              </button>
              
              <button 
                onClick={() => handleClearCollection('spells', spells || [], 'Spells')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Spells
              </button>
              
              <button 
                onClick={() => handleClearCollection('feats', feats || [], 'Feats')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Feats
              </button>
              
              <button 
                onClick={() => handleClearCollection('classes', classes || [], 'Classes')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Classes
              </button>
              
              <button 
                onClick={() => handleClearCollection('ancestries', ancestries || [], 'Ancestries')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Ancestries
              </button>
              
              <button 
                onClick={() => handleClearCollection('backgrounds', backgrounds || [], 'Backgrounds')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Backgrounds
              </button>
              
              <button 
                onClick={() => handleClearCollection('heritages', heritages || [], 'Heritages')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Heritages
              </button>

              <button 
                onClick={() => handleClearCollection('actions', actions || [], 'Actions')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Actions
              </button>

              <button 
                onClick={() => handleClearCollection('effects', effects || [], 'Effects')}
                className="w-full flex items-center justify-center bg-[#12111A] border-2 border-primary text-primary px-3 py-2 rounded font-headline tracking-widest text-[12px] uppercase transition-all hover:bg-primary/10 hover:[box-shadow:0_0_15px_rgba(87,230,239,0.3)] cursor-pointer"
              >
                Clear Effects
              </button>
            </div>
          </section>

        </div>
        
      </div>
    </div>
  );
}
