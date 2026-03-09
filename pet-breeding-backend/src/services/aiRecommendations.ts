// AI Pet Shop Recommendations Service
import { PrismaClient, Product, Pet, User, AIRecommendation } from '@prisma/client';

const prisma = new PrismaClient();

interface RecommendationContext {
  petBreed: string;
  petAge: number;
  petSize: string;
  petSpecies: string;
  healthConditions?: string[];
  activityLevel?: string;
  userPreferences?: string[];
  previousPurchases?: string[];
}

interface ProductScore {
  product: Product;
  score: number;
  reasons: string[];
}

export class AIRecommendationService {
  /**
   * Generate AI-powered product recommendations for a pet
   */
  static async generateRecommendations(
    petId: string,
    userId: string,
    limit: number = 10
  ): Promise<ProductScore[]> {
    try {
      // Get pet information
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: { owner: true }
      });

      if (!pet) {
        throw new Error('Pet not found');
      }

      // Build recommendation context
      const context: RecommendationContext = {
        petBreed: pet.breed,
        petAge: pet.age,
        petSize: this.getPetSize(pet),
        petSpecies: pet.species,
        healthConditions: pet.healthRecords ? this.extractHealthConditions(pet.healthRecords) : [],
        activityLevel: this.estimateActivityLevel(pet),
        userPreferences: await this.getUserPreferences(userId),
        previousPurchases: await this.getPreviousPurchases(userId)
      };

