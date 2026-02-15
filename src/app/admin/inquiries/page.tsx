
"use client";

import React, { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, query, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Mail, Phone, MapPin, Calendar, MessageSquare } from "lucide-react";
import type { Inquiry } from "@/lib/types";

export default function AdminInquiriesPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    const fetchAllInquiries = async () => {
        if (!firestore) return;
        setIsLoading(true);
        
        try {
            // Fetch from both collections
            const contactSnap = await getDocs(query(collection(firestore, 'contactFormEntries'), orderBy('submissionDate', 'desc')));
            const consultSnap = await getDocs(query(collection(firestore, 'consultationRequests'), orderBy('submissionDate', 'desc')));

            const allInquiries: Inquiry[] = [
                ...contactSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'contact' as const } as Inquiry)),
                ...consultSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'consultation' as const } as Inquiry))
            ];

            // Sort by date
            allInquiries.sort((a, b) => b.submissionDate?.toMillis() - a.submissionDate?.toMillis());

            setInquiries(allInquiries);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllInquiries();
    }, [firestore]);

    const handleDelete = async (id: string, type: 'contact' | 'consultation') => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        
        const col = type === 'contact' ? 'contactFormEntries' : 'consultationRequests';
        try {
            await deleteDoc(doc(firestore, col, id));
            setInquiries(prev => prev.filter(i => i.id !== id));
            toast({ title: "Inquiry Deleted" });
        } catch (e) {
            toast({ variant: "destructive", title: "Delete Failed" });
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Leads & Inquiries</CardTitle>
                    <CardDescription>Direct contact submissions and assessment requests from potential clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p>Loading inquiries...</p>}
                    {!isLoading && inquiries.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-md">
                            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                            <p className="mt-2 text-muted-foreground">No leads found yet.</p>
                        </div>
                    )}
                    {!isLoading && inquiries.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Interest</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map(inquiry => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="text-xs">
                                            {inquiry.submissionDate ? new Date(inquiry.submissionDate.toDate()).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={inquiry.type === 'consultation' ? 'default' : 'secondary'}>
                                                {inquiry.type === 'consultation' ? 'Assessment' : 'Contact'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {inquiry.serviceInterestedIn || inquiry.service || 'General'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedInquiry(inquiry)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(inquiry.id, inquiry.type)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Lead Detail: {selectedInquiry?.name}</DialogTitle>
                        <DialogDescription>
                            Submitted via {selectedInquiry?.type} form on {selectedInquiry?.submissionDate ? new Date(selectedInquiry.submissionDate.toDate()).toLocaleString() : 'N/A'}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedInquiry && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Contact Detail</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span>{selectedInquiry.email || selectedInquiry.contactDetail}</span>
                                    </div>
                                    {selectedInquiry.phone && (
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span>{selectedInquiry.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Location</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{selectedInquiry.location || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Interested In</p>
                                <div className="bg-secondary/30 p-3 rounded border text-sm font-medium">
                                    {selectedInquiry.serviceInterestedIn || selectedInquiry.service || 'General Inquiry'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Message / Requirements</p>
                                <div className="bg-muted/50 p-4 rounded border text-sm italic whitespace-pre-wrap leading-relaxed">
                                    {selectedInquiry.message || selectedInquiry.needs || 'No additional details provided.'}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
                                <Button asChild>
                                    <a href={`mailto:${selectedInquiry.email || selectedInquiry.contactDetail}`}>Reply via Email</a>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
