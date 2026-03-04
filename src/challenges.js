// Challenges & Exercises Module for CodeForge
// Built-in coding problems with hidden test cases and auto-checking

import { showToast } from './toast.js';
import { ALL_CHALLENGES, getChallengesByLevel, getChallengeCount, getSolution } from './challengesData.js';

// Re-export everything needed
export const CHALLENGES = ALL_CHALLENGES;
export { getChallengesByLevel, getChallengeCount, getSolution };

// Challenge progress tracking
const PROGRESS_KEY = 'codeforge_challenge_progress';

function getProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch { return {}; }
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function markChallengeCompleted(challengeId) {
    const progress = getProgress();
    progress[challengeId] = { completed: true, completedAt: Date.now() };
    saveProgress(progress);
}

export function isChallengeCompleted(challengeId) {
    return getProgress()[challengeId]?.completed || false;
}

export function getCompletedCount() {
    return Object.values(getProgress()).filter(p => p.completed).length;
}

export function checkChallengeOutput(challengeId, actualOutput) {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { passed: false, message: 'Challenge not found' };

    const normalizedActual = actualOutput.trim().replace(/\r\n/g, '\n');

    for (const test of challenge.tests) {
        const normalizedExpected = test.expectedOutput.trim().replace(/\r\n/g, '\n');
        if (normalizedActual === normalizedExpected) {
            markChallengeCompleted(challengeId);
            return { passed: true, message: '✅ All tests passed! Great job!' };
        }
    }

    return {
        passed: false,
        message: `❌ Output doesn't match expected result.\n\nExpected:\n${challenge.tests[0].expectedOutput}\n\nGot:\n${actualOutput.trim()}`,
    };
}

export function getChallengesByDifficulty(difficulty) {
    return CHALLENGES.filter(c => c.difficulty === difficulty);
}

export function getChallengesByCategory(category) {
    return CHALLENGES.filter(c => c.category === category);
}
