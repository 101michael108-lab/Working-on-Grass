import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-frits');

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About Working on Grass</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Pioneering Regenerative Land Use in Africa
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
          <div className="prose max-w-none text-muted-foreground space-y-4">
            <p>
              Founded by renowned author and environmentalist Frits van Oudtshoorn, Working on Grass is an environmental and agricultural services company with a passion for sustainable land management. We are based in South Africa and serve clients across the continent.
            </p>
            <p>
              Our mission is to empower farmers, ranchers, and conservationists with the knowledge and tools to manage their grasslands effectively. We believe in a holistic approach that balances ecological health with economic viability, ensuring that land remains productive and resilient for generations to come. Through expert consultation, practical training, and high-quality products, we aim to be leaders in the shift towards regenerative agriculture in Africa.
            </p>
             <p>
              We specialize in veld condition assessments, grazing capacity planning, and the restoration of degraded landscapes. Our work is grounded in decades of scientific research and hands-on experience in the diverse ecosystems of Southern Africa.
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
                {aboutImage && (
                    <Image
                        src={aboutImage.imageUrl}
                        alt={aboutImage.description}
                        width={500}
                        height={500}
                        className="rounded-t-lg object-cover w-full aspect-[4/3]"
                        data-ai-hint={aboutImage.imageHint}
                    />
                )}
            </CardHeader>
            <CardContent>
                <CardTitle>Frits van Oudtshoorn</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Founder & Lead Consultant</p>
                <p className="mt-4 text-sm text-foreground/80">
                    Frits is a leading expert in grassland science with over 30 years of experience. He is the author of several acclaimed books on grass identification and veld management and is a sought-after speaker and trainer throughout Southern Africa.
                </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
