import { Pet } from '../App';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ModernButton, GradientButton } from './ui/ModernButton';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Shield, Heart, Info, Star, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { cardVariants } from '../../lib/animations';
import { usePremiumFeature } from '../hooks/usePremiumFeature';

interface PetCardProps {
  pet: Pet;
  onViewDetails: (pet: Pet) => void;
  onRequestMatch: (pet: Pet) => void;
  onSubscriptionNeeded?: () => void;
}

const getPetTypeEmoji = (type: string) => {
  switch (type) {
    case 'dog': return '🐕';
    case 'cat': return '🐱';
    case 'bird': return '🦜';
    default: return '🐾';
  }
};

const getPetTypeLabel = (type: string) => {
  switch (type) {
    case 'dog': return 'كلب';
    case 'cat': return 'قطة';
    case 'bird': return 'طائر';
    default: return 'حيوان أليف';
  }
};

export function PetCard({ pet, onViewDetails, onRequestMatch, onSubscriptionNeeded }: PetCardProps) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const { tryUseFeature } = usePremiumFeature({
    featureName: 'petMatching',
    onUpgradeNeeded: onSubscriptionNeeded || (() => {}),
  });

  const handleRequestMatch = () => {
    if (!tryUseFeature()) {
      return;
    }
    onRequestMatch(pet);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <Card className="relative rounded-2xl transition-all duration-300 bg-card border border-border shadow-md hover:shadow-2xl hover:-translate-y-1 overflow-hidden h-full">
        {/* Image Section with Overlay */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 h-56">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="animate-pulse text-4xl">{getPetTypeEmoji(pet.type)}</div>
            </div>
          )}
          <motion.img
            src={pet.images?.[0] || pet.image || ''}
            alt={pet.name}
            className={`w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">{getPetTypeEmoji(pet.type)}</div>
                <p className="text-xs text-gray-600">صورة غير متوفرة</p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          {pet.verified && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Badge className="badge-success gap-1.5 backdrop-blur-sm bg-green-500/90">
                <Shield className="w-3.5 h-3.5" />
                موثق
              </Badge>
            </motion.div>
          )}
          
          <Badge className="absolute top-3 right-3 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 text-foreground">
            {getPetTypeEmoji(pet.type)} {getPetTypeLabel(pet.type)}
          </Badge>

          {/* Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-xl text-white drop-shadow-lg">
              {pet.name}
            </h3>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Breed & Age */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {pet.breed} • {pet.age} {pet.age === 1 ? 'سنة' : 'سنوات'}
            </p>
            <Badge
              variant={pet.gender === 'male' ? 'default' : 'secondary'}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            >
              {pet.gender === 'male' ? 'ذكر' : 'أنثى'}
            </Badge>
          </div>

          {/* Info Items */}
          <div className="space-y-2.5">
            <motion.div
              className="flex items-center gap-2.5 text-sm"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground truncate">{pet.owner.address}</span>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2.5 text-sm"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">
                متاح من {new Date(pet.availability.from).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
              </span>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{pet.owner.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({pet.owner.totalMatches} تطابق)
              </span>
            </div>
            
            <Badge variant="outline" className="badge-success border-green-300">
              <Shield className="w-3 h-3 mr-1" />
              {pet.vaccinations.length} لقاح
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex gap-2.5">
          <ModernButton
            variant="outline"
            size="md"
            icon={Info}
            className="flex-1"
            onClick={() => onViewDetails(pet)}
          >
            التفاصيل
          </ModernButton>
          
          <GradientButton
            size="md"
            icon={Heart}
            className="flex-1"
            onClick={handleRequestMatch}
          >
            طلب تزاوج
          </GradientButton>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
