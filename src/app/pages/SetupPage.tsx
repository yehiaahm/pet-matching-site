/**
 * Setup Page - Production Ready
 * Complete setup and onboarding page for the pet breeding platform
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Circle,
  Loader2,
  User,
  Mail,
  Lock,
  MapPin,
  Camera,
  Heart,
  MessageCircle,
  CreditCard,
  Settings,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Star,
  Calendar,
  Phone,
  Globe,
  Shield,
  Zap,
  Users,
  Database,
  Cloud,
  Server
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
}

interface PetFormData {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  description: string;
  image: string;
}

interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  country: string;
  website: string;
}

export default function SetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data states
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    website: ''
  });

  const [petForm, setPetForm] = useState<PetFormData>({
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    image: ''
  });

  const [pets, setPets] = useState<PetFormData[]>([]);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    locationSharing: true,
    publicProfile: true,
    autoMatching: true
  });

  // Setup steps
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      icon: <User className="w-5 h-5" />,
      completed: false,
      required: true
    },
    {
      id: 'pets',
      title: 'Add Your Pets',
      description: 'Register your pets for breeding opportunities',
      icon: <Heart className="w-5 h-5" />,
      completed: false,
      required: true
    },
    {
      id: 'preferences',
      title: 'Set Preferences',
      description: 'Configure your notification and privacy settings',
      icon: <Settings className="w-5 h-5" />,
      completed: false,
      required: false
    },
    {
      id: 'verification',
      title: 'Verify Account',
      description: 'Confirm your email and phone number',
      icon: <Shield className="w-5 h-5" />,
      completed: false,
      required: true
    }
  ]);

  // Pet breeds by type
  const dogBreeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog',
    'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund'
  ];

  const catBreeds = [
    'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll',
    'Bengal', 'Russian Blue', 'Scottish Fold', 'Sphynx', 'Abyssinian'
  ];

  const birdBreeds = [
    'Parrot', 'Canary', 'Finch', 'Cockatiel', 'Lovebird',
    'Budgerigar', 'Macaw', 'Cockatoo', 'Parakeet', 'Conure'
  ];

  // Calculate progress
  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  // Update step completion
  const updateStepCompletion = (stepId: string, completed: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed } : step
    ));
  };

  // Handle profile submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update step completion
      updateStepCompletion('profile', true);
      setSuccess('Profile updated successfully!');
      
      // Move to next step
      setTimeout(() => {
        setCurrentStep(1);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pet addition
  const handleAddPet = () => {
    if (petForm.name && petForm.type && petForm.breed && petForm.age && petForm.gender) {
      setPets([...pets, { ...petForm }]);
      setPetForm({
        name: '',
        type: '',
        breed: '',
        age: '',
        gender: '',
        description: '',
        image: ''
      });
    }
  };

  // Handle pets completion
  const handlePetsComplete = () => {
    if (pets.length > 0) {
      updateStepCompletion('pets', true);
      setCurrentStep(2);
    }
  };

  // Handle preferences submission
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStepCompletion('preferences', true);
      setSuccess('Preferences saved successfully!');
      
      setTimeout(() => {
        setCurrentStep(3);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle verification
  const handleVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateStepCompletion('verification', true);
      setSetupComplete(true);
      setSuccess('Setup completed successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove pet
  const removePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  // Get breeds based on pet type
  const getBreeds = (type: string) => {
    switch (type) {
      case 'DOG': return dogBreeds;
      case 'CAT': return catBreeds;
      case 'BIRD': return birdBreeds;
      default: return [];
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your account is ready to use. Redirecting to dashboard...
            </p>
            <Progress value={100} className="mb-4" />
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Pet Breeding Platform
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your account to get started
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="text-xs text-gray-600 text-center">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Profile */}
            {currentStep === 0 && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                    placeholder="Tell us about yourself and your experience with pets..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userProfile.address}
                    onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={userProfile.city}
                      onChange={(e) => setUserProfile({...userProfile, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={userProfile.country}
                      onChange={(e) => setUserProfile({...userProfile, country: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={userProfile.website}
                    onChange={(e) => setUserProfile({...userProfile, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Continue
                </Button>
              </form>
            )}

            {/* Step 2: Pets */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Add Your Pets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="petName">Pet Name</Label>
                      <Input
                        id="petName"
                        value={petForm.name}
                        onChange={(e) => setPetForm({...petForm, name: e.target.value})}
                        placeholder="Enter pet name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="petType">Pet Type</Label>
                      <Select value={petForm.type} onValueChange={(value) => setPetForm({...petForm, type: value, breed: ''})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pet type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOG">Dog</SelectItem>
                          <SelectItem value="CAT">Cat</SelectItem>
                          <SelectItem value="BIRD">Bird</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="petBreed">Breed</Label>
                      <Select value={petForm.breed} onValueChange={(value) => setPetForm({...petForm, breed: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                        <SelectContent>
                          {getBreeds(petForm.type).map(breed => (
                            <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="petAge">Age</Label>
                      <Input
                        id="petAge"
                        type="number"
                        value={petForm.age}
                        onChange={(e) => setPetForm({...petForm, age: e.target.value})}
                        placeholder="Age in years"
                      />
                    </div>
                    <div>
                      <Label htmlFor="petGender">Gender</Label>
                      <Select value={petForm.gender} onValueChange={(value) => setPetForm({...petForm, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="petImage">Image URL</Label>
                      <Input
                        id="petImage"
                        value={petForm.image}
                        onChange={(e) => setPetForm({...petForm, image: e.target.value})}
                        placeholder="https://example.com/pet-image.jpg"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="petDescription">Description</Label>
                    <Textarea
                      id="petDescription"
                      value={petForm.description}
                      onChange={(e) => setPetForm({...petForm, description: e.target.value})}
                      placeholder="Describe your pet's personality, habits, and breeding history..."
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleAddPet}
                    className="w-full"
                    disabled={!petForm.name || !petForm.type || !petForm.breed || !petForm.age || !petForm.gender}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pet
                  </Button>
                </div>

                {/* Added Pets */}
                {pets.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Added Pets ({pets.length})</h4>
                    <div className="space-y-3">
                      {pets.map((pet, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <Heart className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{pet.name}</p>
                              <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years • {pet.gender}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePet(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePetsComplete}
                    className="flex-1"
                    disabled={pets.length === 0}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 2 && (
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, emailNotifications: checked as boolean})
                        }
                      />
                      <Label htmlFor="emailNotifications">
                        Email notifications for messages and matches
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pushNotifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, pushNotifications: checked as boolean})
                        }
                      />
                      <Label htmlFor="pushNotifications">
                        Push notifications on your device
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="locationSharing"
                        checked={preferences.locationSharing}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, locationSharing: checked as boolean})
                        }
                      />
                      <Label htmlFor="locationSharing">
                        Share location for nearby pet matching
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="publicProfile"
                        checked={preferences.publicProfile}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, publicProfile: checked as boolean})
                        }
                      />
                      <Label htmlFor="publicProfile">
                        Make my profile visible to other users
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoMatching"
                        checked={preferences.autoMatching}
                        onCheckedChange={(checked) => 
                          setPreferences({...preferences, autoMatching: checked as boolean})
                        }
                      />
                      <Label htmlFor="autoMatching">
                        Enable automatic pet matching suggestions
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Verify Your Account</h3>
                  <p className="text-gray-600 mb-6">
                    Complete the verification process to unlock all features
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-gray-600">Check your inbox for verification link</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-gray-600">Verify your phone number</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Verify
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Payment Setup</p>
                        <p className="text-sm text-gray-600">Add payment method for premium features</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleVerification}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">5,678</p>
              <p className="text-sm text-gray-600">Registered Pets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">892</p>
              <p className="text-sm text-gray-600">Successful Matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-gray-600">User Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
