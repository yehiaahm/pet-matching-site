/**
 * AI Match Recommendations Component - Production Ready
 * Displays smart pet recommendations with explainable AI scores
 */

import { useEffect } from 'react';
import { Sparkles, Heart, Award, TrendingUp, MapPin, RefreshCw, AlertCircle, Brain, Zap } from 'lucide-react';
import { useAIMatching } from '../hooks/useAIMatching';
import { usePremiumFeature } from '../hooks/usePremiumFeature';
import { GradientButton } from './ui/ModernButton';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';
import type { Pet } from '../services/aiMatchingService';

interface AIRecommendationsProps {
  pet: Pet;
  candidates: Pet[];
  limit?: number;
  onSelectMatch?: (matchedPetId: string) => void;
  showDetails?: boolean;
  onSubscriptionNeeded?: () => void;
}

export function AIRecommendations({
  pet,
  candidates,
  limit = 5,
  onSelectMatch,
  showDetails = true,
  onSubscriptionNeeded,
}: AIRecommendationsProps) {
  const { 
    recommendations, 
    loading, 
    error, 
    matchScore, 
    aiServiceHealthy,
    fetchRecommendations, 
    calculateScore,
    checkServiceHealth 
  } = useAIMatching();
  
  const { tryUseFeature } = usePremiumFeature({
    featureName: 'aiMatching',
    onUpgradeNeeded: onSubscriptionNeeded || (() => {}),
  });

  useEffect(() => {
    if (!tryUseFeature()) {
      return;
    }
    
    if (pet && candidates.length > 0) {
      fetchRecommendations(pet, candidates, limit);
    }
  }, [pet, candidates, limit, fetchRecommendations, tryUseFeature]);

  // Handle service health check
  const handleRetry = async () => {
    const isHealthy = await checkServiceHealth();
    if (isHealthy && pet && candidates.length > 0) {
      fetchRecommendations(pet, candidates, limit);
    }
  };

  // Handle individual pet score calculation
  const handleCalculateScore = async (candidatePet: Pet) => {
    await calculateScore(pet, candidatePet);
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center py-12"
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <div className="text-center space-y-4">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-12 h-12 text-indigo-600 mx-auto" />
            <Zap className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
          </motion.div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">AI is analyzing compatibility...</p>
            <p className="text-sm text-gray-500">
              Evaluating breed, health, genetics, and location factors
            </p>
          </div>
          <Progress value={75} className="w-48 mx-auto" />
        </div>
      </motion.div>
    );
  }

  if (!aiServiceHealthy) {
    return (
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <p className="font-semibold">AI Matching Service Unavailable</p>
              <p className="text-sm">
                Our AI matching service is temporarily down. Please try again in a few moments.
              </p>
              <GradientButton
                size="sm"
                onClick={handleRetry}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </GradientButton>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <motion.div
        className="text-center py-8 px-4"
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">No AI Matches Found</h3>
          <p className="text-gray-600">
            Our AI couldn't find suitable matches for {pet.name} at this time.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Try expanding your search criteria</p>
            <p>• Complete your pet's health records</p>
            <p>• Add more detailed pet information</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="w-6 h-6 text-indigo-600" />
            <Zap className="w-4 h-4 text-yellow-500" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              AI-Powered Matches
            </h3>
            <p className="text-sm text-gray-600">
              Ranked by compatibility score for {pet.name}
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className="bg-green-50 border-green-200 text-green-700"
        >
          <Brain className="w-3 h-3 mr-1" />
          AI Active
        </Badge>
      </div>

      {/* Match Score Summary */}
      {matchScore && (
        <motion.div
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4"
          variants={scaleUpVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900">Latest Match Analysis</h4>
              <p className="text-sm text-indigo-700">
                Score: {matchScore.score}/100 • Probability: {(matchScore.probability * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {matchScore.score}
              </div>
              <div className="text-xs text-indigo-600">AI Score</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              className="group"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                {/* Rank & Score */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      #{index + 1}
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {recommendation.matchedPetName}
                      </h4>
                      <p className="text-gray-600">
                        {recommendation.matchedPetBreed} • {recommendation.matchedPetAge} years • {recommendation.matchedPetGender}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {recommendation.score.totalScore}
                      </div>
                      <div className="text-sm text-gray-500">/100</div>
                    </div>
                    <Badge 
                      className={
                        recommendation.score.totalScore >= 85
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : recommendation.score.totalScore >= 70
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    >
                      {recommendation.score.totalScore >= 85
                        ? '⭐ Excellent Match'
                        : recommendation.score.totalScore >= 70
                        ? '✨ Good Match'
                        : '👍 Fair Match'}
                    </Badge>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {recommendation.ownerName}
                    </span>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{recommendation.ownerRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {recommendation.distance} km away
                    </span>
                    <span>{recommendation.location}</span>
                    <span>{recommendation.previousMatches} successful matches</span>
                  </div>
                </div>

                {/* AI Score Breakdown */}
                {showDetails && (
                  <div className="space-y-3 mb-4">
                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      AI Analysis Breakdown
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Breed', score: recommendation.score.breedCompatibility },
                        { label: 'Age', score: recommendation.score.ageCompatibility },
                        { label: 'Health', score: recommendation.score.healthScore },
                        { label: 'Genetics', score: recommendation.score.geneticScore },
                        { label: 'Location', score: recommendation.score.locationScore },
                        { label: 'History', score: recommendation.score.historyScore },
                      ].map(({ label, score }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-700">{label}</span>
                            <span className="text-gray-600">{score}%</span>
                          </div>
                          <Progress 
                            value={score} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-1">AI Recommendation</h5>
                      <p className="text-sm text-blue-800">{recommendation.recommendation}</p>
                      <div className="mt-2 text-xs text-blue-700">
                        Match probability: {(recommendation.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="mb-4 space-y-2">
                  <h5 className="font-semibold text-gray-900 text-sm">Key Compatibility Factors</h5>
                  {recommendation.score.factors.slice(0, 3).map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          factor.sentiment === 'positive'
                            ? 'bg-green-500'
                            : factor.sentiment === 'negative'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}
                      >
                        {factor.sentiment === 'positive'
                          ? '✓'
                          : factor.sentiment === 'negative'
                          ? '✕'
                          : '−'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{factor.category}</p>
                        <p className="text-gray-600 text-xs">{factor.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <GradientButton
                    className="flex-1 gap-2"
                    onClick={() => onSelectMatch?.(recommendation.matchedPetId)}
                  >
                    <Heart className="w-4 h-4" />
                    Send Match Request
                  </GradientButton>
                  <button
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleCalculateScore(candidates.find(c => c.id === recommendation.matchedPetId)!)}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Detailed Analysis
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Explanation */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-indigo-900 mb-2">🤖 How AI Matching Works</h4>
            <div className="text-sm text-indigo-800 space-y-2">
              <p>
                Our advanced AI algorithm analyzes multiple compatibility factors to find the best matches for your pet:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Breed Compatibility:</strong> Genetic compatibility and breed characteristics</li>
                <li><strong>Age Analysis:</strong> Optimal breeding age windows and compatibility</li>
                <li><strong>Health Assessment:</strong> Vaccination records and health check history</li>
                <li><strong>Genetic Factors:</strong> Breed-specific genetic health considerations</li>
                <li><strong>Location Proximity:</strong> Geographic convenience for breeding arrangements</li>
                <li><strong>Owner History:</strong> Previous breeding success and owner ratings</li>
              </ul>
              <p className="font-semibold mt-3">
                Scores above 85 indicate excellent matches with high compatibility across all factors.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
