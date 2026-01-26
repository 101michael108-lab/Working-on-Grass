"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
    const firestore = useFirestore();
    const usersQuery = useMemoFirebase(() => query(collection(firestore, 'users'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: users, isLoading } = useCollection<Omit<User, 'id'>>(usersQuery);
    
    return (
        <Card>
        <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage registered user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && <p>Loading users...</p>}
            {!isLoading && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Date Registered</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                <TableCell>{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>{user.role}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
        </Card>
    )
}