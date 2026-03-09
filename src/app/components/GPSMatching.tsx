/**
 * GPS Matching Component
 * Displays AI-powered location-based pet matches
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Heart, 
  Star, 
  Shield, 
  Search, 
  Loader2,
  Navigation,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useGPSMatching } from '../hooks/useGPSMatching';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePremiumFeature } from '../hooks/usePremiumFeature';
import { safeGet } from '../utils/safeFetch';
import { toast } from 'sonner';

interface ComponentProps {
  onSubscriptionNeeded?: () => void;
}

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
}

export function GPSMatching({ onSubscriptionNeeded }: ComponentProps) {
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [userPet, setUserPet] = useState<Pet | null>(null);
  const [loadingUserPet, setLoadingUserPet] = useState(true);
  const [selectionNote, setSelectionNote] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState(25);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  
  const { 
    matches, 
    loading, 
    error, 
    searchParams, 
    findMatches, 
    clearMatches 
  } = useGPSMatching();
  
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    permission, 
    requestLocation 
  } = useGeolocation();

  const { tryUseFeature } = usePremiumFeature({
    featureName: 'gpsSearch',
    onUpgradeNeeded: onSubscriptionNeeded || (() => {}),
  });

  const mapToPet = (rawPet: any): Pet => {
    const normalizedType = String(rawPet?.type || 'dog').toLowerCase();
    const normalizedGender = String(rawPet?.gender || 'male').toLowerCase();

    return {
      id: rawPet.id,
      name: rawPet.name,
      type: normalizedType === 'cat' || normalizedType === 'bird' ? normalizedType : 'dog',
      breed: rawPet.breed,
      age: Number(rawPet.age) || 1,
      gender: normalizedGender === 'female' ? 'female' : 'male',
    };
  };

  const scorePetProfile = (rawPet: any): number => {
    let score = 0;

    if (rawPet?.name) score += 5;
    if (rawPet?.breed) score += 10;
    if (rawPet?.age != null) score += 10;
    if (rawPet?.gender) score += 10;
    if (rawPet?.lat != null && rawPet?.lng != null) score += 20;
    if (Array.isArray(rawPet?.images) && rawPet.images.length > 0) score += 10;
    if (rawPet?.description) score += 5;
    if (Array.isArray(rawPet?.healthRecords) && rawPet.healthRecords.length > 0) score += 20;

    const updatedAt = new Date(rawPet?.updatedAt || rawPet?.createdAt || 0).getTime();
    if (Number.isFinite(updatedAt) && updatedAt > 0) {
      const daysOld = Math.max(0, (Date.now() - updatedAt) / (1000 * 60 * 60 * 24));
      score += Math.max(0, 10 - Math.floor(daysOld / 30));
    }

    return score;
  };

  useEffect(() => {
    const fetchMyPet = async () => {
      try {
        setLoadingUserPet(true);

        const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await safeGet('/api/v1/pets/my', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to load your pets');
        }

        const payload = response.data as any;
        const sourcePets = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.pets)
              ? payload.pets
              : [];

        if (sourcePets.length === 0) {
          setUserPets([]);
          setUserPet(null);
          setSelectionNote('');
          return;
        }

        const mappedPets = sourcePets.map((rawPet: any) => mapToPet(rawPet));
        setUserPets(mappedPets);

        const rankedPets = sourcePets
          .map((rawPet: any) => ({ rawPet, score: scorePetProfile(rawPet) }))
          .sort((first: any, second: any) => second.score - first.score);

        const selectedRawPet = rankedPets[0].rawPet;
        setUserPet(mapToPet(selectedRawPet));

        if (sourcePets.length > 1) {
          setSelectionNote('Select one of your pets to start nearby matching.');
        } else {
          setSelectionNote('Using your registered pet profile for secure GPS matching.');
        }
      } catch (loadError) {
        console.error('Failed to load user pet for GPS matching:', loadError);
        setUserPets([]);
        setUserPet(null);
        setSelectionNote('');
      } finally {
        setLoadingUserPet(false);
      }
    };

    fetchMyPet();
  }, []);

  const handleFindMatches = async () => {
    // Check premium feature access
    if (!tryUseFeature()) {
      return;
    }

    if (!userPet) {
      toast.error('No pet found in your account. Please add your pet first.');
      return;
    }
    
    await findMatches(userPet, maxDistance, 10);
  };

  const getDistanceColor = (distance: number) => {
    if (distance <= 5) return 'text-green-600 bg-green-50';
    if (distance <= 15) return 'text-blue-600 bg-blue-50';
    if (distance <= 25) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          🤖 AI GPS Matching
        </h1>
        <p className="text-gray-600">
          Find perfect breeding partners near your location using our smart AI algorithm
        </p>
      </div>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your location is only used to improve matching and is never shared with third parties.
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPrivacyNotice(false)}
            >
              Got it
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* User Pet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Your Pet (Auto Selected)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingUserPet && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your pet from your account...
            </div>
          )}

          {!loadingUserPet && !userPet && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don&apos;t have pets in your account yet. Add a pet first to start GPS matching.
              </AlertDescription>
            </Alert>
          )}

          {!loadingUserPet && userPet && selectionNote && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">{selectionNote}</AlertDescription>
            </Alert>
          )}

          {!loadingUserPet && userPets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userPets.map((petItem) => {
                const isSelected = userPet?.id === petItem.id;
                return (
                  <button
                    key={petItem.id}
                    type="button"
                    onClick={() => {
                      setUserPet(petItem);
                      clearMatches();
                    }}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{petItem.name}</p>
                        <p className="text-sm text-gray-600">{petItem.breed} • {petItem.age} years</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{petItem.type}</Badge>
                        <Badge variant="outline">{petItem.gender}</Badge>
                        {isSelected && <Badge>Selected</Badge>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Search Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Max Distance</label>
              <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Your Location</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                {location ? (
                  <>
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {permission === 'granted' ? '✓ Granted' : '⚠ Pending'}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">
                      {permission === 'denied' ? 'Permission denied' : 'Location not set'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={requestLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                      Get Location
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleFindMatches}
            disabled={loading || loadingUserPet || !location || !userPet}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Nearby Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || locationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || locationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {searchParams && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎯 Search Results</span>
              <Button variant="outline" size="sm" onClick={clearMatches}>
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{searchParams.qualifiedMatches}</div>
                <div className="text-sm text-gray-600">Matches Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{searchParams.maxDistance}km</div>
                <div className="text-sm text-gray-600">Search Radius</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{searchParams.totalCandidates}</div>
                <div className="text-sm text-gray-600">Total Pets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {matches && matches.length > 0 ? Math.max(...matches.map(m => m.matchScore)) : 0}%
                </div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
            </div>

            {matches && matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <Card key={match.pet.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Pet Image */}
                      <div className="relative mb-3">
                        <img 
                          src={match.pet.images[0]} 
                          alt={match.pet.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {match.pet.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge className={`absolute top-2 left-2 ${getDistanceColor(match.distance)}`}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {match.distance} km
                        </Badge>
                      </div>

                      {/* Pet Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{match.pet.name}</h3>
                          <Badge variant={getScoreBadgeVariant(match.matchScore)}>
                            {match.matchScore}% Match
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{match.pet.breed} • {match.pet.age} years • {match.pet.gender}</div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>{match.pet.owner.rating} • {match.pet.owner.name}</span>
                          </div>
                        </div>

                        {/* Match Reason */}
                        <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Why this match:</strong> {match.matchReason}
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Breed:</span>
                            <span className={getScoreColor(match.breakdown.breed)}>
                              {match.breakdown.breed}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Age:</span>
                            <span className={getScoreColor(match.breakdown.age)}>
                              {match.breakdown.age}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gender:</span>
                            <span className={getScoreColor(match.breakdown.gender)}>
                              {match.breakdown.gender}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className={getScoreColor(match.breakdown.location)}>
                              {match.breakdown.location}%
                            </span>
                          </div>
                        </div>

                        <Button className="w-full mt-3">
                          Contact Owner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Searching for nearby matches...</span>
                    </div>
                  ) : (
                    <div>
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No matches found within {maxDistance}km</p>
                      <p className="text-sm">Try increasing the search radius</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
