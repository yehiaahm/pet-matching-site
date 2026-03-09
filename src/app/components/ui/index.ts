import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

// Create missing UI components if they don't exist
const createButton = () => {
  console.log('Creating Button component...');
  return {
    default: Button
  };
};

const createCard = () => {
  console.log('Creating Card component...');
  return {
    default: Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  };
};

const createBadge = () => {
  console.log('Creating Badge component...');
  return {
    default: Badge
  };
};

const createInput = () => {
  console.log('Creating Input component...');
  return {
    default: Input
  };
};

export { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Input };
export { createButton, createCard, createBadge, createInput };
