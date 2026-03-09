import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { vetClinicService, type MyPet, type VetClinic } from '../services/vetClinicService';

export default function VetClinicsPage() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<VetClinic[]>([]);
  const [pets, setPets] = useState<MyPet[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === selectedClinicId) || null,
    [clinics, selectedClinicId]
  );

  const selectedService = useMemo(
    () => selectedClinic?.services?.find((service) => service.id === selectedServiceId) || null,
    [selectedClinic, selectedServiceId]
  );

  const loadAll = async () => {
    try {
      setLoading(true);
      const [clinicsResponse, petsResponse, bookingsResponse] = await Promise.all([
        vetClinicService.listClinics(),
        vetClinicService.myPets(),
        vetClinicService.myBookings(),
      ]);

      setClinics(clinicsResponse.data || []);

      const petsPayload = Array.isArray(petsResponse)
        ? petsResponse
        : Array.isArray((petsResponse as any)?.data)
          ? (petsResponse as any).data
          : [];
      setPets(petsPayload);
      setMyBookings(bookingsResponse.data || []);

      if ((clinicsResponse.data || []).length > 0) {
        setSelectedClinicId((current) => current || clinicsResponse.data[0].id);
      }

      if (petsPayload.length > 0) {
        setSelectedPetId((current) => current || petsPayload[0].id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load veterinary clinics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selectedClinic || !bookingDate) {
      setSlots([]);
      return;
    }

    vetClinicService
      .getSlots(selectedClinic.id, bookingDate)
      .then((response) => {
        setSlots(response.data.availableSlots || []);
        setTimeSlot((current) => (response.data.availableSlots || []).includes(current) ? current : '');
      })
      .catch(() => setSlots([]));
  }, [selectedClinic, bookingDate]);

  useEffect(() => {
    if (!selectedClinic) return;
    const services = selectedClinic.services || [];
    if (!services.find((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id || '');
    }
  }, [selectedClinic, selectedServiceId]);

  const handleCreateBooking = async () => {
    if (!selectedClinicId || !selectedServiceId || !selectedPetId || !bookingDate || !timeSlot) {
      toast.error('Please complete all booking fields');
      return;
    }

    try {
      setSubmitting(true);
      await vetClinicService.createBooking({
        clinicId: selectedClinicId,
        serviceId: selectedServiceId,
        petId: selectedPetId,
        bookingDate,
        timeSlot,
        userNotes,
      });

      toast.success('Booking created successfully');
      setUserNotes('');
      setTimeSlot('');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              Veterinary Clinics
            </h1>
            <p className="text-gray-600">Book clinic visits and keep health records updated automatically.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">Loading clinics...</CardContent>
              </Card>
            ) : (
              clinics.map((clinic) => (
                <Card key={clinic.id} className={selectedClinicId === clinic.id ? 'border-blue-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{clinic.name}</span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedClinicId(clinic.id)}>
                        {selectedClinicId === clinic.id ? 'Selected' : 'Select'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-700">{clinic.description}</p>
                    <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{clinic.city} - {clinic.address}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{clinic.phone}</div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {clinic.services.map((service) => (
                        <span key={service.id} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                          {service.name} • {service.price} EGP
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pets.length > 1 ? (
                  <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                    <SelectTrigger><SelectValue placeholder="Select your pet" /></SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>{pet.name} • {pet.breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : pets.length === 1 ? (
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    Pet: <span className="font-medium">{pets[0].name}</span> • {pets[0].breed}
                  </div>
                ) : (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    No pets found. Please add a pet first.
                  </div>
                )}

                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {(selectedClinic?.services || []).map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} • {service.price} EGP
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} />

                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                  <SelectContent>
                    {slots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  value={userNotes}
                  onChange={(event) => setUserNotes(event.target.value)}
                  placeholder="Notes for clinic (optional)"
                  rows={3}
                />

                <Button onClick={handleCreateBooking} disabled={submitting} className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </Button>

                {selectedService && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Duration: {selectedService.duration} min
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[360px] overflow-auto">
                {myBookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings yet.</p>
                ) : (
                  myBookings.map((booking) => (
                    <div key={booking.id} className="p-3 rounded border text-sm">
                      <div className="font-medium">{booking.petName} • {booking.serviceName}</div>
                      <div className="text-gray-600">{booking.clinicName}</div>
                      <div className="text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()} • {booking.timeSlot}</div>
                      <div className="text-xs mt-1">Status: <span className="font-semibold">{booking.status}</span></div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
