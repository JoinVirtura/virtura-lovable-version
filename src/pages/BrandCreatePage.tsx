import { useNavigate } from 'react-router-dom';
import { BrandForm } from '@/components/brands/BrandForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrandCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/brands')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brands
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Brand</h1>
          <p className="text-muted-foreground">
            Set up your brand profile to start creating and managing content
          </p>
        </div>

        <BrandForm
          onSuccess={() => navigate('/brands')}
          onCancel={() => navigate('/brands')}
        />
      </div>
    </div>
  );
}
