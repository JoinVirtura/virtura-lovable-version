import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Bronze',
    price: 499,
    description: 'Support your favorite creator',
    features: [
      'Exclusive updates',
      'Early access to content',
      'Supporter badge',
    ],
  },
  {
    name: 'Silver',
    price: 999,
    description: 'Get more exclusive perks',
    features: [
      'All Bronze benefits',
      'Behind-the-scenes content',
      'Monthly Q&A sessions',
      'Silver supporter badge',
    ],
    popular: true,
  },
  {
    name: 'Gold',
    price: 1999,
    description: 'Premium access to everything',
    features: [
      'All Silver benefits',
      'One-on-one monthly video call',
      'Custom content requests',
      'Gold supporter badge',
      'Priority support',
    ],
  },
];

export function SubscriptionTiers() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Subscription Tiers</h3>
        <p className="text-sm text-muted-foreground">
          Your fans can subscribe to support you and get exclusive perks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.popular ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription className="mt-1">{tier.description}</CardDescription>
                </div>
                {tier.popular && (
                  <Badge variant="default">Popular</Badge>
                )}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">${(tier.price / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
