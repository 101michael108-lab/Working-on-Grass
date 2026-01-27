import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const blogPosts = [
  {
    title: "5 Key Grasses for Winter Grazing in the Highveld",
    description: "An in-depth look at resilient grass species that can provide crucial forage during the dry season.",
    date: "January 15, 2026",
    category: "Grazing Management"
  },
  {
    title: "Veld Assessment 101: Reading the Signs of a Healthy Grassland",
    description: "Learn the basics of what to look for when assessing the condition of your veld, from species composition to soil health.",
    date: "December 22, 2025",
    category: "Veld Assessment"
  },
  {
    title: "Case Study: Restoring a Degraded Pasture in Limpopo",
    description: "A step-by-step overview of a successful veld restoration project, including the methods used and results achieved.",
    date: "November 5, 2025",
    category: "Case Studies"
  },
  {
    title: "Using the Disc Pasture Meter for Accurate Biomass Measurement",
    description: "A practical guide to getting the most out of your Disc Pasture Meter for better grazing planning.",
    date: "October 18, 2025",
    category: "Tools & Techniques"
  },
];


export default function ResourcesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Resources & Insights</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Expert articles, guides, and case studies on sustainable grassland management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <p className="text-sm text-muted-foreground">{post.category} - {post.date}</p>
              <CardTitle className="text-xl">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{post.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="p-0">
                    <Link href="#">Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
