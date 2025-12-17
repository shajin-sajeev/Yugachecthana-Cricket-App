
import { PointsRule, Player } from '../types';

// Default Rules if none are configured
export const DEFAULT_RULES: PointsRule[] = [
    { id: '1', category: 'BATTING', event: 'Run scored', points: 1, isActive: true },
    { id: '2', category: 'BATTING', event: 'Boundary (4)', points: 1, isActive: true },
    { id: '3', category: 'BATTING', event: 'Six (6)', points: 2, isActive: true },
    { id: '4', category: 'BATTING', event: 'Half-century (50)', points: 10, isActive: true },
    { id: '5', category: 'BATTING', event: 'Duck', points: -5, isActive: true },
    { id: '6', category: 'BOWLING', event: 'Wicket', points: 20, isActive: true },
    { id: '7', category: 'BOWLING', event: 'Maiden Over', points: 10, isActive: true },
    { id: '9', category: 'FIELDING', event: 'Catch', points: 10, isActive: true },
];

export const getActiveRules = (): PointsRule[] => {
    const saved = localStorage.getItem('yugachethana_points_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
};

export const calculateBattingPoints = (runs: number, balls: number, isBoundary: boolean, isSix: boolean): number => {
    const rules = getActiveRules();
    let points = 0;

    // Base Run Points
    const runRule = rules.find(r => r.event === 'Run scored' && r.isActive);
    if (runRule) points += runs * runRule.points;

    // Boundary Bonus
    if (isBoundary && !isSix) {
        const fourRule = rules.find(r => r.event === 'Boundary (4)' && r.isActive);
        if (fourRule) points += fourRule.points;
    }

    // Six Bonus
    if (isSix) {
        const sixRule = rules.find(r => r.event === 'Six (6)' && r.isActive);
        if (sixRule) points += sixRule.points;
    }

    // Milestones (This usually runs at end of innings, but simplified here)
    // Note: To handle milestones correctly, we need the total score, not just the delta.
    
    return points;
};

export const calculateBowlingPoints = (isWicket: boolean, isMaiden: boolean): number => {
    const rules = getActiveRules();
    let points = 0;

    if (isWicket) {
        const wktRule = rules.find(r => r.event === 'Wicket' && r.isActive);
        if (wktRule) points += wktRule.points;
    }

    if (isMaiden) {
        const maidenRule = rules.find(r => r.event === 'Maiden Over' && r.isActive);
        if (maidenRule) points += maidenRule.points;
    }

    return points;
};

export const checkMilestonePoints = (totalRuns: number): number => {
    const rules = getActiveRules();
    let points = 0;
    
    // Check 50
    if (totalRuns === 50) {
        const fiftyRule = rules.find(r => r.event.includes('50') && r.isActive);
        if (fiftyRule) points += fiftyRule.points;
    }
    
    // Check 100
    if (totalRuns === 100) {
        const hundredRule = rules.find(r => r.event.includes('100') && r.isActive);
        if (hundredRule) points += hundredRule.points;
    }

    return points;
};
