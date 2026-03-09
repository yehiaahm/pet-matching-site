import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { vetClinicService } from '../../services/vetClinicService';

const statusOptions = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_ADMIN', 'NO_SHOW'];

export default function AdminVetBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string>('');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [resultMap, setResultMap] = useState<Record<string, string>>({});

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await vetClinicService.adminBookings({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setBookings(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load clinic bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingId(bookingId);
      await vetClinicService.updateBookingStatus(bookingId, {
        status,
        adminNotes: notesMap[bookingId] || '',
        resultNotes: resultMap[bookingId] || '',
      });
      toast.success(`Booking updated to ${status}`);
      await loadBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>إدارة حجوزات العيادات البيطرية</span>
          <div className="w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No clinic bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="rounded border p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{booking.petName} • {booking.serviceName}</p>
                  <p className="text-sm text-gray-600">{booking.clinicName} • {new Date(booking.bookingDate).toLocaleDateString()} • {booking.timeSlot}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{booking.status}</span>
              </div>

              <Input
                value={notesMap[booking.id] ?? booking.adminNotes ?? ''}
                onChange={(event) => setNotesMap((prev) => ({ ...prev, [booking.id]: event.target.value }))}
                placeholder="Admin notes"
              />

              <Input
                value={resultMap[booking.id] ?? booking.resultNotes ?? ''}
                onChange={(event) => setResultMap((prev) => ({ ...prev, [booking.id]: event.target.value }))}
                placeholder="Result notes (used in health record when COMPLETED)"
              />

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={status === booking.status ? 'default' : 'outline'}
                    size="sm"
                    disabled={updatingId === booking.id}
                    onClick={() => handleUpdateStatus(booking.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
