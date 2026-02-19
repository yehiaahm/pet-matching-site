/**
 * Pet Breeding Matchmaking Algorithm
 * 
 * Calculates compatibility scores based on:
 * - Species compatibility
 * - Breed matching
 * - Gender compatibility
 * - Age range compatibility
 * - Health status
 * - Location proximity
 */

/**
 * Weight configuration for matching criteria
 * Total weight = 100
 */
const MATCH_WEIGHTS = {
  species: 20,        // Must be same species
  breed: 15,          // Breed compatibility
  gender: 15,         // Gender must be opposite
  age: 20,            // Age range should be compatible (2-8 years difference acceptable)
  health: 20,         // Health records and certifications
  location: 10,       // Proximity bonus
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of location 1
 * @param {number} lon1 - Longitude of location 1
 * @param {number} lat2 - Latitude of location 2
 * @param {number} lon2 - Longitude of location 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate species compatibility score
 * @param {string} species1 - Species of first pet
 * @param {string} species2 - Species of second pet
 * @returns {number} Score 0-100
 */
function calculateSpeciesScore(species1, species2) {
  if (species1.toLowerCase() === species2.toLowerCase()) {
    return 100;
  }
  return 0; // Different species = no match
}

/**
 * Calculate breed compatibility score
 * @param {string} breed1 - Breed of first pet
 * @param {string} breed2 - Breed of second pet
 * @returns {number} Score 0-100
 */
function calculateBreedScore(breed1, breed2) {
  if (!breed1 || !breed2) return 0;

  breed1 = breed1.toLowerCase();
  breed2 = breed2.toLowerCase();

  // Exact match
  if (breed1 === breed2) {
    return 100;
  }

  // Partial match (e.g., "Golden Retriever" and "Retriever")
  if (breed1.includes(breed2) || breed2.includes(breed1)) {
    return 75;
  }

  // Same breed type (e.g., both Retrievers)
  const type1 = breed1.split(' ')[0];
  const type2 = breed2.split(' ')[0];
  if (type1 === type2) {
    return 50;
  }

  return 0;
}

/**
 * Calculate gender compatibility score
 * @param {string} gender1 - Gender of first pet (MALE/FEMALE/UNKNOWN)
 * @param {string} gender2 - Gender of second pet
 * @returns {number} Score 0-100
 */
function calculateGenderScore(gender1, gender2) {
  // Opposite genders = perfect match
  if (
    (gender1 === 'MALE' && gender2 === 'FEMALE') ||
    (gender1 === 'FEMALE' && gender2 === 'MALE')
  ) {
    return 100;
  }

  // Unknown gender - possible match
  if (gender1 === 'UNKNOWN' || gender2 === 'UNKNOWN') {
    return 50;
  }

  // Same gender - no breeding compatibility
  return 0;
}

/**
 * Calculate age compatibility score
 * Considers age difference and reproductive viability
 * @param {number} age1 - Age of first pet (in years)
 * @param {number} age2 - Age of second pet (in years)
 * @returns {number} Score 0-100
 */
function calculateAgeScore(age1, age2) {
  // Minimum breeding age is 1-2 years depending on species
  const MIN_BREEDING_AGE = 1.5;
  const MAX_BREEDING_AGE = 12;

  // Check if both are in breeding age range
  if (age1 < MIN_BREEDING_AGE || age2 < MIN_BREEDING_AGE) {
    return 0; // Too young to breed
  }

  if (age1 > MAX_BREEDING_AGE || age2 > MAX_BREEDING_AGE) {
    return 20; // Can breed but reduced score for older animals
  }

  const ageDifference = Math.abs(age1 - age2);

  // Ideal age difference: 1-3 years
  if (ageDifference <= 1) {
    return 100; // Same age cohort
  } else if (ageDifference <= 3) {
    return 90;
  } else if (ageDifference <= 5) {
    return 70;
  } else if (ageDifference <= 8) {
    return 40;
  } else {
    return 10; // Too large age gap
  }
}

/**
 * Calculate health status score
 * Based on health records and certifications
 * @param {object} pet1 - First pet with health data
 * @param {object} pet2 - Second pet with health data
 * @returns {number} Score 0-100
 */
function calculateHealthScore(pet1, pet2) {
  let score = 50; // Base score

  // Check for health records
  const pet1HasHealthRecords =
    pet1.healthRecords && pet1.healthRecords.length > 0;
  const pet2HasHealthRecords =
    pet2.healthRecords && pet2.healthRecords.length > 0;

  if (pet1HasHealthRecords && pet2HasHealthRecords) {
    score += 20; // Both have health records
  } else if (pet1HasHealthRecords || pet2HasHealthRecords) {
    score += 10; // One has health records
  }

  // Check for genetic tests
  const pet1HasGeneticTests =
    pet1.geneticTests && pet1.geneticTests.length > 0;
  const pet2HasGeneticTests =
    pet2.geneticTests && pet2.geneticTests.length > 0;

  if (pet1HasGeneticTests && pet2HasGeneticTests) {
    score += 20; // Both have genetic tests
  } else if (pet1HasGeneticTests || pet2HasGeneticTests) {
    score += 10; // One has genetic tests
  }

  // Check for certifications
  const pet1HasCertifications =
    pet1.certifications && pet1.certifications.length > 0;
  const pet2HasCertifications =
    pet2.certifications && pet2.certifications.length > 0;

  if (pet1HasCertifications && pet2HasCertifications) {
    score += 10; // Both have certifications
  } else if (pet1HasCertifications || pet2HasCertifications) {
    score += 5; // One has certifications
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Calculate location proximity score
 * @param {object} location1 - First location {latitude, longitude}
 * @param {object} location2 - Second location {latitude, longitude}
 * @returns {number} Score 0-100
 */
function calculateLocationScore(location1, location2) {
  // If locations are not available, give neutral score
  if (
    !location1 ||
    !location2 ||
    !location1.latitude ||
    !location1.longitude ||
    !location2.latitude ||
    !location2.longitude
  ) {
    return 50; // Neutral score
  }

  const distance = calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );

  // Distance scoring:
  // 0-10 km: 100
  // 10-50 km: 80
  // 50-100 km: 60
  // 100-500 km: 40
  // 500+ km: 20

  if (distance <= 10) {
    return 100;
  } else if (distance <= 50) {
    return 80;
  } else if (distance <= 100) {
    return 60;
  } else if (distance <= 500) {
    return 40;
  } else {
    return 20;
  }
}

/**
 * Calculate overall matching score
 * @param {object} pet1 - First pet object
 * @param {object} pet2 - Second pet object
 * @returns {object} Match result with score and breakdown
 */
function calculateMatchScore(pet1, pet2) {
  // Calculate individual scores
  const speciesScore = calculateSpeciesScore(pet1.species, pet2.species);

  // If species doesn't match, no viable match
  if (speciesScore === 0) {
    return {
      score: 0,
      status: 'incompatible',
      reason: 'Different species',
      breakdown: {
        species: 0,
        breed: 0,
        gender: 0,
        age: 0,
        health: 0,
        location: 0,
      },
    };
  }

  const breedScore = calculateBreedScore(pet1.breed, pet2.breed);
  const genderScore = calculateGenderScore(pet1.gender, pet2.gender);
  const ageScore = calculateAgeScore(pet1.birthDate ? new Date().getFullYear() - new Date(pet1.birthDate).getFullYear() : 0, pet2.birthDate ? new Date().getFullYear() - new Date(pet2.birthDate).getFullYear() : 0);
  const healthScore = calculateHealthScore(pet1, pet2);
  
  const location1 = pet1.owner && {
    latitude: pet1.owner.latitude,
    longitude: pet1.owner.longitude,
  };
  const location2 = pet2.owner && {
    latitude: pet2.owner.latitude,
    longitude: pet2.owner.longitude,
  };
  const locationScore = calculateLocationScore(location1, location2);

  // If genders are incompatible, no viable match
  if (genderScore === 0) {
    return {
      score: 0,
      status: 'incompatible',
      reason: 'Same gender',
      breakdown: {
        species: speciesScore,
        breed: breedScore,
        gender: genderScore,
        age: ageScore,
        health: healthScore,
        location: locationScore,
      },
    };
  }

  // Calculate weighted score
  const weightedScore =
    (speciesScore * MATCH_WEIGHTS.species +
      breedScore * MATCH_WEIGHTS.breed +
      genderScore * MATCH_WEIGHTS.gender +
      ageScore * MATCH_WEIGHTS.age +
      healthScore * MATCH_WEIGHTS.health +
      locationScore * MATCH_WEIGHTS.location) /
    100;

  // Determine status
  let status = 'low';
  if (weightedScore >= 80) {
    status = 'excellent';
  } else if (weightedScore >= 65) {
    status = 'good';
  } else if (weightedScore >= 50) {
    status = 'fair';
  }

  return {
    score: Math.round(weightedScore),
    status,
    breakdown: {
      species: speciesScore,
      breed: breedScore,
      gender: genderScore,
      age: ageScore,
      health: healthScore,
      location: locationScore,
    },
  };
}

/**
 * Filter compatible matches
 * @param {object} userPet - User's pet
 * @param {array} candidatePets - Array of candidate pets to match against
 * @param {object} filters - Optional filter criteria
 * @returns {array} Sorted array of matches
 */
function findMatches(userPet, candidatePets, filters = {}) {
  const matches = [];

  // Filter and score candidates
  candidatePets.forEach((candidatePet) => {
    // Skip if same pet
    if (userPet.id === candidatePet.id) return;

    // Skip if different species (quick filter)
    if (
      userPet.species.toLowerCase() !==
      candidatePet.species.toLowerCase()
    ) {
      return;
    }

    // Skip if not available for breeding
    if (
      candidatePet.breedingStatus !== 'AVAILABLE' ||
      userPet.breedingStatus !== 'AVAILABLE'
    ) {
      return;
    }

    // Apply custom filters
    if (filters.minAge && candidatePet.age < filters.minAge) return;
    if (filters.maxAge && candidatePet.age > filters.maxAge) return;
    if (filters.minDistance !== undefined) {
      // Calculate distance
      const distance = calculateDistance(
        userPet.owner?.latitude || 0,
        userPet.owner?.longitude || 0,
        candidatePet.owner?.latitude || 0,
        candidatePet.owner?.longitude || 0
      );
      if (distance < filters.minDistance) return;
    }
    if (filters.maxDistance !== undefined) {
      const distance = calculateDistance(
        userPet.owner?.latitude || 0,
        userPet.owner?.longitude || 0,
        candidatePet.owner?.latitude || 0,
        candidatePet.owner?.longitude || 0
      );
      if (distance > filters.maxDistance) return;
    }

    // Calculate match score
    const matchResult = calculateMatchScore(userPet, candidatePet);

    // Only include viable matches (score > 0)
    if (matchResult.score > 0) {
      matches.push({
        petId: candidatePet.id,
        pet: candidatePet,
        owner: candidatePet.owner,
        ...matchResult,
      });
    }
  });

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

export {
  calculateMatchScore,
  findMatches,
  calculateDistance,
  MATCH_WEIGHTS,
};
