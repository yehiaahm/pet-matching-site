import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';

interface HealthRecord {
  id: string;
  recordType: string;
  recordDate: string;
  veterinarianName: string;
  clinicName?: string;
  details?: string;
  certificateUrl?: string;
  pet: {
    id: string;
    name: string;
    breed: string;
    images: string[];
  };
}

export default function HealthRecords() {
  const { token } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    recordType: 'VACCINATION',
    recordDate: new Date().toISOString().split('T')[0],
    veterinarianName: '',
    clinicName: '',
    details: '',
    certificateUrl: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/v1/health-records/my-pets',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/v1/health-records', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddDialog(false);
        fetchRecords();
        // Reset form
        setFormData({
          petId: '',
          recordType: 'VACCINATION',
          recordDate: new Date().toISOString().split('T')[0],
          veterinarianName: '',
          clinicName: '',
          details: '',
          certificateUrl: '',
        });
      }
    } catch (error) {
      console.error('Failed to create health record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    try {
      const response = await fetch(
        `/api/v1/health-records/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchRecords();
      }
    } catch (error) {
      console.error('Failed to delete health record:', error);
    }
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      VACCINATION: 'bg-blue-100 text-blue-800',
      CHECKUP: 'bg-green-100 text-green-800',
      TEST: 'bg-purple-100 text-purple-800',
      SURGERY: 'bg-red-100 text-red-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.OTHER;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Health Records</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          + Add Health Record
        </Button>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No health records found. Add your first record!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {record.pet.images?.[0] && (
                        <img
                          src={record.pet.images[0]}
                          alt={record.pet.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {record.pet.name}
                        </h3>
                        <p className="text-sm text-gray-600">{record.pet.breed}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeColor(
                            record.recordType
                          )}`}
                        >
                          {record.recordType}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.recordDate).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm">
                        <strong>Veterinarian:</strong> {record.veterinarianName}
                      </p>

                      {record.clinicName && (
                        <p className="text-sm">
                          <strong>Clinic:</strong> {record.clinicName}
                        </p>
                      )}

                      {record.details && (
                        <p className="text-sm text-gray-700 mt-2">
                          {record.details}
                        </p>
                      )}

                      {record.certificateUrl && (
                        <a
                          href={record.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Health Record Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Health Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="petId">Pet ID</Label>
              <Input
                id="petId"
                value={formData.petId}
                onChange={(e) =>
                  setFormData({ ...formData, petId: e.target.value })
                }
                required
                placeholder="Enter pet ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find the pet ID in your pet list
              </p>
            </div>

            <div>
              <Label htmlFor="recordType">Record Type</Label>
              <select
                id="recordType"
                value={formData.recordType}
                onChange={(e) =>
                  setFormData({ ...formData, recordType: e.target.value })
                }
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="VACCINATION">Vaccination</option>
                <option value="CHECKUP">Checkup</option>
                <option value="TEST">Test</option>
                <option value="SURGERY">Surgery</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="recordDate">Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) =>
                  setFormData({ ...formData, recordDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="veterinarianName">Veterinarian Name</Label>
              <Input
                id="veterinarianName"
                value={formData.veterinarianName}
                onChange={(e) =>
                  setFormData({ ...formData, veterinarianName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="clinicName">Clinic Name (Optional)</Label>
              <Input
                id="clinicName"
                value={formData.clinicName}
                onChange={(e) =>
                  setFormData({ ...formData, clinicName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="details">Details (Optional)</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="certificateUrl">Certificate URL (Optional)</Label>
              <Input
                id="certificateUrl"
                type="url"
                value={formData.certificateUrl}
                onChange={(e) =>
                  setFormData({ ...formData, certificateUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Record
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
