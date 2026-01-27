import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/lib/data";
import { Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function ServicesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Advisory Services</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          We provide a comprehensive range of expert advisory and consultation services on topics related to veld and grazing management, led by Frits van Oudtshoorn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{service.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
                        Request a Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
