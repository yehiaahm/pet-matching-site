import { useEffect, useState } from 'react';
import { Pet } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { safePut } from '../utils/safeFetch';
import { toast } from 'sonner';

interface EditPetDialogProps {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
  onUpdated: () => Promise<void> | void;
}

export function EditPetDialog({ open, onClose, pet, onUpdated }: EditPetDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'dog' | 'cat' | 'bird'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('1');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pet || !open) return;
    setName(pet.name || '');
    setType(pet.type || 'dog');
    setBreed(pet.breed || '');
    setAge(String(pet.age || 1));
    setGender(pet.gender || 'male');
    setDescription(pet.description || '');
  }, [pet, open]);

  const handleSubmit = async () => {
    if (!pet) return;

    if (!name.trim()) {
      toast.error('Pet name is required');
      return;
    }
    if (!breed.trim()) {
      toast.error('Breed is required');
      return;
    }

    const parsedAge = Number(age);
    if (Number.isNaN(parsedAge) || parsedAge <= 0) {
      toast.error('Age must be a positive number');
      return;
    }

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');

    setLoading(true);
    try {
      const response = await safePut(`/api/v1/pets/${pet.id}`, {
        name: name.trim(),
        type,
        breed: breed.trim(),
        gender,
        age: parsedAge,
        description: description.trim() || undefined,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.success) {
        toast.error(response.error || 'Failed to update pet');
        return;
      }

      toast.success('تم تعديل بيانات الحيوان بنجاح');
      await onUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الحيوان</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={type} onValueChange={(value: 'dog' | 'cat' | 'bird') => setType(value)}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                <SelectTrigger id="edit-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-breed">Breed</Label>
              <Input id="edit-breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-age">Age</Label>
              <Input id="edit-age" type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
