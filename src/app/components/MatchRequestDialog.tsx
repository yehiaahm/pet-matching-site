import { useState } from 'react';
import { Pet } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { AlertCircle, Calendar, FileText, Heart, Shield, CheckCircle } from 'lucide-react';

interface MatchRequestDialogProps {
  pet: Pet;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function MatchRequestDialog({ pet, open, onClose, onSubmit }: MatchRequestDialogProps) {
  const [myPetId, setMyPetId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState('3-5');
  const [notes, setNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToContract, setAgreeToContract] = useState(false);
  const [agreeToVerification, setAgreeToVerification] = useState(false);

  const canSubmit = myPetId && preferredDate && agreeToTerms && agreeToContract && agreeToVerification;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Match Request with {pet.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Pet Info Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4">
              <div className="flex gap-4">
                <img
                  src={pet.images?.[0] || pet.image || ''}
                  alt={pet.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years • {pet.gender === 'male' ? 'Male' : 'Female'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Owner:</span>
                    <span className="font-medium">{pet.owner.name}</span>
                    {pet.owner.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* My Pet Selection */}
            <div>
              <h3 className="font-semibold mb-4">Select Your Pet</h3>
              <div>
                <Label htmlFor="myPet">My Pet *</Label>
                <Select value={myPetId} onValueChange={setMyPetId}>
                  <SelectTrigger id="myPet">
                    <SelectValue placeholder="Choose your pet for breeding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo-pet-1">Luna - Persian Cat - 2 years - Female</SelectItem>
                    <SelectItem value="demo-pet-2">Bella - Golden Retriever - 3 years - Female</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Breed compatibility and vaccinations will be verified automatically
                </p>
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div>
              <h3 className="font-semibold mb-4">Breeding Schedule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Stay Duration (days) *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 days</SelectItem>
                        <SelectItem value="3-5">3-5 days (Recommended)</SelectItem>
                        <SelectItem value="6-7">6-7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    💡 <span className="font-medium">Tip:</span> A 3-5 day period is recommended to increase 
                    the chances of successful breeding.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information you'd like to share with the owner..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Digital Contract Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Digital Contract</h3>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">Contract Terms:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-700">
                  <li>The first party agrees to deliver the pet on the specified date</li>
                  <li>The second party agrees to return the pet on the agreed date</li>
                  <li>Each party is responsible for the pet's care while in their custody</li>
                  <li>In case of pregnancy, distribution of offspring will be agreed upon</li>
                  <li>Any damage or health issues will be the responsibility of the party at fault</li>
                  <li>Either party may cancel the request 48 hours before the specified date</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Contract
                </Button>
              </div>
            </div>

            <Separator />

            {/* Security & Verification */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Verification & Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Checkbox
                    id="verification"
                    checked={agreeToVerification}
                    onCheckedChange={(checked) => setAgreeToVerification(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="verification" className="text-sm font-medium cursor-pointer">
                      I agree to identity verification *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      You will be asked to provide a copy of your national ID or passport for verification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="contract"
                    checked={agreeToContract}
                    onCheckedChange={(checked) => setAgreeToContract(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="contract" className="text-sm font-medium cursor-pointer">
                      I agree to sign the digital contract *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      The digital contract has legal force and can be referred to in case of dispute
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                      I agree to the terms and conditions *
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      I have read and understood all terms and conditions related to the breeding service
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-yellow-900">Important Legal Notice:</p>
                  <ul className="space-y-1 text-yellow-800 list-disc list-inside">
                    <li>This request has legal force under Egyptian law</li>
                    <li>Any violation of the contract may result in legal action</li>
                    <li>Failure to return the pet is considered theft</li>
                    <li>All details will be recorded in the system for reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
          >
            <Heart className="w-4 h-4 mr-2" />
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
