const xpMap = { "-4": 10, "-3": 15, "-2": 20, "-1": 30, "0": 40, "1": 60, "2": 80, "3": 120, "4": 160 };

function getCreatureXP_Listing(partyLvl, critLvl) {
    const diff = critLvl - partyLvl;
    return xpMap[diff.toString()] || (diff > 4 ? 320 : 0);
}

function getCreatureXP_Detail(cLevel, pLevel) {
    const diff = cLevel - pLevel;
    if (diff <= -4) return 10;
    if (diff === -3) return 15;
    if (diff === -2) return 20;
    if (diff === -1) return 30;
    if (diff === 0) return 40;
    if (diff === 1) return 60;
    if (diff === 2) return 80;
    if (diff === 3) return 120;
    if (diff >= 4) return 160;
    return 0;
}

console.log("Listing:", getCreatureXP_Listing(1, 1));
console.log("Detail :", getCreatureXP_Detail(1, 1));
console.log("Listing:", getCreatureXP_Listing("1", "1"));
console.log("Detail :", getCreatureXP_Detail("1", "1"));
console.log("Listing:", getCreatureXP_Listing(3, 1));
console.log("Detail :", getCreatureXP_Detail(1, 3));
