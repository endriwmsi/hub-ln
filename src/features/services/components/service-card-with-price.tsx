"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { ServiceWithPrice } from "../actions";
import { ResalePriceDialog } from "./resale-price-dialog";

type ServiceCardWithPriceProps = {
  service: ServiceWithPrice;
  onPriceUpdated?: () => void;
};

export function ServiceCardWithPrice({
  service,
  onPriceUpdated,
}: ServiceCardWithPriceProps) {
  const hasResalePrice = service.resalePrice !== null;
  const displayPrice = service.resalePrice || service.costPrice;
  const commission = Number(service.commissionPerItem);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{service.title}</CardTitle>
          {hasResalePrice && commission > 0 && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              +{formatCurrency(service.commissionPerItem)}/nome
            </Badge>
          )}
        </div>
        {service.description && (
          <CardDescription className="line-clamp-2">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {/* Preço de custo */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Seu custo:</span>
          <span className="font-medium">
            {formatCurrency(service.costPrice)}
          </span>
        </div>

        {/* Preço de revenda */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Preço de revenda:
          </span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(displayPrice)}
          </span>
        </div>

        {/* Botão editar preço */}
        <ResalePriceDialog
          serviceId={service.id}
          serviceTitle={service.title}
          costPrice={service.costPrice}
          currentResalePrice={service.resalePrice}
          onSuccess={onPriceUpdated}
        />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/servicos/solicitar/${service.slug}`}>
            Solicitar Serviço
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