      // Get all active products
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { category: true, reviews: true }
      });

      // Score each product
      const scoredProducts = await this.scoreProducts(products, context);

      // Sort by score and return top recommendations
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Score products based on pet characteristics
   */
  private static async scoreProducts(
    products: Product[],
    context: RecommendationContext
  ): Promise<ProductScore[]> {
    const scoredProducts: ProductScore[] = [];

    for (const product of products) {
      let score = 0;
      const reasons: string[] = [];

      // Breed-specific scoring (30% weight)
      const breedScore = this.calculateBreedScore(product, context);
      score += breedScore * 0.3;
      if (breedScore > 0.7) {
        reasons.push(`Perfect for ${context.petBreed}`);
      }

      // Age-appropriate scoring (20% weight)
      const ageScore = this.calculateAgeScore(product, context);
      score += ageScore * 0.2;
      if (ageScore > 0.7) {
        reasons.push(`Age-appropriate for ${context.petAge} year old`);
      }

      // Size-appropriate scoring (15% weight)
      const sizeScore = this.calculateSizeScore(product, context);
      score += sizeScore * 0.15;
      if (sizeScore > 0.7) {
        reasons.push(`Perfect size for ${context.petSize} pets`);
      }

      // Health condition scoring (15% weight)
      const healthScore = this.calculateHealthScore(product, context);
      score += healthScore * 0.15;
      if (healthScore > 0.7) {
        reasons.push(`Supports pet health needs`);
      }

      // User preference scoring (10% weight)
      const preferenceScore = this.calculatePreferenceScore(product, context);
      score += preferenceScore * 0.1;
      if (preferenceScore > 0.7) {
        reasons.push(`Matches your preferences`);
      }

      // Popularity scoring (5% weight)
      const popularityScore = this.calculatePopularityScore(product);
      score += popularityScore * 0.05;
      if (popularityScore > 0.7) {
        reasons.push(`Popular choice`);
      }

      // Seasonal scoring (5% weight)
      const seasonalScore = this.calculateSeasonalScore(product, context);
      score += seasonalScore * 0.05;
      if (seasonalScore > 0.7) {
        reasons.push(`Seasonal recommendation`);
      }

      scoredProducts.push({
        product,
        score,
        reasons
      });
    }

    return scoredProducts;
  }

  /**
   * Calculate breed-specific product score
   */
  private static calculateBreedScore(product: Product, context: RecommendationContext): number {
    const breedRules: { [key: string]: { [key: string]: number } } = {
      'German Shepherd': {
        'Large Breed Food': 0.9,
        'Joint Supplements': 0.8,
        'Training Equipment': 0.9,
        'Durable Toys': 0.8,
        'Grooming Tools': 0.7
      },
      'Golden Retriever': {
        'Large Breed Food': 0.9,
        'Dental Care': 0.8,
        'Outdoor Toys': 0.9,
        'Grooming Supplies': 0.8,
        'Training Treats': 0.7
      },
      'Persian Cat': {
        'Indoor Cat Food': 0.9,
        'Grooming Tools': 0.9,
        'Hairball Control': 0.8,
        'Quiet Toys': 0.7,
        'Litter Supplies': 0.8
      },
      'Siamese Cat': {
        'Active Cat Food': 0.9,
        'Interactive Toys': 0.9,
        'Climbing Equipment': 0.8,
        'Training Tools': 0.7,
        'High-energy Treats': 0.8
      }
    };

    const categoryScore = breedRules[context.petBreed]?.[product.category.name] || 0.3;
    const tagScore = this.calculateTagScore(product.tags, context.petBreed);
    
    return Math.max(categoryScore, tagScore);
  }

  /**
   * Calculate age-appropriate product score
   */
  private static calculateAgeScore(product: Product, context: RecommendationContext): number {
    if (context.petAge < 1) {
      // Puppy/Kitten products
      const puppyKeywords = ['puppy', 'kitten', 'starter', 'growth', 'young', 'baby'];
      return this.calculateKeywordScore(product.tags.concat(product.name, product.description), puppyKeywords);
    } else if (context.petAge < 7) {
      // Adult products
      const adultKeywords = ['adult', 'maintenance', 'daily', 'regular'];
      return this.calculateKeywordScore(product.tags.concat(product.name, product.description), adultKeywords);
    } else {
      // Senior products
      const seniorKeywords = ['senior', 'mature', 'joint', 'mobility', 'easy digest'];
      return this.calculateKeywordScore(product.tags.concat(product.name, product.description), seniorKeywords);
    }
  }

  /**
   * Calculate size-appropriate product score
   */
  private static calculateSizeScore(product: Product, context: RecommendationContext): number {
    const sizeKeywords = {
      'Small': ['small', 'toy', 'mini', 'puppy', 'kitten'],
      'Medium': ['medium', 'regular', 'standard'],
      'Large': ['large', 'big', 'maxi', 'adult'],
      'Giant': ['giant', 'xl', 'extra large', 'max']
    };

    const keywords = sizeKeywords[context.petSize] || [];
    return this.calculateKeywordScore(product.tags.concat(product.name, product.description), keywords);
  }

  /**
   * Calculate health condition product score
   */
  private static calculateHealthScore(product: Product, context: RecommendationContext): number {
    if (!context.healthConditions || context.healthConditions.length === 0) {
      return 0.5; // Neutral score
    }

    const healthKeywords = {
      'Joint Issues': ['joint', 'mobility', 'glucosamine', 'chondroitin'],
      'Skin Allergies': ['hypoallergenic', 'sensitive skin', 'limited ingredient'],
      'Digestive Issues': ['sensitive stomach', 'easy digest', 'probiotic'],
      'Dental Issues': ['dental', 'oral care', 'tartar control'],
      'Weight Management': ['weight control', 'low fat', 'light', 'diet']
    };

    let maxScore = 0;
    for (const condition of context.healthConditions) {
      const keywords = healthKeywords[condition] || [];
      const score = this.calculateKeywordScore(product.tags.concat(product.name, product.description), keywords);
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  /**
   * Calculate user preference score
   */
  private static calculatePreferenceScore(product: Product, context: RecommendationContext): number {
    if (!context.userPreferences || context.userPreferences.length === 0) {
      return 0.5; // Neutral score
    }

    return this.calculateKeywordScore(product.tags.concat(product.name, product.description), context.userPreferences);
  }

  /**
   * Calculate popularity score based on ratings and reviews
   */
  private static calculatePopularityScore(product: Product): number {
    // Normalize rating (0-1 scale)
    const ratingScore = product.rating / 5;
    
    // Normalize review count (logarithmic scale to avoid bias)
    const reviewScore = Math.min(product.reviewCount / 100, 1);
    
    // Weighted average
    return (ratingScore * 0.7) + (reviewScore * 0.3);
  }

  /**
   * Calculate seasonal score
   */
  private static calculateSeasonalScore(product: Product, context: RecommendationContext): number {
    const currentMonth = new Date().getMonth();
    const seasonalKeywords = {
      // Spring (March-May)
      2: ['spring', 'outdoor', 'allergy', 'shedding'],
      3: ['spring', 'outdoor', 'allergy', 'shedding'],
      4: ['spring', 'outdoor', 'allergy', 'shedding'],
      // Summer (June-August)
      5: ['summer', 'cooling', 'water', 'outdoor', 'travel'],
      6: ['summer', 'cooling', 'water', 'outdoor', 'travel'],
      7: ['summer', 'cooling', 'water', 'outdoor', 'travel'],
      // Fall (September-November)
      8: ['fall', 'autumn', 'indoor', 'cozy', 'rain'],
      9: ['fall', 'autumn', 'indoor', 'cozy', 'rain'],
      10: ['fall', 'autumn', 'indoor', 'cozy', 'rain'],
      // Winter (December-February)
      11: ['winter', 'warm', 'indoor', 'snow', 'holiday'],
      0: ['winter', 'warm', 'indoor', 'snow', 'holiday'],
      1: ['winter', 'warm', 'indoor', 'snow', 'holiday']
    };

    const keywords = seasonalKeywords[currentMonth] || [];
    return this.calculateKeywordScore(product.tags.concat(product.name, product.description), keywords);
  }

  /**
   * Calculate keyword match score
   */
  private static calculateKeywordScore(textArray: string[], keywords: string[]): number {
    const text = textArray.join(' ').toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    return matchedKeywords.length / keywords.length;
  }

  /**
   * Calculate tag score for specific breed
   */
  private static calculateTagScore(tags: string[], breed: string): number {
    const breedTags = tags.filter(tag => 
      tag.toLowerCase().includes(breed.toLowerCase()) ||
      breed.toLowerCase().includes(tag.toLowerCase())
    );
    
    return breedTags.length > 0 ? 0.8 : 0.3;
  }

  /**
   * Get pet size based on weight and breed
   */
  private static getPetSize(pet: Pet): string {
    if (pet.weight) {
      if (pet.weight < 10) return 'Small';
      if (pet.weight < 25) return 'Medium';
      if (pet.weight < 50) return 'Large';
      return 'Giant';
    }
    
    // Fallback to breed-based size estimation
    const smallBreeds = ['Chihuahua', 'Pomeranian', 'Yorkshire Terrier', 'Persian', 'Siamese'];
    const largeBreeds = ['German Shepherd', 'Golden Retriever', 'Labrador', 'Rottweiler'];
    
    if (smallBreeds.includes(pet.breed)) return 'Small';
    if (largeBreeds.includes(pet.breed)) return 'Large';
    return 'Medium';
  }

  /**
   * Extract health conditions from health records
   */
  private static extractHealthConditions(healthRecords: any[]): string[] {
    // This would analyze health records and extract conditions
    // For now, return common conditions
    return ['Joint Issues', 'Skin Allergies'];
  }

  /**
   * Estimate activity level based on breed and age
   */
  private static estimateActivityLevel(pet: Pet): string {
    const activeBreeds = ['German Shepherd', 'Border Collie', 'Golden Retriever', 'Labrador'];
    const calmBreeds = ['Persian', 'Bulldog', 'Basset Hound'];
    
    if (activeBreeds.includes(pet.breed) && pet.age < 7) return 'High';
    if (calmBreeds.includes(pet.breed) || pet.age > 8) return 'Low';
    return 'Medium';
  }

  /**
   * Get user preferences from purchase history
   */
  private static async getUserPreferences(userId: string): Promise<string[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Extract common tags and categories from purchase history
    const preferences: string[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        preferences.push(item.product.category.name);
        preferences.push(...item.product.tags);
      });
    });

    // Return unique preferences
    return [...new Set(preferences)];
  }

  /**
   * Get previous purchases
   */
  private static async getPreviousPurchases(userId: string): Promise<string[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true }
    });

    const purchasedProductIds = orders.flatMap(order => 
      order.items.map(item => item.productId)
    );

    return purchasedProductIds;
  }

  /**
   * Save AI recommendations to database
   */
  static async saveRecommendations(
    userId: string,
    petId: string,
    recommendations: ProductScore[]
  ): Promise<void> {
    try {
      // Clear old recommendations for this pet and user
      await prisma.aIRecommendation.deleteMany({
        where: { userId, petId }
      });

      // Save new recommendations
      const recommendationData = recommendations.map((rec, index) => ({
        userId,
        petId,
        productId: rec.product.id,
        score: rec.score,
        reason: rec.reasons.join(', '),
        context: `AI-generated for ${rec.score.toFixed(2)} score`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }));

      await prisma.aIRecommendation.createMany({
        data: recommendationData
      });
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }

  /**
   * Get saved recommendations for a pet
   */
  static async getSavedRecommendations(
    userId: string,
    petId: string
  ): Promise<AIRecommendation[]> {
    return await prisma.aIRecommendation.findMany({
      where: {
        userId,
        petId,
        expiresAt: { gt: new Date() }
      },
      include: {
        product: {
          include: { category: true, reviews: true }
        }
      },
      orderBy: { score: 'desc' }
    });
  }
}
