import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { 
  TextInput, 
  SelectInput, 
  TextareaInput, 
  SharedButton, 
  SharedModal, 
  SharedModalHeader, 
  SharedModalContent, 
  SharedModalFooter 
} from './shared';

interface QuickAddPetProps {
  onAddPet?: (petData: any) => void;
}

export function QuickAddPetButton({ onAddPet }: QuickAddPetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    type: 'dog',
    age: '1',
    location: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.breed || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAddPet?.(formData);
      toast.success('Pet added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        breed: '',
        type: 'dog',
        age: '1',
        location: '',
        description: ''
      });
      
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to add pet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <SharedModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Quick Add Pet"
        description="Add a new pet to your profile"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Pet Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter pet name"
            />
            
            <SelectInput
              label="Pet Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'dog', label: 'Dog' },
                { value: 'cat', label: 'Cat' },
                { value: 'bird', label: 'Bird' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              required
              placeholder="Enter breed"
            />
            
            <TextInput
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter age"
            />
          </div>

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="Enter location"
          />

          <TextareaInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter pet description"
            rows={3}
          />

          <SharedModalFooter>
            <SharedButton
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </SharedButton>
            <SharedButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Pet'}
            </SharedButton>
          </SharedModalFooter>
        </form>
      </SharedModal>
    </>
  );
}
