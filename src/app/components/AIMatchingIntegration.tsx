/**
 * AI Matching Integration Component
 * Integrates AI matching into the main pet showcase and dashboard
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Settings, Zap } from 'lucide-react';
import { AIRecommendations } from './AIRecommendations';
import { useAIMatching, useAIMatchingPreferences } from '../hooks/useAIMatching';
import { GradientButton } from './ui/ModernButton';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';
import type { Pet } from '../services/aiMatchingService';

interface AIMatchingIntegrationProps {
  userPets: Pet[];
  allPets: Pet[];
  selectedPetId?: string;
  onSelectPet?: (petId: string) => void;
  onMatchRequest?: (petId: string, matchedPetId: string) => void;
}

export function AIMatchingIntegration({
  userPets,
  allPets,
  selectedPetId,
  onSelectPet,
  onMatchRequest,
}: AIMatchingIntegrationProps) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState({
    breed: '',
    gender: '',
    ageRange: [0, 20] as [number, number],
    maxDistance: 50,
  });

  const { aiServiceHealthy, checkServiceHealth } = useAIMatching();
  const { preferences, updatePreferences } = useAIMatchingPreferences();

  // Filter candidates based on preferences and filters
  const getCandidates = () => {
    let candidates = allPets.filter(pet => 
      pet.id !== selectedPet?.id && // Exclude selected pet
      !userPets.some(userPet => userPet.id === pet.id) // Exclude user's own pets
    );

    // Apply filters
    if (filters.breed) {
      candidates = candidates.filter(pet => 
        pet.breed.toLowerCase().includes(filters.breed.toLowerCase())
      );
    }

    if (filters.gender) {
      candidates = candidates.filter(pet => pet.gender === filters.gender);
    }

    candidates = candidates.filter(pet => 
      pet.age >= filters.ageRange[0] && pet.age <= filters.ageRange[1]
    );

    // Apply AI preferences
    if (preferences.minMatchScore > 0) {
      // In real implementation, we'd pre-filter based on AI scores
      // For now, just return all candidates
    }

    return candidates;
  };

  // Set selected pet when ID changes
  useEffect(() => {
    if (selectedPetId) {
      const pet = userPets.find(p => p.id === selectedPetId);
      setSelectedPet(pet || null);
    }
  }, [selectedPetId, userPets]);

  // Auto-select first pet if none selected
  useEffect(() => {
    if (!selectedPet && userPets.length > 0) {
      setSelectedPet(userPets[0]);
      onSelectPet?.(userPets[0].id);
    }
  }, [selectedPet, userPets, onSelectPet]);

  const handlePetSelection = (pet: Pet) => {
    setSelectedPet(pet);
    onSelectPet?.(pet.id);
  };

  const handleMatchRequest = (matchedPetId: string) => {
    if (selectedPet) {
      onMatchRequest?.(selectedPet.id, matchedPetId);
    }
  };

  const handleRetryConnection = async () => {
    await checkServiceHealth();
  };

  if (!selectedPet && userPets.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pets Available</h3>
        <p className="text-gray-600">Add pets to your profile to enable AI matching.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Service Status */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Matching</h2>
              <p className="text-sm text-gray-600">
                Smart compatibility analysis for optimal breeding pairs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={aiServiceHealthy ? "default" : "destructive"}
              className={aiServiceHealthy ? "bg-green-100 text-green-700 border-green-200" : ""}
            >
              {aiServiceHealthy ? (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  AI Active
                </>
              ) : (
                <>
                  <Settings className="w-3 h-3 mr-1" />
                  AI Offline
                </>
              )}
            </Badge>
            
            <GradientButton
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </GradientButton>
          </div>
        </div>
      </motion.div>

      {/* AI Service Offline Alert */}
      {!aiServiceHealthy && (
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
        >
          <Alert className="border-amber-200 bg-amber-50">
            <Settings className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">AI Service Temporarily Unavailable</p>
                  <p className="text-sm">
                    Our AI matching service is currently offline. Basic matching is still available.
                  </p>
                </div>
                <GradientButton size="sm" onClick={handleRetryConnection}>
                  Retry
                </GradientButton>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Pet Selection */}
      {userPets.length > 1 && (
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">
              Select Pet for Matching
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {userPets.map((pet) => (
                <motion.button
                  key={pet.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPet?.id === pet.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePetSelection(pet)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="font-medium text-sm">{pet.name}</p>
                    <p className="text-xs text-gray-500">{pet.breed}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Settings Panel */}
      {showSettings && (
        <motion.div
          variants={scaleUpVariants}
          initial="initial"
          animate="animate"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AI Matching Preferences
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-ai">Enable AI Matching</Label>
                  <Switch
                    id="enable-ai"
                    checked={preferences.enableAIMatching}
                    onCheckedChange={(checked) => 
                      updatePreferences({ enableAIMatching: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-score">Minimum Match Score: {preferences.minMatchScore}</Label>
                  <Slider
                    id="min-score"
                    min={50}
                    max={95}
                    step={5}
                    value={[preferences.minMatchScore]}
                    onValueChange={([value]) => 
                      updatePreferences({ minMatchScore: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-distance">Max Distance: {preferences.maxDistance}km</Label>
                  <Slider
                    id="max-distance"
                    min={10}
                    max={200}
                    step={10}
                    value={[preferences.maxDistance]}
                    onValueChange={([value]) => 
                      updatePreferences({ maxDistance: value })
                    }
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="breed-filter">Breed Filter</Label>
                  <Input
                    id="breed-filter"
                    placeholder="Filter by breed..."
                    value={filters.breed}
                    onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender-filter">Gender</Label>
                  <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years</Label>
                  <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={filters.ageRange}
                    onValueChange={(value) => setFilters({ ...filters, ageRange: value as [number, number] })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {selectedPet && (
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <AIRecommendations
            pet={selectedPet}
            candidates={getCandidates()}
            limit={10}
            onSelectMatch={handleMatchRequest}
            showDetails={true}
          />
        </motion.div>
      )}
    </div>
  );
}

/**
 * Dashboard AI Widget
 * Compact version for dashboard overview
 */
export function AIDashboardWidget({
  userPets,
  allPets,
  onMatchRequest,
}: {
  userPets: Pet[];
  allPets: Pet[];
  onMatchRequest?: (petId: string, matchedPetId: string) => void;
}) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const { aiServiceHealthy } = useAIMatching();

  useEffect(() => {
    if (userPets.length > 0 && !selectedPet) {
      setSelectedPet(userPets[0]);
    }
  }, [userPets, selectedPet]);

  if (!selectedPet) {
    return null;
  }

  const candidates = allPets.filter(pet => 
    pet.id !== selectedPet.id && 
    !userPets.some(userPet => userPet.id === pet.id)
  );

  const handleWidgetMatchRequest = (matchedPetId: string) => {
    onMatchRequest?.(selectedPet.id, matchedPetId);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
      variants={scaleUpVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI Matches
        </h3>
        <Badge 
          variant={aiServiceHealthy ? "default" : "destructive"}
          className={aiServiceHealthy ? "bg-green-100 text-green-700 border-green-200" : ""}
        >
          {aiServiceHealthy ? 'Active' : 'Offline'}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          <p className="font-medium text-gray-900">{selectedPet.name}</p>
          <p className="text-gray-600">{selectedPet.breed} • {selectedPet.age} years</p>
        </div>

        <AIRecommendations
          pet={selectedPet}
          candidates={candidates.slice(0, 5)} // Limit to top 5 for widget
          limit={3}
          onSelectMatch={handleWidgetMatchRequest}
          showDetails={false}
        />
      </div>
    </motion.div>
  );
}
