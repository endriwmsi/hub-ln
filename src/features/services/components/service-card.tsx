"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/core/db/schema";
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

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{service.title}</CardTitle>
        {service.description && (
          <CardDescription className="line-clamp-2">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(service.basePrice)}
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
