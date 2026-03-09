import { useState, useRef } from 'react';
import { Pet } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, X, Upload, FileImage } from 'lucide-react';
import { safePost } from '../utils/safeFetch';
import { toast } from 'sonner';

interface AddPetDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (pet: Pet) => void;
}

export function AddPetDialog({ open, onClose, onAdd }: AddPetDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'dog' | 'cat' | 'bird'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [description, setDescription] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [vaccinationMethod, setVaccinationMethod] = useState<'manual' | 'upload'>('upload');
  const [vaccinations, setVaccinations] = useState<{ name: string; date: string; nextDue: string }[]>([
    { name: '', date: '', nextDue: '' }
  ]);
  const [healthCheckDate, setHealthCheckDate] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [certificate, setCertificate] = useState('');
  const [loading, setLoading] = useState(false);

  // Image upload states
  const [petImages, setPetImages] = useState<File[]>([]);
  const [petImagePreviews, setPetImagePreviews] = useState<string[]>([]);
  const [vaccinationFiles, setVaccinationFiles] = useState<File[]>([]);

  // Refs for file inputs
  const petImageInputRef = useRef<HTMLInputElement>(null);
  const vaccinationInputRef = useRef<HTMLInputElement>(null);

  const handleAddVaccination = () => {
    setVaccinations([...vaccinations, { name: '', date: '', nextDue: '' }]);
  };

  const handleRemoveVaccination = (index: number) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
  };

  const handleVaccinationChange = (index: number, field: string, value: string) => {
    const updated = [...vaccinations];
    updated[index] = { ...updated[index], [field]: value };
    setVaccinations(updated);
  };

  // Handle pet image upload
  const handlePetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Validate file sizes (max 5MB per file)
    const validFiles = fileArray.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));

    setPetImages(prev => [...prev, ...validFiles]);
    setPetImagePreviews(prev => [...prev, ...previews]);

    toast.success(`${validFiles.length} image(s) added`);
  };

  // Remove pet image
  const handleRemovePetImage = (index: number) => {
    setPetImages(prev => prev.filter((_, i) => i !== index));
    setPetImagePreviews(prev => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Handle vaccination file upload
  const handleVaccinationFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Validate file sizes (max 10MB per file)
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setVaccinationFiles(prev => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} file(s) added`);
  };

  // Remove vaccination file
  const handleRemoveVaccinationFile = (index: number) => {
    setVaccinationFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getPetImage = () => {
    switch (type) {
      case 'dog':
        return 'https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjY2NTUyODN8MA&ixlib=rb-4.1.0&q=80&w=1080';
      case 'cat':
        return 'https://images.unsplash.com/photo-1647806422508-0322f33e270b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjY2MzgyMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080';
      case 'bird':
        return 'https://images.unsplash.com/photo-1584888890205-9b49eaf0c660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHBhcnJvdCUyMGJpcmR8ZW58MXx8fHwxNzY2NjU4NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080';
      default:
        return 'https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjY2NTUyODN8MA&ixlib=rb-4.1.0&q=80&w=1080';
    }
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });

  const resetForm = () => {
    setName('');
    setBreed('');
    setAge('');
    setDescription('');
    setAvailableFrom('');
    setAvailableTo('');
    setHealthCheckDate('');
    setVeterinarian('');
    setCertificate('');
    setVaccinations([{ name: '', date: '', nextDue: '' }]);

    // Clean up image previews
    petImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setPetImages([]);
    setPetImagePreviews([]);
    setVaccinationFiles([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // 7. Add frontend validation
    if (!name?.trim()) {
      toast.error('Pet name is required');
      return;
    }
    if (!breed?.trim()) {
      toast.error('Breed is required');
      return;
    }
    if (!type) {
      toast.error('Type is required');
      return;
    }

    // Age validation (Age must be positive number)
    const ageValue = Number(age);
    if (isNaN(ageValue) || ageValue <= 0) {
      toast.error('Age must be a positive number');
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrls = petImages.length > 0
        ? await Promise.all(petImages.map((file) => fileToDataUrl(file)))
        : [];

      // 4. Build correct flat payload
      const payload = {
        name: name.trim(),
        type: type,
        breed: breed.trim(),
        gender: gender,
        age: ageValue,
        description: description?.trim() || undefined,
        imageUrls: uploadedImageUrls,
      };

      console.log("FINAL PET PAYLOAD:", payload);

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');

      // 5. Send ONLY this
      // 6. DELETE fallback call to /api/pets
      const response = await safePost("/api/v1/pets", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      console.log("📥 Response from API:", response);

      if (response.success) {
        // 8. After success:
        toast.success('✅ Pet added successfully!');

        // Construct the pet object for the UI update
        const createdPet = (response.data as any)?.data?.pet || (response.data as any)?.pet || (response.data as any)?.data || response.data;

        const newPet: Pet = {
          id: createdPet?.id || Date.now().toString(),
          name: payload.name,
          type: type,
          breed: payload.breed,
          age: ageValue,
          gender: gender,
          image: uploadedImageUrls[0] || getPetImage(),
          owner: {
            name: 'Guest User',
            phone: '0100*******',
            address: 'Cairo',
            rating: 5.0,
            verified: false
          },
          vaccinations: [],
          healthCheck: {
            date: '',
            veterinarian: '',
          },
          description,
          verified: false
        };

        onAdd(newPet);
        resetForm();
        onClose();
      } else {
        // Handle validation errors from backend
        const validationMsg = Array.isArray(response.errorData?.errors)
          ? response.errorData.errors
            .map((e: any) => e?.msg || e?.message || e?.path)
            .filter(Boolean)
            .join(' - ')
          : '';

        toast.error(validationMsg || response.error || 'Failed to add pet');
      }
    } catch (error: any) {
      console.error('❌ Error adding pet:', error);
      toast.error('Error adding pet: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Pet</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Max"
                    />
                  </div>
                  <div>
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">🐕 Dog</SelectItem>
                        <SelectItem value="cat">🐱 Cat</SelectItem>
                        <SelectItem value="bird">🦜 Bird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age">Age (years) *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                      <SelectTrigger id="gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a detailed description about your pet..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Pet Image</Label>
                  <input
                    ref={petImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePetImageUpload}
                  />
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => petImageInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max size: 5MB)</p>
                  </div>

                  {petImages.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">Selected images: {petImages.length}</p>
                  )}

                  {/* Image Previews */}
                  {petImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {petImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePetImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vaccinations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Vaccinations *</h3>
              </div>

              <Tabs value={vaccinationMethod} onValueChange={(v: any) => setVaccinationMethod(v)}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload Certificates</TabsTrigger>
                  <TabsTrigger value="manual">Enter Manually</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-3">
                  <input
                    ref={vaccinationInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleVaccinationFileUpload}
                  />
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => vaccinationInputRef.current?.click()}
                  >
                    <FileImage className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <p className="font-medium mb-1">Upload Vaccination Certificates</p>
                    <p className="text-sm text-gray-600 mb-3">Upload images or PDFs of your pet's vaccination certificates</p>
                    <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); vaccinationInputRef.current?.click(); }}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">You can upload multiple files (Max 10MB each)</p>
                  </div>

                  {/* Uploaded Files List */}
                  {vaccinationFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded Files ({vaccinationFiles.length}):</p>
                      {vaccinationFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileImage className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVaccinationFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      💡 <span className="font-medium">Tip:</span> Uploading certificates is faster and our team will extract the information automatically!
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-3">
                  {vaccinations.map((vaccine, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Vaccination {index + 1}</span>
                        {vaccinations.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVaccination(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Vaccine name"
                          value={vaccine.name}
                          onChange={(e) => handleVaccinationChange(index, 'name', e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Vaccination date"
                          value={vaccine.date}
                          onChange={(e) => handleVaccinationChange(index, 'date', e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Next due"
                          value={vaccine.nextDue}
                          onChange={(e) => handleVaccinationChange(index, 'nextDue', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddVaccination} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Vaccination
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Health Check */}
            <div>
              <h3 className="font-semibold mb-4">Health Check *</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="healthCheckDate">Check Date</Label>
                    <Input
                      id="healthCheckDate"
                      type="date"
                      value={healthCheckDate}
                      onChange={(e) => setHealthCheckDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate">Certificate Number</Label>
                    <Input
                      id="certificate"
                      value={certificate}
                      onChange={(e) => setCertificate(e.target.value)}
                      placeholder="HC-2024-001234"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="veterinarian">Veterinarian Name & Clinic</Label>
                  <Input
                    id="veterinarian"
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="Dr. Ahmed Mohamed - Al Rahma Clinic"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-semibold mb-4">Availability Period *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="availableTo">Available To</Label>
                  <Input
                    id="availableTo"
                    type="date"
                    value={availableTo}
                    onChange={(e) => setAvailableTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ⚠️ <span className="font-medium">Important Notice:</span> All information will be reviewed and verified
                before your pet listing is published. This typically takes less than 24 hours.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-blue-500 to-green-500" disabled={loading}>
            {loading ? 'جاري الإضافة...' : 'Add Pet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
