import { Pet } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Shield, Heart, Calendar, MapPin, Phone, User, CheckCircle, FileText, AlertCircle } from 'lucide-react';

interface PetDetailsDialogProps {
  pet: Pet;
  open: boolean;
  onClose: () => void;
  onRequestMatch: (pet: Pet) => void;
}

export function PetDetailsDialog({ pet, open, onClose, onRequestMatch }: PetDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pet Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Pet Image and Basic Info */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={pet.images?.[0] || pet.image || ''}
                alt={pet.name}
                className="w-full h-64 object-cover"
              />
              {pet.verified && (
                <Badge className="absolute top-3 left-3 bg-green-500 gap-1">
                  <Shield className="w-3 h-3" />
                  Verified & Certified
                </Badge>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">{pet.name}</h3>
                <Badge variant={pet.gender === 'male' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                  {pet.gender === 'male' ? 'Male' : 'Female'}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
              <p className="text-gray-700 mt-3">{pet.description}</p>
            </div>

            <Separator />

            {/* Vaccination Records */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-lg">Vaccination Records</h4>
              </div>
              <div className="space-y-3">
                {pet.vaccinations.map((vaccine, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{vaccine.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Vaccination Date: {new Date(vaccine.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {vaccine.nextDue && (
                          <p className="text-sm text-gray-600">
                            Next Due: {new Date(vaccine.nextDue).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        )}
                        {vaccine.certificateImage && (
                          <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                            View Certificate
                          </Button>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-white">Up to date</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Health Check */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-lg">Health Check</h4>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Check Date:</span>
                  <span className="font-medium">{new Date(pet.healthCheck.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Veterinarian:</span>
                  <span className="font-medium">{pet.healthCheck.veterinarian}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificate No:</span>
                  <span className="font-medium font-mono">{pet.healthCheck.certificate}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-lg">Availability Period</h4>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">From</p>
                    <p className="font-medium">{new Date(pet.availability.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">To</p>
                    <p className="font-medium">{new Date(pet.availability.to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Owner Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-lg">Owner Information</h4>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pet.owner.name}</span>
                    {pet.owner.verified && (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">National ID:</span>
                  <span className="font-medium font-mono">{pet.owner.nationalId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="font-medium font-mono">{pet.owner.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium">{pet.owner.address}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{pet.owner.rating}</span>
                    <span className="text-xs text-gray-500">({pet.owner.totalMatches} successful matches)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-yellow-900">Important Safety Notices:</p>
                  <ul className="space-y-1 text-yellow-800 list-disc list-inside">
                    <li>All parties' identities will be verified before breeding</li>
                    <li>A digital contract will be signed to protect both parties and the pets</li>
                    <li>You must comply with returning the pet on the specified date</li>
                    <li>Any violation of terms may result in legal action</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            onClick={() => {
              onClose();
              onRequestMatch(pet);
            }} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
          >
            <Heart className="w-4 h-4 mr-2" />
            Request Match Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
