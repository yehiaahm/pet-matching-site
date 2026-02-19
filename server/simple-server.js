/**
 * Simple GPS Server - No dependencies required
 */

const http = require('http');
const url = require('url');

const PORT = 5000;

// Mock pet database with GPS coordinates
const pets = [
  {
    id: 'pet-1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    latitude: 30.0444,
    longitude: 31.2357,
    owner: { name: 'Ahmed Mohamed', rating: 4.8, verified: true },
    images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24'],
    description: 'Purebred Golden Retriever, fully vaccinated.',
    verified: true
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'female',
    latitude: 30.0626,
    longitude: 31.2497,
    owner: { name: 'Sarah Johnson', rating: 4.9, verified: true },
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d'],
    description: 'Beautiful Golden Retriever with champion bloodline.',
    verified: true
  }
];

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// AI Matching
function calculateMatch(userPet, candidatePet, userLat, userLon) {
  const distance = calculateDistance(userLat, userLon, candidatePet.latitude, candidatePet.longitude);
  
  const breedScore = userPet.breed.toLowerCase() === candidatePet.breed.toLowerCase() ? 100 : 30;
  const ageScore = Math.abs(userPet.age - candidatePet.age) <= 2 ? 90 : 60;
  const genderScore = userPet.gender !== candidatePet.gender ? 100 : 50;
  const locationScore = distance <= 10 ? 90 : distance <= 25 ? 70 : 40;
  
  const totalScore = Math.round(
    breedScore * 0.3 + ageScore * 0.2 + genderScore * 0.2 + locationScore * 0.3
  );
  
  return {
    pet: candidatePet,
    distance: Math.round(distance * 10) / 10,
    matchScore: Math.min(100, Math.max(0, totalScore)),
    matchReason: `${breedScore === 100 ? 'Same breed' : 'Different breed'}, ${Math.round(distance)}km away`
  };
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Health check
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'GPS Server running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Analytics
  if (path === '/api/analytics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        totalPets: pets.length,
        averageDistance: 8.5,
        nearbyMatches: 2,
        successRate: 87,
        lastUpdated: new Date().toISOString()
      }
    }));
    return;
  }

  // AI Matching
  if (path === '/api/ai/matches' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { userPet, userLatitude, userLongitude, maxDistance = 25, limit = 10 } = JSON.parse(body);
        
        const matches = pets
          .filter(p => p.id !== userPet.id)
          .map(p => calculateMatch(userPet, p, userLatitude, userLongitude))
          .filter(m => m.distance <= maxDistance)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, limit);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: { matches, searchParams: { userLocation: { latitude: userLatitude, longitude: userLongitude }, maxDistance, totalCandidates: pets.length - 1, qualifiedMatches: matches.length } }
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 GPS Server running on http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Matching: http://localhost:${PORT}/api/ai/matches`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
});
