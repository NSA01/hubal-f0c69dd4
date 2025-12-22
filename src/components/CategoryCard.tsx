import { Link } from 'react-router-dom';
import { Palette, LucideIcon } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, LucideIcon> = {
  Palette: Palette,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Palette;

  return (
    <Link to={`/customer/designers?category=${category.id}`}>
      <div className="card-premium p-6 text-center animate-scale-in hover:scale-[1.02] transition-transform duration-300">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-bold text-lg text-foreground mb-2">
          {category.nameAr}
        </h3>
        <p className="text-sm text-muted-foreground">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
