import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

const popularChallenges = [
  {
    name: "75 Soft Challenge",
    description: "A more sustainable version of 75 Hard. Build healthy habits without extreme restrictions.",
    category: "Wellness",
    frequency: "daily",
    duration: 75,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 2,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "45-minute workout", description: "Any type of exercise, indoor or outdoor", order: 1 },
      { id: "2", title: "Eat well and drink 3L water", description: "Focus on whole foods and hydration", order: 2 },
      { id: "3", title: "Read 10 pages", description: "Non-fiction or self-development book", order: 3 },
      { id: "4", title: "No alcohol", description: "Stay alcohol-free for 75 days", order: 4 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "75 Hard Challenge",
    description: "The original 75 Hard mental toughness program. No exceptions, no substitutions.",
    category: "Fitness",
    frequency: "daily",
    duration: 75,
    requirePhotoProof: true,
    allowGraceSkips: false,
    graceSkipsPerWeek: 0,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "Two 45-minute workouts", description: "One must be outdoors, no matter the weather", order: 1 },
      { id: "2", title: "Follow a diet", description: "Any diet of your choice, no cheat meals or alcohol", order: 2 },
      { id: "3", title: "Drink 1 gallon of water", description: "Track your water intake daily", order: 3 },
      { id: "4", title: "Read 10 pages of non-fiction", description: "Personal development or educational", order: 4 },
      { id: "5", title: "Take a progress photo", description: "Daily progress tracking", order: 5 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Consistency 50 Challenge",
    description: "Build lasting habits through 50 days of consistency. Focus on daily progress.",
    category: "Habits",
    frequency: "daily",
    duration: 50,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "30-minute activity", description: "Exercise, yoga, or active movement", order: 1 },
      { id: "2", title: "Healthy meal prep", description: "Prepare at least one nutritious meal", order: 2 },
      { id: "3", title: "10 minutes meditation", description: "Practice mindfulness or breathing exercises", order: 3 },
      { id: "4", title: "Journal 5 minutes", description: "Reflect on your day and progress", order: 4 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "30-Day Reading Challenge",
    description: "Develop a consistent reading habit. Read every day for 30 days straight.",
    category: "Personal Development",
    frequency: "daily",
    duration: 30,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "Read for 20 minutes", description: "Any book of your choice", order: 1 },
      { id: "2", title: "Take notes", description: "Write down key insights or quotes", order: 2 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Hydration Challenge",
    description: "Build a water-drinking habit. Track your daily water intake for 21 days.",
    category: "Health",
    frequency: "daily",
    duration: 21,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "Drink 8 glasses of water", description: "Approximately 2 liters throughout the day", order: 1 },
      { id: "2", title: "Track your intake", description: "Log each glass consumed", order: 2 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Morning Routine Mastery",
    description: "Establish a powerful morning routine. Wake up early and start your day right for 30 days.",
    category: "Productivity",
    frequency: "daily",
    duration: 30,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "Wake up by 6 AM", description: "Start your day early", order: 1 },
      { id: "2", title: "5-minute stretch", description: "Gentle morning stretches", order: 2 },
      { id: "3", title: "Healthy breakfast", description: "Eat a nutritious morning meal", order: 3 },
      { id: "4", title: "Plan your day", description: "Review your goals and schedule", order: 4 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "No Social Media Challenge",
    description: "Take a break from social media and reclaim your time for 14 days.",
    category: "Digital Detox",
    frequency: "daily",
    duration: 14,
    requirePhotoProof: false,
    allowGraceSkips: false,
    graceSkipsPerWeek: 0,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "No social media apps", description: "Stay off Instagram, Facebook, Twitter, TikTok", order: 1 },
      { id: "2", title: "Track time saved", description: "Log what you did with the extra time", order: 2 },
      { id: "3", title: "Engage in real activities", description: "Read, exercise, socialize in person", order: 3 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Gratitude Journal Challenge",
    description: "Cultivate gratitude and positivity. Write daily gratitude entries for 30 days.",
    category: "Mindfulness",
    frequency: "daily",
    duration: 30,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isTemplate: true,
    isPublic: true,
    tasks: [
      { id: "1", title: "Write 3 things you're grateful for", description: "Reflect on positive aspects of your day", order: 1 },
      { id: "2", title: "Express one gratitude", description: "Tell someone you appreciate them", order: 2 }
    ],
    collaborators: [],
    stats: { totalUsers: 0, activeUsers: 0, completionRate: 0, avgSuccessRate: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedChallenges() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const challengesCollection = db.collection('challenges');
    
    // Check if challenges already exist
    const existingCount = await challengesCollection.countDocuments({ isTemplate: true });
    
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} template challenges already exist`);
      console.log('Skipping seed. Delete existing templates first if you want to re-seed.');
      return;
    }
    
    // Insert popular challenges
    const result = await challengesCollection.insertMany(popularChallenges);
    
    console.log(`✅ Successfully seeded ${result.insertedCount} popular challenges!`);
    console.log('\nChallenges added:');
    popularChallenges.forEach((challenge, index) => {
      console.log(`  ${index + 1}. ${challenge.name} (${challenge.duration} days, ${challenge.tasks.length} tasks)`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding challenges:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seed function
seedChallenges()
  .then(() => {
    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
