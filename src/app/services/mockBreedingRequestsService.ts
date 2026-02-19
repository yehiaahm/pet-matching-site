/**
 * Mock Breeding Requests Service
 * Simulates breeding requests API with realistic data
 */

export interface BreedingRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  initiator: {
    firstName: string;
    lastName: string;
    avatar: string;
    rating: number;
  };
  initiatorPet: {
    name: string;
    breed: string;
    images: string[];
  };
  targetUser: {
    firstName: string;
    lastName: string;
    avatar: string;
    rating: number;
  };
  targetPet: {
    name: string;
    breed: string;
    images: string[];
  };
  message: string;
  createdAt: string;
}

class MockBreedingRequestsService {
  private mockRequests: BreedingRequest[] = [
    {
      id: 'req-1',
      status: 'PENDING',
      initiator: {
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 4.8
      },
      initiatorPet: {
        name: 'Max',
        breed: 'Golden Retriever',
        images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      targetUser: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c1ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 4.9
      },
      targetPet: {
        name: 'Bella',
        breed: 'Golden Retriever',
        images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      message: 'Hi! I think Max and Bella would make a great match. Both are healthy Golden Retrievers with excellent bloodlines.',
      createdAt: '2024-12-15T10:30:00Z'
    },
    {
      id: 'req-2',
      status: 'ACCEPTED',
      initiator: {
        firstName: 'Fatma',
        lastName: 'Hassan',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 5.0
      },
      initiatorPet: {
        name: 'Luna',
        breed: 'Persian',
        images: ['https://images.unsplash.com/photo-1585137173132-cf49e10ad27d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      targetUser: {
        firstName: 'Nora',
        lastName: 'Ibrahim',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 4.6
      },
      targetPet: {
        name: 'Mittens',
        breed: 'Siamese',
        images: ['https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      message: 'Beautiful Siamese cat! Luna has champion bloodline and recent health check.',
      createdAt: '2024-12-14T14:20:00Z'
    },
    {
      id: 'req-3',
      status: 'PENDING',
      initiator: {
        firstName: 'Mohamed',
        lastName: 'Said',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 4.7
      },
      initiatorPet: {
        name: 'Rocky',
        breed: 'German Shepherd',
        images: ['https://images.unsplash.com/photo-1605725657590-b2cf0d31b1a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      targetUser: {
        firstName: 'Mahmoud',
        lastName: 'Khaled',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=150',
        rating: 4.8
      },
      targetPet: {
        name: 'Charlie',
        breed: 'Labrador',
        images: ['https://images.unsplash.com/photo-1583337134409-60d4326b91c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjU1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080']
      },
      message: 'Rocky is a strong, healthy German Shepherd with excellent temperament. Would love to breed with Charlie!',
      createdAt: '2024-12-13T09:15:00Z'
    }
  ];

  async fetchRequests(type: 'received' | 'sent' | 'all' = 'all'): Promise<{ data: BreedingRequest[] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    console.log(`📋 Fetching ${type} breeding requests`);

    let filteredRequests = this.mockRequests;

    if (type === 'received') {
      // For demo, show requests where user is the target
      filteredRequests = this.mockRequests.slice(0, 2);
    } else if (type === 'sent') {
      // For demo, show requests where user is the initiator
      filteredRequests = this.mockRequests.slice(2, 3);
    }

    return { data: filteredRequests };
  }

  async acceptRequest(requestId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const request = this.mockRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'ACCEPTED';
      console.log(`✅ Request ${requestId} accepted`);
    }
  }

  async rejectRequest(requestId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const request = this.mockRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'REJECTED';
      console.log(`❌ Request ${requestId} rejected`);
    }
  }

  async cancelRequest(requestId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const request = this.mockRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'CANCELLED';
      console.log(`🚫 Request ${requestId} cancelled`);
    }
  }
}

export const mockBreedingRequestsService = new MockBreedingRequestsService();
