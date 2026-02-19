/**
 * GPS Matching Controller - Production Ready
 * Location-based pet matching with real geolocation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Haversine formula to calculate distance between two points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

/**
 * @desc    Update user location
 * @route   POST /api/gps/location
 * @access  Private
 */
const updateLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { latitude, longitude, accuracy, address } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        timestamp: new Date().toISOString()
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180',
        timestamp: new Date().toISOString()
      });
    }

    // Update or create user location
    await prisma.userLocation.upsert({
      where: { userId },
      update: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        address: address ? address.trim() : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        address: address ? address.trim() : null
      }
    });

    console.log(`📍 Location updated for user ${userId}: ${latitude}, ${longitude}`);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update location error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating location',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Find nearby pets
 * @route   POST /api/gps/find-nearby-pets
 * @access  Private
 */
const findNearbyPets = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      latitude,
      longitude,
      maxDistance = 50, // Default 50km
      petType,
      gender,
      breed,
      ageMin,
      ageMax,
      limit = 20
    } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user's pets to exclude from results
    const userPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });
    const userPetIds = userPets.map(pet => pet.id);

    // Build filter for pets
    const where = {
      verified: true,
      status: 'AVAILABLE',
      ownerId: { notIn: userPetIds }, // Exclude user's own pets
      location: {
        isNot: null
      }
    };

    // Add optional filters
    if (petType) {
      where.type = petType.toUpperCase();
    }
    if (gender) {
      where.gender = gender.toUpperCase();
    }
    if (breed) {
      where.breed = {
        contains: breed,
        mode: 'insensitive'
      };
    }
    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) where.age.gte = parseInt(ageMin);
      if (ageMax) where.age.lte = parseInt(ageMax);
    }

    // Get all pets with location
    const allPets = await prisma.pet.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
            verified: true
          }
        },
        vaccinations: true,
        healthChecks: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    // Calculate distances and filter
    const petsWithDistance = allPets.map(pet => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        pet.location.latitude,
        pet.location.longitude
      );

      return {
        ...pet,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        distanceUnit: 'km'
      };
    });

    // Filter by distance and sort
    const nearbyPets = petsWithDistance
      .filter(pet => pet.distance <= parseFloat(maxDistance))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    console.log(`🔍 Found ${nearbyPets.length} nearby pets for user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        pets: nearbyPets,
        searchLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          maxDistance: parseFloat(maxDistance)
        },
        count: nearbyPets.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Find nearby pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while finding nearby pets',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get user location
 * @route   GET /api/gps/location
 * @access  Private
 */
const getUserLocation = async (req, res) => {
  try {
    const userId = req.userId;

    const userLocation = await prisma.userLocation.findUnique({
      where: { userId }
    });

    if (!userLocation) {
      return res.status(404).json({
        success: false,
        error: 'Location not found. Please update your location first.',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: { location: userLocation },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get user location error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching location',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Update pet location
 * @route   PUT /api/gps/pet/:petId/location
 * @access  Private (pet owner only)
 */
const updatePetLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { petId } = req.params;
    const { latitude, longitude, accuracy, address } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if pet belongs to user
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true, name: true }
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        timestamp: new Date().toISOString()
      });
    }

    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update location of your own pets',
        timestamp: new Date().toISOString()
      });
    }

    // Update pet location
    await prisma.pet.update({
      where: { id: petId },
      data: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null,
          address: address ? address.trim() : null,
          updatedAt: new Date()
        }
      }
    });

    console.log(`📍 Pet location updated: ${pet.name} (${petId}) to ${latitude}, ${longitude}`);

    res.status(200).json({
      success: true,
      message: 'Pet location updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update pet location error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating pet location',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get location statistics
 * @route   GET /api/gps/stats
 * @access  Private
 */
const getLocationStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's location
    const userLocation = await prisma.userLocation.findUnique({
      where: { userId }
    });

    if (!userLocation) {
      return res.status(404).json({
        success: false,
        error: 'Location not found. Please update your location first.',
        timestamp: new Date().toISOString()
      });
    }

    // Get nearby pets count in different radius
    const radiuses = [5, 10, 25, 50, 100]; // km
    const stats = {};

    for (const radius of radiuses) {
      const nearbyPets = await prisma.pet.findMany({
        where: {
          verified: true,
          status: 'AVAILABLE',
          ownerId: { not: userId },
          location: {
            isNot: null
          }
        },
        include: {
          owner: {
            select: { id: true }
          }
        }
      });

      // Calculate distances
      const petsWithinRadius = nearbyPets.filter(pet => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pet.location.latitude,
          pet.location.longitude
        );
        return distance <= radius;
      });

      stats[`${radius}km`] = petsWithinRadius.length;
    }

    // Get user's pets with location
    const userPetsWithLocation = await prisma.pet.count({
      where: {
        ownerId: userId,
        location: {
          isNot: null
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        userLocation,
        nearbyPetsCount: stats,
        userPetsWithLocation,
        lastUpdated: userLocation.updatedAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get location stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching location stats',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  updateLocation,
  findNearbyPets,
  getUserLocation,
  updatePetLocation,
  getLocationStats
};
