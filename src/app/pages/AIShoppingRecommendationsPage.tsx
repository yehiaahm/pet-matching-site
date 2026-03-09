import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Pill, UtensilsCrossed, Dog, Cat, Bird } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Pet } from '../App';

interface RecommendationItem {
  title: string;
  reason: string;
  category: 'FOOD' | 'TOYS' | 'ACCESSORIES' | 'MEDICAL' | 'GROOMING';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
}

interface RecommendationBundle {
  items: RecommendationItem[];
  summary: string;
}

function getTypeIcon(type: string) {
  if (type === 'dog') return Dog;
  if (type === 'cat') return Cat;
  return Bird;
}

function daysSince(dateValue?: string): number | null {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  const diff = Date.now() - parsed.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function buildRecommendations(pet: Pet): RecommendationBundle {
  const type = pet.type;
  const age = pet.age;
  const vaccinationCount = pet.vaccinations?.length || 0;
  const lastHealthCheckDays = daysSince(pet.healthCheck?.date);
  const needsHealthAttention = lastHealthCheckDays == null || lastHealthCheckDays > 180;
  const isYoung = age <= 2;

  const common: RecommendationItem[] = [
    {
      title: 'Premium Food',
      reason: isYoung
        ? 'Growth-stage nutrition to support bones, immunity, and healthy development.'
        : 'Balanced nutrition to support daily health and energy.',
      category: 'FOOD',
      priority: 'HIGH',
      confidence: 92,
    },
    {
      title: needsHealthAttention ? 'Veterinary Wellness Package' : 'Home Health Check Kit',
      reason: needsHealthAttention
        ? 'No recent health check found, so medical review is recommended soon.'
        : 'Routine monitoring essentials to maintain healthy status.',
      category: 'MEDICAL',
      priority: needsHealthAttention ? 'HIGH' : 'MEDIUM',
      confidence: needsHealthAttention ? 95 : 82,
    },
  ];

  if (vaccinationCount === 0) {
    common.push({
      title: 'Vaccination Reminder Bundle',
      reason: 'No vaccination records detected for this pet profile.',
      category: 'MEDICAL',
      priority: 'HIGH',
      confidence: 97,
    });
  }

  if (type === 'dog') {
    const items = [
      ...common,
      {
        title: isYoung ? 'Teething Chew Toy' : 'Interactive Puzzle Toy',
        reason: isYoung ? 'Supports healthy chewing behavior for young dogs.' : 'Mental stimulation and activity enrichment.',
        category: 'TOYS' as const,
        priority: 'MEDIUM' as const,
        confidence: 85,
      },
      {
        title: 'Comfort Harness',
        reason: 'Safer walks and better control during outdoor activities.',
        category: 'ACCESSORIES' as const,
        priority: 'MEDIUM' as const,
        confidence: 84,
      },
    ];

    return {
      items,
      summary: `AI analyzed ${pet.name}: ${items.length} personalized suggestions generated for dog profile.`,
    };
  }

  if (type === 'cat') {
    const items = [
      ...common,
      {
        title: 'Scratching Post',
        reason: 'Supports natural scratching behavior and protects furniture.',
        category: 'TOYS' as const,
        priority: 'MEDIUM' as const,
        confidence: 88,
      },
      {
        title: 'Soft Grooming Brush',
        reason: 'Helps reduce shedding and keeps coat healthy.',
        category: 'GROOMING' as const,
        priority: 'LOW' as const,
        confidence: 80,
      },
    ];

    return {
      items,
      summary: `AI analyzed ${pet.name}: ${items.length} personalized suggestions generated for cat profile.`,
    };
  }

  const items = [
    ...common,
    {
      title: 'Enrichment Perch Set',
      reason: 'Encourages movement and activity inside the cage area.',
      category: 'ACCESSORIES' as const,
      priority: 'MEDIUM' as const,
      confidence: 86,
    },
    {
      title: 'Bird Mineral Supplement',
      reason: 'Supports feather and bone health.',
      category: 'MEDICAL' as const,
      priority: 'MEDIUM' as const,
      confidence: 87,
    },
  ];

  return {
    items,
    summary: `AI analyzed ${pet.name}: ${items.length} personalized suggestions generated for bird profile.`,
  };
}

export default function AIShoppingRecommendationsPage() {
  const navigate = useNavigate();
  const { pets, loading } = usePets();

  const openCategory = (category: RecommendationItem['category']) => {
    navigate(`/marketplace?category=${category}`);
  };

  const openSuggestedProduct = (item: RecommendationItem) => {
    const params = new URLSearchParams({
      category: item.category,
      q: item.title,
    });
    navigate(`/marketplace?${params.toString()}`);
  };

  const petRecommendations = useMemo(
    () =>
      pets.map((pet) => ({
        pet,
        ...buildRecommendations(pet),
      })),
    [pets]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              AI Shopping Recommendations
            </h1>
            <p className="text-gray-600 mt-1">اقتراحات ذكية للمنتجات المناسبة لكل حيوان عندك.</p>
          </div>
          <Button onClick={() => navigate('/marketplace')} className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            Open Marketplace
          </Button>
        </div>

        {loading && <p className="text-gray-600">Loading pets...</p>}

        {!loading && petRecommendations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              Add your first pet to get AI shopping recommendations.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {petRecommendations.map(({ pet, items, summary }) => {
            const TypeIcon = getTypeIcon(pet.type);

            return (
              <Card key={pet.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TypeIcon className="w-5 h-5 text-blue-600" />
                    {pet.name} ({pet.breed})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                    {summary}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {items.map((item, index) => (
                      <button
                        key={`${pet.id}-${index}`}
                        type="button"
                        className="rounded-lg border border-gray-200 p-3 bg-white text-left hover:border-blue-400 hover:shadow-sm transition-all"
                        onClick={() => openSuggestedProduct(item)}
                      >
                        <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                        <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                        <div className="text-xs text-blue-700 font-medium">Category: {item.category}</div>
                        <div className="text-xs mt-1 text-gray-700">Priority: {item.priority}</div>
                        <div className="text-xs text-gray-700">Confidence: {item.confidence}%</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          onClick={(event) => {
                            event.stopPropagation();
                            openCategory(item.category);
                          }}
                        >
                          Shop This Category
                        </Button>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/marketplace')}>Browse Products</Button>
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => navigate('/marketplace')}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      Shop by Need
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => navigate('/health-records')}
                    >
                      <Pill className="w-4 h-4" />
                      Review Health
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
