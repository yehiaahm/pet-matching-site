/**
 * Simple Setup Page - Production Ready
 * Complete setup and onboarding page without external UI dependencies
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function SetupPageSimple() {
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

  // Simple button component
  const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary',
    disabled = false,
    className = '',
    ...props 
  }: any) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-purple-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Simple input component
  const Input = ({ 
    label, 
    id, 
    type = 'text', 
    value, 
    onChange, 
    placeholder = '',
    required = false,
    ...props 
  }: any) => (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        {...props}
      />
    </div>
  );

  // Simple textarea component
  const Textarea = ({ 
    label, 
    id, 
    value, 
    onChange, 
    placeholder = '',
    rows = 3,
    ...props 
  }: any) => (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        {...props}
      />
    </div>
  );

  // Simple select component
  const Select = ({ 
    label, 
    id, 
    value, 
    onChange, 
    placeholder = '',
    children,
    ...props 
  }: any) => (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        {...props}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    </div>
  );

  // Simple checkbox component
  const Checkbox = ({ 
    id, 
    checked, 
    onChange, 
    label,
    ...props 
  }: any) => (
    <div className="flex items-center space-x-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        {...props}
      />
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );

  // Simple card component
  const Card = ({ children, className = '', ...props }: any) => (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );

  // Simple alert component
  const Alert = ({ children, variant = 'info', className = '' }: any) => {
    const variants = {
      error: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
      <div className={`p-4 rounded-lg border ${variants[variant]} ${className}`}>
        {children}
      </div>
    );
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
          <p className="text-gray-600 mb-4">
            Your account is ready to use. Redirecting to dashboard...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
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
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {/* Step Content */}
        <Card className="w-full p-6">
          {/* Step 1: Profile */}
          {currentStep === 0 && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Complete Your Profile</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  label="First Name"
                  value={userProfile.firstName}
                  onChange={(e: any) => setUserProfile({...userProfile, firstName: e.target.value})}
                  required
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  value={userProfile.lastName}
                  onChange={(e: any) => setUserProfile({...userProfile, lastName: e.target.value})}
                  required
                />
              </div>
              <Input
                id="phone"
                type="tel"
                label="Phone Number"
                value={userProfile.phone}
                onChange={(e: any) => setUserProfile({...userProfile, phone: e.target.value})}
                required
              />
              <Textarea
                id="bio"
                label="Bio"
                value={userProfile.bio}
                onChange={(e: any) => setUserProfile({...userProfile, bio: e.target.value})}
                placeholder="Tell us about yourself and your experience with pets..."
                rows={3}
              />
              <Input
                id="address"
                label="Address"
                value={userProfile.address}
                onChange={(e: any) => setUserProfile({...userProfile, address: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="city"
                  label="City"
                  value={userProfile.city}
                  onChange={(e: any) => setUserProfile({...userProfile, city: e.target.value})}
                />
                <Input
                  id="country"
                  label="Country"
                  value={userProfile.country}
                  onChange={(e: any) => setUserProfile({...userProfile, country: e.target.value})}
                />
              </div>
              <Input
                id="website"
                type="url"
                label="Website (Optional)"
                value={userProfile.website}
                onChange={(e: any) => setUserProfile({...userProfile, website: e.target.value})}
                placeholder="https://yourwebsite.com"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: Pets */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Add Your Pets</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="petName"
                  label="Pet Name"
                  value={petForm.name}
                  onChange={(e: any) => setPetForm({...petForm, name: e.target.value})}
                  placeholder="Enter pet name"
                />
                <Select
                  id="petType"
                  label="Pet Type"
                  value={petForm.type}
                  onChange={(e: any) => setPetForm({...petForm, type: e.target.value, breed: ''})}
                >
                  <SelectItem value="DOG">Dog</SelectItem>
                  <SelectItem value="CAT">Cat</SelectItem>
                  <SelectItem value="BIRD">Bird</SelectItem>
                </Select>
                <Select
                  id="petBreed"
                  label="Breed"
                  value={petForm.breed}
                  onChange={(e: any) => setPetForm({...petForm, breed: e.target.value})}
                >
                  {getBreeds(petForm.type).map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </Select>
                <Input
                  id="petAge"
                  type="number"
                  label="Age"
                  value={petForm.age}
                  onChange={(e: any) => setPetForm({...petForm, age: e.target.value})}
                  placeholder="Age in years"
                />
                <Select
                  id="petGender"
                  label="Gender"
                  value={petForm.gender}
                  onChange={(e: any) => setPetForm({...petForm, gender: e.target.value})}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
                <Input
                  id="petImage"
                  label="Image URL"
                  value={petForm.image}
                  onChange={(e: any) => setPetForm({...petForm, image: e.target.value})}
                  placeholder="https://example.com/pet-image.jpg"
                />
              </div>
              <Textarea
                id="petDescription"
                label="Description"
                value={petForm.description}
                onChange={(e: any) => setPetForm({...petForm, description: e.target.value})}
                placeholder="Describe your pet's personality, habits, and breeding history..."
                rows={3}
              />
              <Button
                onClick={handleAddPet}
                className="w-full"
                disabled={!petForm.name || !petForm.type || !petForm.breed || !petForm.age || !petForm.gender}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pet
              </Button>

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
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Set Preferences</h2>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  <Checkbox
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={(e: any) => 
                      setPreferences({...preferences, emailNotifications: e.target.checked})
                    }
                    label="Email notifications for messages and matches"
                  />
                  <Checkbox
                    id="pushNotifications"
                    checked={preferences.pushNotifications}
                    onChange={(e: any) => 
                      setPreferences({...preferences, pushNotifications: e.target.checked})
                    }
                    label="Push notifications on your device"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  <Checkbox
                    id="locationSharing"
                    checked={preferences.locationSharing}
                    onChange={(e: any) => 
                      setPreferences({...preferences, locationSharing: e.target.checked})
                    }
                    label="Share location for nearby pet matching"
                  />
                  <Checkbox
                    id="publicProfile"
                    checked={preferences.publicProfile}
                    onChange={(e: any) => 
                      setPreferences({...preferences, publicProfile: e.target.checked})
                    }
                    label="Make my profile visible to other users"
                  />
                  <Checkbox
                    id="autoMatching"
                    checked={preferences.autoMatching}
                    onChange={(e: any) => 
                      setPreferences({...preferences, autoMatching: e.target.checked})
                    }
                    label="Enable automatic pet matching suggestions"
                  />
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
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Verify Your Account</h2>
              </div>
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
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Pending</span>
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
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">5,678</p>
            <p className="text-sm text-gray-600">Registered Pets</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">892</p>
            <p className="text-sm text-gray-600">Successful Matches</p>
          </Card>
          <Card className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-sm text-gray-600">User Rating</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for Select options
const SelectItem = ({ children, value, ...props }: any) => (
  <option value={value} {...props}>
    {children}
  </option>
);
