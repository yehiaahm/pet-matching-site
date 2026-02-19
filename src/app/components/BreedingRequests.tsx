import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../context/AuthContext';
import { mockBreedingRequestsService, type BreedingRequest } from '../services/mockBreedingRequestsService';

export default function BreedingRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<BreedingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'all'>('received');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await mockBreedingRequestsService.fetchRequests(activeTab);
      setRequests(data.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await mockBreedingRequestsService.acceptRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await mockBreedingRequestsService.rejectRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await mockBreedingRequestsService.cancelRequest(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      PENDING: 'default',
      ACCEPTED: 'secondary',
      REJECTED: 'destructive',
      CANCELLED: 'destructive',
      COMPLETED: 'secondary',
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Breeding Requests</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No breeding requests found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">
                        {request.initiatorPet.name} × {request.targetPet.name}
                      </CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Initiator Pet */}
                      <div>
                        <h3 className="font-semibold mb-2">
                          {request.initiator.firstName}'s Pet
                        </h3>
                        {request.initiatorPet.images?.[0] && (
                          <img
                            src={request.initiatorPet.images[0]}
                            alt={request.initiatorPet.name}
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          {request.initiatorPet.name} - {request.initiatorPet.breed}
                        </p>
                        <p className="text-sm text-gray-500">
                          Owner: {request.initiator.firstName}{' '}
                          {request.initiator.lastName} ⭐ {request.initiator.rating}
                        </p>
                      </div>

                      {/* Target Pet */}
                      <div>
                        <h3 className="font-semibold mb-2">
                          {request.targetUser.firstName}'s Pet
                        </h3>
                        {request.targetPet.images?.[0] && (
                          <img
                            src={request.targetPet.images[0]}
                            alt={request.targetPet.name}
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          {request.targetPet.name} - {request.targetPet.breed}
                        </p>
                        <p className="text-sm text-gray-500">
                          Owner: {request.targetUser.firstName}{' '}
                          {request.targetUser.lastName} ⭐ {request.targetUser.rating}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{request.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      {request.status === 'PENDING' && activeTab === 'received' && (
                        <>
                          <Button
                            onClick={() => handleAccept(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {request.status === 'PENDING' && activeTab === 'sent' && (
                        <Button
                          onClick={() => handleCancel(request.id)}
                          variant="outline"
                        >
                          Cancel Request
                        </Button>
                      )}

                      {request.status === 'ACCEPTED' && (
                        <Button variant="outline">View Match Details</Button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
