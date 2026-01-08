
/**
 * Speech Training Dictionary
 * Categorized by phonetic complexity for progressive recovery
 */

export const SPEECH_DICTIONARY = {
    SIMPLE: [
        "Apple", "Banana", "Cat", "Dog", "Egg", "Fish", "Goat", "Hat", "Ice", "Jar",
        "Kite", "Lamp", "Moon", "Nest", "Owl", "Pen", "Queen", "Rain", "Sun", "Tree",
        "Up", "Van", "Web", "Box", "Yacht", "Zebra", "Blue", "Red", "Green", "Big",
        "Small", "Fast", "Slow", "Happy", "Sad", "Smile", "Laugh", "Jump", "Run", "Walk"
    ],
    MEDIUM: [
        "Balance", "Camera", "Garden", "Hammer", "Island", "Jacket", "Kitchen", "Laptop", "Mountain", "Napkin",
        "Orange", "Pencil", "Rocket", "Silver", "Ticket", "Umbrella", "Village", "Window", "Yellow", "Zipper",
        "Therapy", "Doctor", "Patient", "Health", "Medicine", "Clinic", "Recover", "Strong", "Gentle", "Breath",
        "Morning", "Evening", "Dinner", "Coffee", "Water", "Nature", "Comfort", "Focus", "Vision", "Safety"
    ],
    COMPLEX: [
        "Articulation", "Biomechanics", "Consistency", "Diagnosis", "Equilibrium", "Fluctuation", "Generalization", "Hierarchy", "Independence", "Jurisdiction",
        "Kinesthetic", "Linguistic", "Maintenance", "Neurological", "Observation", "Phonological", "Qualitative", "Rehabilitation", "Stabilization", "Terminology",
        "Understanding", "Vocabulary", "Wellness", "Xylophone", "Yesterday", "Zookeeping", "Resonance", "Precision", "Mechanism", "Integration"
    ],
    MEDICAL: [
        "Neuroplasticity", "Cognitive", "Coordination", "Dexterity", "Sensation", "Proprioception", "Synapse", "Dopamine", "Motor", "Sensory",
        "Clinical", "Assistance", "Evaluation", "Assessment", "Protocol", "Telemetry", "Amplitude", "Frequency", "Precision", "Synthesis"
    ]
};

/**
 * Returns a random word from the dictionary.
 */
export const getRandomWord = (difficulty: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'MEDICAL' = 'MEDIUM') => {
    const list = SPEECH_DICTIONARY[difficulty];
    return list[Math.floor(Math.random() * list.length)];
};

/**
 * Returns exactly 10 words for a daily session.
 * Uses a seed based on the date to ensure the "Words of the Day" are consistent for a given user.
 */
export const getDailyWords = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const allWords = [...SPEECH_DICTIONARY.SIMPLE, ...SPEECH_DICTIONARY.MEDIUM, ...SPEECH_DICTIONARY.MEDICAL];

    // Simple deterministic shuffle based on date string
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);

    const shuffled = [...allWords].sort((a, b) => {
        const s1 = (seed * a.length) % 100;
        const s2 = (seed * b.length) % 100;
        return s1 - s2;
    });

    return shuffled.slice(0, 10);
};

/**
 * Tracks daily completion in localStorage
 */
export const getDailyProgress = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`ns_speech_progress_${dateStr}`);
    return saved ? parseInt(saved) : 0;
};

export const updateDailyProgress = (count: number) => {
    const dateStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`ns_speech_progress_${dateStr}`, count.toString());
};
