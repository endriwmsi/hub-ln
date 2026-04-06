"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared";

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

type ServiceCardWithPriceProps = {
  service: ServiceWithPrice;
};

export function ServiceCardWithPrice({ service }: ServiceCardWithPriceProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{service.title}</CardTitle>
        {service.description && (
          <CardDescription className="line-clamp-2">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {/* Preço de custo */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Valor do Serviço:</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(service.costPrice)}
          </span>
        </div>
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
