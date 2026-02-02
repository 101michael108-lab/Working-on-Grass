
"use client";

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/admin/products');
    };

    return (
        <div>
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/admin/products">
                    <ArrowLeft className="mr-2" />
                    Back to Products
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>Fill in the details for your new product.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </div>
    );
}
