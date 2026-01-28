
"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, Library } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import type { Product } from "@/lib/types"

export default function CoursesPage() {
  const { addToCart } = useCart()
  const firestore = useFirestore()
  const coursesQuery = useMemoFirebase(() => query(collection(firestore, 'products'), where('category', '==', 'Online Courses'), orderBy('name')), [firestore]);
  const { data: courses, isLoading } = useCollection<Omit<Product, 'id'>>(coursesQuery);

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Online Courses & Training</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Learn from leading expert Frits van Oudtshoorn at your own pace. Our online courses provide in-depth knowledge on sustainable veld and pasture management.
        </p>
      </div>

      {isLoading && <p className="text-center">Loading courses...</p>}

      {!isLoading && courses && courses.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <Card key={course.id} className="flex flex-col group">
                <CardHeader>
                    <Link href={`/shop/${course.id}`}>
                    <div className="aspect-video bg-secondary/50 rounded-md overflow-hidden flex items-center justify-center">
                        <Image
                        src={course.image || `https://picsum.photos/seed/${course.id}/400/225`}
                        alt={course.name}
                        width={400}
                        height={225}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        data-ai-hint={course.imageHint}
                        />
                    </div>
                    </Link>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Link href={`/shop/${course.id}`}>
                    <CardTitle className="text-xl hover:text-primary transition-colors">{course.name}</CardTitle>
                    </Link>
                    <CardDescription className="mt-2 text-sm">{course.description.substring(0,120)}...</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                     <p className="text-2xl font-bold text-accent">
                        R{course.price.toFixed(2)}
                    </p>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => addToCart(course, 1)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
         <div className="text-center text-muted-foreground py-20">
            <Card className="max-w-md mx-auto">
                <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Library className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Courses Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>We are working hard to bring our expert-led courses online. Please check back later or contact us to be notified when they become available.</p>
                </CardContent>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/contact?service=Online+Course+Inquiry">Register Your Interest</Link>
                    </Button>
                 </CardFooter>
            </Card>
        </div>
      )}
    </div>
  )
}
