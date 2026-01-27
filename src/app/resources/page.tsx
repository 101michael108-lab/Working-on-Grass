import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const resources = [
  {
    title: "Grass Identification Guide",
    description: "A practical guide to help you identify common veld and pasture grasses in Southern Africa.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
  {
    title: "Measuring Veld Productivity",
    description: "Learn a step-by-step method for conducting grazing assessments to determine the productivity of your veld.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
  {
    title: "Pasture Improvement Tips",
    description: "Discover simple, effective strategies for rehabilitating degraded land and improving pasture quality.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
  {
    title: "Sustainable Grazing Planning",
    description: "An overview of rotational grazing principles and how to create a sustainable plan for your livestock.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
  {
    title: "Disc Pasture Meter Instructions",
    description: "A detailed guide on how to correctly use the Disc Pasture Meter for accurate grass biomass measurements.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
   {
    title: "Problem Plant Control",
    description: "Strategies for identifying and managing invasive or problematic plants in your grasslands.",
    icon: FileText,
    ctaText: "Read More",
    ctaLink: "#"
  },
];


export default function ResourcesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Resources & Guides</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Practical tools and reference materials for sustainable grassland and veld management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((resource, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
               <div className="flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                   <resource.icon className="w-6 h-6 text-primary" />
                 </div>
                <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{resource.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <Button variant="outline" asChild className="w-full">
                    <Link href={resource.ctaLink}>
                        {resource.ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
       <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold">Need guidance for your specific land?</h2>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                While these guides are a great start, a professional assessment can provide tailored solutions for your unique challenges.
            </p>
            <div className="mt-8">
               <Button asChild size="lg">
                  <Link href="/contact?service=Professional+Assessment">Contact Frits for an Assessment</Link>
               </Button>
            </div>
          </div>
    </div>
  )
}
