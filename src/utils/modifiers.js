import { CONDITIONS } from '../data/conditions';

/**
 * Given a base stat value, the entity, and the active conditions array,
 * calculates the net modifier by safely non-stacking bonuses/penalties
 * of the same type across relevant targets.
 */
export function getModifiedStat(baseValue, entity, activeConditions = [], targetKeys = []) {
    let totalMod = 0;
    const causes = [];
    
    const combinedRaw = [];
    activeConditions.forEach(cond => {
        const def = CONDITIONS[cond.name];
        if (!def) return;
        
        def.modifiers.forEach(modDef => {
            if (targetKeys.includes(modDef.target)) {
                const val = modDef.valueFn(cond.value || 0, entity);
                if (val !== 0) {
                    combinedRaw.push({ 
                        type: modDef.type, 
                        value: val, 
                        source: cond.hasValue ? `${cond.name} ${cond.value}` : cond.name 
                    });
                }
            }
        });
    });

    const types = {};
    combinedRaw.forEach(m => {
        if (!types[m.type]) types[m.type] = [];
        types[m.type].push(m);
    });

    Object.keys(types).forEach(type => {
        if (type === 'raw') {
            types[type].forEach(m => {
                totalMod += m.value;
                if (!causes.includes(m.source)) causes.push(m.source);
            });
        } else {
            // Find worst penalty
            let worstPenalty = 0;
            let worstCause = null;
            types[type].forEach(m => {
                if (m.value < worstPenalty) { 
                    worstPenalty = m.value; 
                    worstCause = m.source; 
                }
            });
            if (worstPenalty < 0) {
                totalMod += worstPenalty;
                if (!causes.includes(worstCause)) causes.push(worstCause);
            }
        }
    });

    return {
        final: baseValue + totalMod,
        delta: totalMod,
        causes: causes
    };
}
