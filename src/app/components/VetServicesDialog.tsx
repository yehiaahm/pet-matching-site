import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Stethoscope, Shield, MapPin, Phone, Star, Calendar, CheckCircle, Clock } from 'lucide-react';

interface VetServicesDialogProps {
  open: boolean;
  onClose: () => void;
}

const vetClinics = [
  {
    id: '1',
    name: 'Al Rahma Veterinary Clinic',
    rating: 4.9,
    reviews: 156,
    address: 'Cairo - Maadi',
    phone: '0100-1234567',
    services: ['Vaccinations', 'Health Checks', 'Breeding Consultation'],
    pricing: {
      vaccination: '200-400 EGP',
      healthCheck: '300-500 EGP',
      package: '800 EGP'
    },
    availability: 'Available 7 days a week',
    verified: true
  },
  {
    id: '2',
    name: 'Alexandria Veterinary Center',
    rating: 4.8,
    reviews: 132,
    address: 'Alexandria - Smouha',
    phone: '0120-9876543',
    services: ['Vaccinations', 'Health Checks', 'Laboratory Tests', 'X-Ray'],
    pricing: {
      vaccination: '250-450 EGP',
      healthCheck: '350-550 EGP',
      package: '900 EGP'
    },
    availability: 'Mon-Sat: 9AM-8PM',
    verified: true
  },
  {
    id: '3',
    name: 'Modern Pet Hospital',
    rating: 5.0,
    reviews: 89,
    address: 'Giza - Dokki',
    phone: '0111-5551234',
    services: ['Vaccinations', 'Health Checks', 'Breeding Services', 'Emergency Care'],
    pricing: {
      vaccination: '300-500 EGP',
      healthCheck: '400-600 EGP',
      package: '1000 EGP'
    },
    availability: '24/7 Emergency Services',
    verified: true
  }
];

export function VetServicesDialog({ open, onClose }: VetServicesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Veterinary Services</DialogTitle>
          <p className="text-sm text-gray-600">Partner clinics to help prepare your pet for breeding</p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Get Your Pet Ready for Breeding</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Our partner veterinary clinics offer comprehensive vaccination and health check services 
                    to ensure your pet meets all requirements for safe breeding.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Official Certificates
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Verified Clinics
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Fast Service
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Clinics List */}
            <div className="space-y-4">
              <h3 className="font-semibold">Partner Veterinary Clinics</h3>
              
              {vetClinics.map((clinic) => (
                <div key={clinic.id} className="border rounded-lg p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{clinic.name}</h4>
                        {clinic.verified && (
                          <Badge className="bg-green-500 gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{clinic.rating}</span>
                          <span className="text-gray-500">({clinic.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{clinic.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-mono">{clinic.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{clinic.availability}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Services Offered:</p>
                      <div className="flex flex-wrap gap-1">
                        {clinic.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-3">Pricing:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Vaccination:</span>
                        <p className="font-semibold text-green-600">{clinic.pricing.vaccination}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Health Check:</span>
                        <p className="font-semibold text-green-600">{clinic.pricing.healthCheck}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Complete Package:</span>
                        <p className="font-semibold text-green-600">{clinic.pricing.package}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* What's Included */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3">What's Included in Complete Package:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Full health examination by certified veterinarian</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All required vaccinations for breeding</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Official health certificate with stamp</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Breeding consultation and guidance</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Laboratory tests (if needed)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Follow-up support for 30 days</span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                💡 <span className="font-medium">Good News!</span> Many of these clinics offer discounts 
                for PetMate users. Mention you're from our platform when booking your appointment!
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
