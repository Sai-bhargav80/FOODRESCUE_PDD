/**
 * Mock data for offline / demo mode.
 * Used when the FastAPI backend is unreachable.
 */

export const MOCK_LISTINGS = [
  {
    id: 1,
    title: '50 Servings of Wedding Buffet Surplus',
    description: 'Freshly cooked vegetable biryani, enough for 50 people. Hygienic packaging.',
    category: 'Veg',
    quantity: '50 portions',
    location: 'Hitech City, Hyderabad',
    expiryTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    postedBy: 1, // donor test account
    claimedBy: null,
    status: 'Available',
    priorityScore: 75,
    priorityLevel: 'High',
    carbonSaved: 3.2,
    estimatedMeals: 50,
  },
  {
    id: 2,
    title: 'Restaurant Surplus: Chicken Curry',
    description: 'Good for 20 people. Pick up before 8 PM.',
    category: 'Non-Veg',
    quantity: '20 portions',
    location: 'Banjara Hills, Hyderabad',
    expiryTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=600&auto=format&fit=crop',
    postedBy: 1, // donor test account
    claimedBy: 3, // volunteer
    status: 'Claimed',
    priorityScore: 90,
    priorityLevel: 'High',
    carbonSaved: 4.1,
    estimatedMeals: 20,
  },
  {
    id: 3,
    title: 'Fresh Artisan Sourdough Breads',
    description: 'Bakery surplus — 10 loaves of sourdough bread. No preservatives.',
    category: 'Bakery',
    quantity: '10 loaves',
    location: 'Jubilee Hills, Hyderabad',
    expiryTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    postedBy: 1, // donor test account
    claimedBy: 2, // NGO
    status: 'Completed',
    priorityScore: 45,
    priorityLevel: 'Low',
    carbonSaved: 1.8,
    estimatedMeals: 10,
  },
  {
    id: 4,
    title: 'Mixed Fruit Basket',
    description: 'Ripe fruits from supermarket surplus. Great for 25 people.',
    category: 'Fruits',
    quantity: '5 kg',
    location: 'Gachibowli, Hyderabad',
    expiryTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop',
    postedBy: 99,
    claimedBy: null,
    status: 'Available',
    priorityScore: 30,
    priorityLevel: 'Low',
    carbonSaved: 2.5,
    estimatedMeals: 25,
  },
  {
    id: 5,
    title: 'Dal Makhani + Rice',
    description: 'Wedding surplus — 30 portions of dal makhani with steamed rice.',
    category: 'Veg',
    quantity: '30 portions',
    location: 'Madhapur, Hyderabad',
    expiryTime: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    postedBy: 2, // NGO test account
    claimedBy: null,
    status: 'Available',
    priorityScore: 95,
    priorityLevel: 'High',
    carbonSaved: 5.6,
    estimatedMeals: 30,
  },
];

export const MOCK_COMMUNITY_STATS = {
  totalMealsSaved: 12847,
  totalVolunteers: 342,
  totalCarbonSaved: 8492,
  activeDonors: 189,
};
